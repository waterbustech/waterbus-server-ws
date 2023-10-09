import { RTCRtpTransceiver, MediaStreamTrack } from "werift";

export class Track {
  rtcpId: any;

  constructor(
    public track: MediaStreamTrack,
    public receiver: RTCRtpTransceiver
  ) {
    track.onReceiveRtp.once((rtp) => {
      this.startPLI(rtp.header.ssrc);
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
