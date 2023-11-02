const SocketEvent = {
  joinRoomCSS: "BROADCAST_CSS",
  joinRoomSSC: "BROADCAST_SSC",
  makeSubscriber: "REQUEST_ESTABLISH_SUBSCRIBER_CSS",
  answerSubscriberSSC: "SEND_RECEIVER_SDP_SSC",
  answerSubscriberCSS: "SEND_RECEIVER_SDP_CSS",
  publisherCandidateCSS: "SEND_BROADCAST_CANDIDATE_CSS",
  publisherCandidateCCS: "SEND_BROADCAST_CANDIDATE_SSC",
  subscriberCandidateCSS: "SEND_RECEIVER_CANDIDATE_CSS",
  subscriberCandidateSSC: "SEND_RECEIVER_CANDIDATE_SSC",
  leaveRoomCSS: "LEAVE_ROOM_CSS",
  newParticipantSSC: "NEW_PARTICIPANT_SSC",
  participantHasLeftSSC: "PARTICIPANT_HAS_LEFT_SSC",
  setVideoEnabledCSS: "SET_VIDEO_ENABLED_CSS",
  setVideoEnabledSSC: "SET_VIDEO_ENABLED_SSC",
  setAudioEnabledCSS: "SET_AUDIO_ENABLED_CSS",
  setAudioEnabledSSC: "SET_AUDIO_ENABLED_SSC",
  setScreenSharingSSC: "SET_SCREEN_SHARING_SSC",
  setScreenSharingCSS: "SET_SCREEN_SHARING_CSS",
  connection: "connection",
  disconnect: "disconnect",
} as const;

export default SocketEvent;
