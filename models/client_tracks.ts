import * as webrtc from "werift";

interface ClientTrack {
  audioTrack: webrtc.MediaStreamTrack | null;
  videoTrack: webrtc.MediaStreamTrack | null;
}

export default ClientTrack;
