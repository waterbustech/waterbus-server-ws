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
    // new webrtc.RTCRtpCodecParameters({
    //   mimeType: "video/H264",
    //   clockRate: 90000,
    //   rtcpFeedback: [
    //     { type: "transport-cc" },
    //     { type: "ccm", parameter: "fir" },
    //     { type: "nack" },
    //     { type: "nack", parameter: "pli" },
    //     { type: "goog-remb" },
    //   ],
    //   parameters:
    //     "level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=640c1f",
    // }),
    new webrtc.RTCRtpCodecParameters({
      mimeType: "video/VP8",
      clockRate: 90000,
    }),
  ],
};

const debugConfiguration: {
  inboundPacketLoss: number;
  outboundPacketLoss: number;
  receiverReportDelay: number;
  disableSendNack: boolean;
  disableRecvRetransmit: boolean;
} = {
  inboundPacketLoss: 10,
  outboundPacketLoss: 5,
  receiverReportDelay: 100,
  disableSendNack: false,
  disableRecvRetransmit: false,
};

export {
  offerType,
  answerType,
  iceServers,
  codecsSupported,
  debugConfiguration,
};
