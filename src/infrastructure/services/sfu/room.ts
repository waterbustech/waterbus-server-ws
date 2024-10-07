import {
  Kind,
  useAbsSendTime,
  useSdesMid,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'werift';
import { sleep } from './utils/helper';
import { Media } from './entities/media';
import { PeerConnection } from './entities/peer';
import {
  answerType,
  codecsSupported,
  debugConfig,
  kOpusCodec,
  offerType,
} from '../../../domain/constants/webrtc_config';
import Participant from './entities/participant';
import { Logger } from '@nestjs/common';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environments';
import { SocketGateway } from 'src/infrastructure/gateways/socket/socket.gateway';
import SocketEvent from 'src/domain/constants/socket_events';
import {
  MediaStreamTrack,
  // MediaRecorder,
} from 'werift';
import { RecordTrack } from 'src/domain/models/record-track';

export class Room {
  private participants: Record<string, Participant> = {};
  private subscribers: Record<string, PeerConnection> = {};
  public recordId: number;
  private records: RecordTrack[] = [];
  private logger: Logger;

  constructor(
    private readonly environment: EnvironmentConfigService,
    private readonly serverSocket: SocketGateway,
    private readonly roomId: string,
  ) {
    this.logger = new Logger(Room.name);
  }

  async join(
    sdp: string,
    isVideoEnabled: boolean,
    isAudioEnabled: boolean,
    isE2eeEnabled: boolean,
    participantId: string,
    { callback }: { callback: () => void },
  ) {
    try {
      let hasEmitNewParticipantJoined = false;

      const peer = new PeerConnection({
        iceServers: this.environment.getIceServers(),
        headerExtensions: {
          video: [useSdesMid(), useAbsSendTime()],
          audio: [useSdesMid(), useAbsSendTime()],
        },
        iceUseIpv4: true,
        iceUseIpv6: true,
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        codecs: codecsSupported,
        debug: debugConfig,
      });

      this.participants[participantId] = {
        peer: peer,
        media: this.createMedia(
          participantId,
          isVideoEnabled,
          isAudioEnabled,
          isE2eeEnabled,
          peer,
        ),
      };

      peer.onconnectionstatechange = () => {
        this.logger.log(
          `[PEER STATE]: ${participantId}_${peer.connectionState}`,
        );

        if (peer.connectionState == 'connected') {
          if (hasEmitNewParticipantJoined) return;
          hasEmitNewParticipantJoined = true;
          callback();
        }
      };

      peer.ontrack = async ({ streams, track }) => {
        if (
          track.kind !== 'application' &&
          streams.length > 0 &&
          streams[0].id != '-'
        ) {
          const isTrackAdded = this.participants[participantId].media.addTrack(
            track,
            streams[0],
            this.serverSocket,
            this.roomId,
          );

          if (isTrackAdded) {
            this.addTrackToSubscribersPeer(track, participantId);
          }

          const media = this.participants[participantId].media;

          if (media.tracks.length > 1 && this.recordId) {
            const videoPath = media.startRecord();

            this._addRecordTrack({
              participantId: Number(participantId),
              videoPath,
            });
          }
        } else {
          sleep(100);
        }
      };

      const offer = new RTCSessionDescription(sdp, offerType);
      await peer.setRemoteDescription(offer);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      return {
        otherParticipants: this.getOtherParticipants(participantId),
        offer: peer.localDescription.sdp,
      };
    } catch (error) {
      this.logger.error(
        `[JOIN ROOM]: fail with error ${error}`,
      );
    }
  }

  async subscribe(
    targetId: string,
    participantId: string,
    socketId: string,
    {
      gotIceCandidate,
    }: { gotIceCandidate: (candidate: RTCIceCandidate) => void },
  ) {
    const targetMedia = this.getMedia(targetId);

    if (!targetMedia) return;

    const peerId = this.getSubscriberPeerId(targetId, participantId);
    const peer = new PeerConnection({
      iceServers: this.environment.getIceServers(),
      headerExtensions: {
        video: [useSdesMid(), useAbsSendTime()],
        audio: [useSdesMid(), useAbsSendTime()],
      },
      iceUseIpv4: true,
      iceUseIpv6: true,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      codecs: {
        audio: [kOpusCodec],
        video: targetMedia.videoCodecs(),
      },
      debug: debugConfig,
    });

    this.addSubscriber(peerId, peer);

    peer.onnegotiationneeded = async () => {
      const media = this.getMedia(targetId);

      if (media.tracks.length < 3) return;

      const offer = await peer.createOffer();

      await peer.setLocalDescription(offer);

      this.serverSocket.server
        .to(socketId)
        .emit(SocketEvent.subscriberRenegotiationSSC, {
          targetId: targetId,
          sdp: offer.sdp,
        });
    };

    peer.onicecandidate = ({ candidate }) => {
      gotIceCandidate(candidate);

      this.logger.log(`[GOT CANDIDATE]: ${peerId}`);
    };

    // Add track to subscriber peer
    targetMedia.tracks.forEach((track) => {
      peer.addTrack(track.track, track.ms);
    });

    const offer = await peer.createOffer();

    await peer.setLocalDescription(offer);

    return {
      offer: offer.sdp,
      cameraType: targetMedia.cameraType,
      videoEnabled: targetMedia.videoEnabled,
      audioEnabled: targetMedia.audioEnabled,
      isScreenSharing: targetMedia.isScreenSharing,
      isE2eeEnabled: targetMedia.isE2eeEnabled,
      videoCodec: targetMedia.codec,
    };
  }

  async setSubscriberRemoteDescription(
    targetId: string,
    participantId: string,
    sdp: string,
  ) {
    const peer = this.getSubscriberPeer(targetId, participantId);

    if (peer == null) return;

    const answer = new RTCSessionDescription(sdp, answerType);
    await peer.setRemoteDescription(answer);

    this.logger.log(
      `[ADDED REMOTE DESCRIPTION]: ${this.getSubscriberPeerId(
        targetId,
        participantId,
      )}`,
    );
  }

  async handlePublisherRenegotiation(
    participantId: string,
    sdp: string,
  ): Promise<string | null> {
    const participant = this.participants[participantId];

    if (!participant) return;

    const peer = participant.peer;

    const offer = new RTCSessionDescription(sdp, offerType);

    await peer.setRemoteDescription(offer);

    const answer = await peer.createAnswer();

    await peer.setLocalDescription(answer);

    return peer.localDescription.sdp;
  }

  async addPublisherIceCandidate(
    participantId: string,
    candidate: RTCIceCandidate,
  ) {
    const participant = this.participants[participantId];

    if (!participant) return;

    const peer = participant.peer;

    await peer.addIceCandidate(candidate);
    this.logger.log(`[ADDED CANDIDATE]: publisher_${participantId}`);
  }

  async addSubscriberIceCandidate(
    targetId: string,
    participantId: string,
    candidate: RTCIceCandidate,
  ) {
    const peer = this.getSubscriberPeer(targetId, participantId);

    if (peer == null) return;

    await peer.addIceCandidate(candidate);
    this.logger.log(
      `[ADDED CANDIDATE]: ${this.getSubscriberPeerId(targetId, participantId)}`,
    );
  }

  getOtherParticipants(participantId: string): string[] {
    return Object.keys(this.participants).filter((id) => id != participantId);
  }

  setE2eeEnabled(participantId: string, isEnabled: boolean) {
    if (!this.participants[participantId]) return;

    this.participants[participantId].media.setE2eeEnabled(isEnabled);
  }

  setCameraType(participantId: string, type: number) {
    if (!this.participants[participantId]) return;

    this.participants[participantId].media.setCameraType(type);
  }

  setVideoEnabled(participantId: string, isEnabled: boolean) {
    if (!this.participants[participantId]) return;

    this.participants[participantId].media.setVideoEnabled(isEnabled);
  }

  setAudioEnabled(participantId: string, isEnabled: boolean) {
    if (!this.participants[participantId]) return;

    this.participants[participantId].media.setAudioEnabled(isEnabled);
  }

  setScreenSharing(participantId: string, isSharing: boolean) {
    if (!this.participants[participantId]) return;

    this.participants[participantId].media.setScreenSharing(isSharing);
  }

  startRecord({ recordId }: { recordId: number }) {
    if (this.recordId) return;

    this.recordId = recordId;

    for (const key in this.participants) {
      if (this.participants.hasOwnProperty(key)) {
        const participant = this.participants[key];
        const videoPath = participant.media.startRecord();

        this._addRecordTrack({ participantId: Number(key), videoPath });
      }
    }
  }

  stopRecord() {
    if (!this.recordId) return;

    const recordId = this.recordId;

    this.recordId = null;

    console.log('Stop Record...');

    for (const key in this.participants) {
      if (this.participants.hasOwnProperty(key)) {
        this.participants[key].media.stopRecord();
      }
    }

    let tracks = [];

    for (const track of this.records) {
      tracks.push({
        participantId: track.participantId,
        urlToVideos: track.videoPath,
      });
    }

    const res = {
      recordId: recordId,
      tracks: tracks,
    };

    if (!tracks) return null;

    this.records = [];

    return res;
  }

  async leave(participantId: string) {
    this.logger.log(`[IN_ROOM] ${participantId} has left`);
    this.removeAllSubscribersWithTargetId(participantId);

    const media = this.getMedia(participantId);

    if (media) {
      await media.stop();
    }

    delete this.participants[participantId];
  }

  private _addRecordTrack({
    participantId,
    videoPath,
  }: {
    participantId: number;
    videoPath: string;
  }) {
    if (!this.recordId) return;

    const track: RecordTrack = {
      participantId,
      videoPath,
    };

    this.records.push(track);
  }

  private getSubscriberPeer(
    targetId: string,
    participantId: string,
  ): PeerConnection | null {
    const peer =
      this.subscribers[this.getSubscriberPeerId(targetId, participantId)];

    return peer;
  }

  // MARK: private
  private createMedia(
    publisherId: string,
    isVideoEnabled: boolean,
    isAudioEnabled: boolean,
    isE2eeEnabled: boolean,
    peer: PeerConnection,
  ): Media {
    const media = new Media(
      publisherId,
      isVideoEnabled,
      isAudioEnabled,
      isE2eeEnabled,
    );

    const transceiver = peer.addTransceiver('video', { direction: 'recvonly' });
    media.initAV(transceiver);

    return media;
  }

  private getMedia(participantId: string): Media | null {
    const participant = this.participants[participantId];

    if (!participant) return null;

    return participant.media;
  }

  // MARK: private related to subscribers
  private addTrackToSubscribersPeer(track: MediaStreamTrack, targetId: string) {
    const prefixTrackId = this.getSubscribersPrefixPeerId(targetId);
    const peerIds = Object.keys(this.subscribers).filter((trackId) =>
      trackId.startsWith(prefixTrackId),
    );

    if (!peerIds) return;

    for (const peerId of peerIds) {
      const pc: PeerConnection = this.subscribers[peerId];
      pc.addTrack(track);
    }
  }

  private getSubscriberPeerId(
    targetId: string,
    participantId: string,
  ): string | null {
    return `p_${targetId}_${participantId}`;
  }

  private getSubscribersPrefixPeerId(targetId: string): string | null {
    return `p_${targetId}_`;
  }

  private addSubscriber(peerId: string, peer: PeerConnection) {
    this.subscribers[peerId] = peer;
  }

  private removeAllSubscribersWithTargetId(participantId: string) {
    for (const key in Object.keys(this.subscribers)) {
      if (key.startsWith(`p_${participantId}`)) {
        delete this.subscribers[key];
      }
    }
  }
}

export type CreateMediaRequest = { kind: Kind; simulcast: boolean };
