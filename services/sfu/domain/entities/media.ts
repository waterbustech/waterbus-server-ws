import { v4 } from "uuid";
import { Kind, RTCRtpTransceiver, MediaStreamTrack } from "werift";
import { Track } from "./track";
import logger from "../../../../helpers/logger";

export class Media {
  readonly mediaId = "m_" + v4();
  tracks: Track[] = [];
  transceiver?: RTCRtpTransceiver;

  constructor(readonly publisherId: string) {}

  initAV(transceiver: RTCRtpTransceiver) {
    this.transceiver = transceiver;
    return this;
  }

  addTrack(rtpTrack: MediaStreamTrack) {
    const track = new Track(rtpTrack, this.transceiver!);
    this.tracks.push(track);
    logger.info("[MEDIA]: ADDED NEW TRACK");
  }

  stop() {
    this.tracks.forEach((track) => track.stop());
  }

  get info(): MediaInfo {
    return {
      publisherId: this.publisherId,
    };
  }
}

export type MediaInfo = {
  publisherId: string;
};

export type MediaInfoKind = Kind | "mixer";
