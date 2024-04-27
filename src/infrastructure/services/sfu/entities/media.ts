import { nanoid } from 'nanoid';
import {
  RTCRtpTransceiver,
  MediaStreamTrack,
  RTCRtpCodecParameters,
  MediaStream,
  // MediaRecorder,
} from 'werift';
import { Track } from './track';
import {
  kAV1Codec,
  kH264Codec,
  kVP8Codec,
  kVP9Codec,
  kH265Codec,
} from '../../../../domain/constants/webrtc_config';
import { Logger } from '@nestjs/common';
import { SocketGateway } from 'src/infrastructure/gateways/socket/socket.gateway';

export class Media {
  readonly mediaId = 'm_' + nanoid();
  private participantId: string;
  tracks: Track[] = [];
  transceiver?: RTCRtpTransceiver;
  videoEnabled: boolean = true;
  audioEnabled: boolean = true;
  isE2eeEnabled: boolean = false;
  isScreenSharing: boolean = false;
  cameraType: number = 0; // 0: front | 1: rear
  codec: string;
  private logger: Logger;
  private recorder: MediaRecorder;

  constructor(
    readonly publisherId: string,
    readonly isVideoEnabled: boolean,
    readonly isAudioEnabled: boolean,
    readonly e2eeEnabled: boolean,
  ) {
    this.participantId = publisherId;
    this.videoEnabled = isVideoEnabled;
    this.audioEnabled = isAudioEnabled;
    this.isE2eeEnabled = e2eeEnabled;
    this.logger = new Logger(Media.name);
  }

  initAV(transceiver: RTCRtpTransceiver) {
    this.transceiver = transceiver;
    return this;
  }

  addTrack(
    rtpTrack: MediaStreamTrack,
    ms: MediaStream,
    server: SocketGateway,
    roomId: string,
  ): boolean {
    const trackIndex = this.tracks.findIndex(
      (track) => track.track.id == rtpTrack.id,
    );

    if (trackIndex != -1) return false;

    const track = new Track(
      rtpTrack,
      ms,
      this.transceiver!,
      server,
      roomId,
      this.participantId,
    );
    this.tracks.push(track);

    if (track.track.kind == 'video') {
      this.codec = track.track.codec.mimeType;
    }

    this.logger.verbose(`
          [TRACK ADDED]: Info
          id: ${rtpTrack.id}
          kind: ${rtpTrack.kind}
          codec: ${rtpTrack.codec.mimeType}`);

    return true;
  }

  setScreenSharing(isEnabled: boolean) {
    if (this.isScreenSharing == isEnabled) return;

    this.isScreenSharing = isEnabled;

    if (!isEnabled) {
      this.removeLastTrack();
    }
  }

  private removeLastTrack() {
    if (!this.tracks) return;

    const screenTrack = this.tracks.pop();

    screenTrack.stop();
  }

  removeAllTracks() {
    for (let track of this.tracks) {
      track.stop();
    }

    this.tracks = [];
  }

  stop() {
    if (this.recorder != null) {
      this.recorder.stop();
    }

    this.tracks.forEach((track) => track.stop());
  }

  videoCodecs(): RTCRtpCodecParameters[] {
    switch (this.codec) {
      case kVP8Codec.mimeType:
        return [kVP8Codec];
      case kVP9Codec.mimeType:
        return [kVP9Codec];
      case kH264Codec.mimeType:
        return [kH264Codec];
      case kH265Codec.mimeType:
        return [kH265Codec];
      case kAV1Codec.mimeType:
        return [kAV1Codec];
      default:
        return [kH264Codec, kVP8Codec, kAV1Codec];
    }
  }

  get info(): MediaInfo {
    return {
      publisherId: this.publisherId,
    };
  }

  setCameraType(type: number) {
    this.cameraType = type;
  }

  setVideoEnabled(isEnable: boolean) {
    this.videoEnabled = isEnable;
  }

  setAudioEnabled(isEnable: boolean) {
    this.audioEnabled = isEnable;
  }

  setE2eeEnabled(isEnable: boolean) {
    this.isE2eeEnabled = isEnable;
  }

  // startRecord() {
  //   if (this.tracks.length != 2) return;

  //   this.recorder = new MediaRecorder(`./rec/${this.mediaId}.webm`, 2, {
  //     width: 640,
  //     height: 480,
  //   });

  //   this.tracks.forEach((track) => {
  //     this.recorder.addTrack(track.track);
  //   });
  // }
}

export type MediaInfo = {
  publisherId: string;
};
