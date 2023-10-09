import {
  Kind,
  useAbsSendTime,
  useSdesMid,
  useSdesRTPStreamId,
  RTCSessionDescription,
  RTCIceCandidate,
} from "werift";

import { sleep } from "./utils/helper";
import { Media } from "./domain/entities/media";
import { PeerConnection } from "./domain/entities/peer";
import {
  answerType,
  codecsSupported,
  debugConfiguration,
  iceServers,
  offerType,
} from "../../constants/webrtc_config";
import Participant from "./domain/entities/participant";
import logger from "../../helpers/logger";

export class Room {
  private participants: Record<string, Participant> = {};
  private subscribers: Record<string, PeerConnection> = {};

  async join(
    sdp: string,
    participantId: string,
    { callback }: { callback: () => void }
  ) {
    try {
      let hasEmitNewParticipantJoined = false;

      const peer = new PeerConnection({
        iceServers: iceServers,
        headerExtensions: {
          video: [useSdesMid(), useAbsSendTime()],
          audio: [useSdesMid(), useAbsSendTime()],
        },
        codecs: codecsSupported,
        iceUseIpv4: true,
        iceUseIpv6: true,
        iceTransportPolicy: "all",
        bundlePolicy: "max-bundle",
      });

      this.participants[participantId] = {
        peer: peer,
        media: this.createMedia(participantId, peer),
      };

      peer.onconnectionstatechange = () => {
        logger.info(`[PEER STATE]: ${participantId}_${peer.connectionState}`);

        if (peer.connectionState == "connected") {
          if (hasEmitNewParticipantJoined) return;
          hasEmitNewParticipantJoined = true;
          callback();
        }
      };

      peer.ontrack = async ({ streams, track }) => {
        if (
          track.kind !== "application" &&
          streams.length > 0 &&
          streams[0].id != "-"
        ) {
          logger.info(`[NEW TRACK]: track info
          kind: ${track.kind}
          codec: ${track.codec.mimeType}`);
          this.participants[participantId].media.addTrack(track);
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
      logger.error(`[JOIN ROOM]: fail with error ${JSON.stringify(error)}`);
    }
  }

  async subscribe(
    targetId: string,
    parcipantId: string,
    {
      gotIceCandidate,
    }: { gotIceCandidate: (candidate: RTCIceCandidate) => void }
  ) {
    const targetMedia = this.getMedia(targetId);

    if (!targetMedia) return;

    const peerId = this.getSubscriberPeerId(targetId, parcipantId);
    const peer = new PeerConnection({
      iceServers: iceServers,
      headerExtensions: {
        video: [useSdesMid(), useAbsSendTime()],
        audio: [useSdesMid(), useAbsSendTime()],
      },
      codecs: codecsSupported,
      iceUseIpv4: true,
      iceUseIpv6: true,
      iceTransportPolicy: "all",
      bundlePolicy: "max-bundle",
    });

    this.addSubscriber(peerId, peer);

    peer.onicecandidate = ({ candidate }) => {
      gotIceCandidate(candidate);

      logger.info(`[GOT CANDIDATE]: ${peerId}`);
    };

    // Add track to subscriber peer
    targetMedia.tracks.forEach((track) => {
      peer.addTrack(track.track);
    });

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    return offer.sdp;
  }

  async setSubscriberDescriptionSubscriber(
    targetId: string,
    parcipantId: string,
    sdp: string
  ) {
    const peer = this.getSubscriberPeer(targetId, parcipantId);

    if (peer == null) return;

    const answer = new RTCSessionDescription(sdp, answerType);
    await peer.setRemoteDescription(answer);

    logger.info(
      `[ADDED REMOTE DESCRIPTION]: ${this.getSubscriberPeerId(
        targetId,
        parcipantId
      )}`
    );
  }

  async addPublisherIceCandidate(
    participantId: string,
    candidate: RTCIceCandidate
  ) {
    const participant = this.participants[participantId];

    if (!participant) return;

    const peer = participant.peer;

    await peer.addIceCandidate(candidate);
    logger.info(`[ADDED CANDIDATE]: publisher_${participantId}`);
  }

  async addSubscriberIceCandidate(
    targetId: string,
    parcipantId: string,
    candidate: RTCIceCandidate
  ) {
    const peer = this.getSubscriberPeer(targetId, parcipantId);

    if (peer == null) return;

    await peer.addIceCandidate(candidate);
    logger.info(
      `[ADDED CANDIDATE]: ${this.getSubscriberPeerId(targetId, parcipantId)}`
    );
  }

  getOtherParticipants(participantId): string[] {
    return Object.keys(this.participants).filter((id) => id != participantId);
  }

  async leave(participantId) {
    logger.info(`[IN_ROOM] ${participantId} has left`);
    this.removeAllSubscribersWithTargetId(participantId);

    const media = this.getMedia(participantId);

    if (media) {
      await media.stop();
    }

    delete this.participants[participantId];
  }

  private getSubscriberPeer(
    targetId: string,
    parcipantId: string
  ): PeerConnection | null {
    const peer =
      this.subscribers[this.getSubscriberPeerId(targetId, parcipantId)];

    return peer;
  }

  // MARK: private
  private createMedia(publisherId: string, peer: PeerConnection): Media {
    const media = new Media(publisherId);

    const transceiver = peer.addTransceiver("video", { direction: "recvonly" });
    media.initAV(transceiver);

    return media;
  }

  private getMedia(parcipantId: string): Media | null {
    const participant = this.participants[parcipantId];

    if (!participant) return null;

    return participant.media;
  }

  // MARK: private related to subscribers
  private getSubscriberPeerId(
    targetId: string,
    parcipantId: string
  ): string | null {
    return `p_${targetId}_${parcipantId}`;
  }

  private addSubscriber(peerId: string, peer: PeerConnection) {
    this.subscribers[peerId] = peer;
  }

  private removeAllSubscribersWithTargetId(parcipantId: string) {
    for (const key in Object.keys(this.subscribers)) {
      if (key.startsWith(`p_${parcipantId}`)) {
        delete this.subscribers[key];
      }
    }
  }
}

export type CreateMediaRequest = { kind: Kind; simulcast: boolean };
