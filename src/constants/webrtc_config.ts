import * as webrtc from 'werift';

const offerType = 'offer';
const answerType = 'answer';

const kH264Codec: webrtc.RTCRtpCodecParameters =
  new webrtc.RTCRtpCodecParameters({
    mimeType: 'video/H264',
    clockRate: 90000,
    parameters:
      'level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f',
  });

const kH265Codec: webrtc.RTCRtpCodecParameters =
  new webrtc.RTCRtpCodecParameters({
    mimeType: 'video/H265',
    clockRate: 90000,
  });

const kVP8Codec: webrtc.RTCRtpCodecParameters =
  new webrtc.RTCRtpCodecParameters({
    mimeType: 'video/VP8',
    clockRate: 90000,
  });

const kVP9Codec: webrtc.RTCRtpCodecParameters =
  new webrtc.RTCRtpCodecParameters({
    mimeType: 'video/VP9',
    clockRate: 90000,
  });

const kAV1Codec: webrtc.RTCRtpCodecParameters =
  new webrtc.RTCRtpCodecParameters({
    mimeType: 'video/AV1',
    clockRate: 90000,
  });

const kOpusCodec: webrtc.RTCRtpCodecParameters =
  new webrtc.RTCRtpCodecParameters({
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  });

const codecsSupported: Record<string, webrtc.RTCRtpCodecParameters[]> = {
  audio: [kOpusCodec],
  video: [kVP8Codec, kVP9Codec, kH264Codec, kH265Codec, kAV1Codec],
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
  codecsSupported,
  debugConfig,
  kH264Codec,
  kH265Codec,
  kVP8Codec,
  kVP9Codec,
  kAV1Codec,
  kOpusCodec,
};
