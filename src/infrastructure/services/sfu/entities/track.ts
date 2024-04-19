import { Logger } from '@nestjs/common';
import { RTCRtpTransceiver, MediaStreamTrack } from 'werift';

export class Track {
  rtcpId: any;
  logger: Logger;

  constructor(
    public track: MediaStreamTrack,
    public receiver: RTCRtpTransceiver,
  ) {
    this.logger = new Logger(Track.name);

    track.onReceiveRtp.once((rtp) => {
      this.startPLI(rtp.header.ssrc);

      if (track.kind == 'audio') {
        // Implement Subtitle
        // this.logger.verbose(rtp.payload.byteLength);
      }
    });
  }

  private startPLI(ssrc: number) {
    this.rtcpId = setInterval(() => {
      this.receiver.receiver.sendRtcpPLI(ssrc);
    }, 2000);
  }

  stop = () => {
    clearInterval(this.rtcpId);
  };
}
