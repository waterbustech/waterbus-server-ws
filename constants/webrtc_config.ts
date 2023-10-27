import * as webrtc from "werift";

const TURN_USERNAME = process.env.TURN_USERNAME;
const TURN_CREDENTIAL = process.env.TURN_CREDENTIAL;

const iceServers = [
  {
    urls: "stun:149.28.156.10:3478",
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL,
  },
  {
    urls: "turn:149.28.156.10:3478?transport=udp",
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL,
  },
];

const offerType = "offer";
const answerType = "answer";

const codecsSupported: Record<string, webrtc.RTCRtpCodecParameters[]> = {
  audio: [
    new webrtc.RTCRtpCodecParameters({
      mimeType: "audio/opus",
      clockRate: 48000,
      channels: 2,
    }),
  ],
  video: [
    new webrtc.RTCRtpCodecParameters({
      mimeType: "video/H264",
      clockRate: 90000,
      parameters: 'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f'
    }),
    new webrtc.RTCRtpCodecParameters({
      mimeType: "video/VP8",
      clockRate: 90000,
    }),
    new webrtc.RTCRtpCodecParameters({
      mimeType: "video/AV1",
      clockRate: 90000,
    }),
  ],
};

const debugConfig: {
  disableSendNack: boolean;
  disableRecvRetransmit: boolean;
} = {
  disableSendNack: true,
  disableRecvRetransmit: true,
};


export {
  offerType,
  answerType,
  iceServers,
  codecsSupported,
  debugConfig,
};
