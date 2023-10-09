import { Media } from "./media";
import { PeerConnection } from "./peer";

interface Participant {
  media: Media;
  peer: PeerConnection;
}

export default Participant;
