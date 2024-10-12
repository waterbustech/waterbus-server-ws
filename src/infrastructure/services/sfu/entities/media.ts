import {
  RTCRtpTransceiver,
  MediaStreamTrack,
  RTCRtpCodecParameters,
  MediaStream,
} from 'werift';
import { MediaRecorder, MediaRecorderOptions } from 'werift/nonstandard';
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
import * as path from 'path';

export class Media {
  readonly mediaId = 'm_' + crypto.randomUUID();
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
  private callbackStopRecord?: () => void;

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
    for (const track of this.tracks) {
      track.stop();
    }

    this.tracks = [];
  }

  stop() {
    this.stopRecord();

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

  setCallback(callback: () => void) {
    this.callbackStopRecord = callback;
  }

  startRecord(): string {
    if (this.tracks.length != 2 || this.recorder) return;

    const uniqueFileName = `${crypto.randomUUID()}.webm`;

    const filePath = path.resolve(process.cwd(), 'rec', uniqueFileName);

    const options: MediaRecorderOptions = {
      width: 640,
      height: 480,
      jitterBufferLatency: 200,
      jitterBufferSize: 100,
      disableLipSync: false,
      waitForKeyframe: true,
      defaultDuration: 3000,
      disableNtp: false,
      tracks: this.tracks.map((t) => t.track),
    };

    this.recorder = new MediaRecorder({
      numOfTracks: this.tracks.length,
      path: filePath,
      ...options,
    });

    return filePath;
  }

  stopRecord() {
    if (this.recorder != null) {
      if (this.callbackStopRecord) this.callbackStopRecord();
      this.recorder.stop();
    }

    this.recorder = null;
  }
}

export type MediaInfo = {
  publisherId: string;
};
