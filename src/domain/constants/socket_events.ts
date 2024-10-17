const SocketEvent = {
  // Meeting
  publishCSS: 'PUBLISH_CSS',
  publishSSC: 'PUBLISH_SSC',
  subscribeCSS: 'SUBSCRIBE_CSS',
  answerSubscriberSSC: 'SEND_SDP_SUBSCRIBER_SSC',
  answerSubscriberCSS: 'SEND_SDP_SUBSCRIBER_CSS',
  publisherCandidateCSS: 'SEND_CANDIDATE_PUBLISHER_CSS',
  publisherCandidateSSC: 'SEND_CANDIDATE_PUBLISHER_SSC',
  subscriberCandidateCSS: 'SEND_CANDIDATE_SUBSCRIBER_CSS',
  subscriberCandidateSSC: 'SEND_CANDIDATE_SUBSCRIBER_SSC',
  leaveRoomCSS: 'LEAVE_ROOM_CSS',
  newParticipantSSC: 'NEW_PARTICIPANT_SSC',
  participantHasLeftSSC: 'PARTICIPANT_HAS_LEFT_SSC',
  setE2eeEnabledCSS: 'SET_E2EE_ENABLED_CSS',
  setE2eeEnabledSSC: 'SET_E2EE_ENABLED_SSC',
  setVideoEnabledCSS: 'SET_VIDEO_ENABLED_CSS',
  setVideoEnabledSSC: 'SET_VIDEO_ENABLED_SSC',
  setCameraTypeCSS: 'SET_CAMERA_TYPE_CSS',
  setCameraTypeSSC: 'SET_CAMERA_TYPE_SSC',
  setAudioEnabledCSS: 'SET_AUDIO_ENABLED_CSS',
  setAudioEnabledSSC: 'SET_AUDIO_ENABLED_SSC',
  setScreenSharingSSC: 'SET_SCREEN_SHARING_SSC',
  setScreenSharingCSS: 'SET_SCREEN_SHARING_CSS',
  handRaisingSSC: 'HAND_RAISING_SSC',
  handRaisingCSS: 'HAND_RAISING_CSS',
  subtitleSSC: 'SUBTITLE_SSC',
  setSubscribeSubtitleCSS: 'SET_SUBSCRIBE_SUBTITLE_CSS',
  startRecordSSC: 'START_RECORD_SSC',
  stopRecordSSC: 'STOP_RECORD_SSC',

  publisherRenegotiationCSS: 'PUBLISHER_RENEGOTIATION_CSS',
  publisherRenegotiationSSC: 'PUBLISHER_RENEGOTIATION_SSC',

  subscriberRenegotiationSSC: 'SUBSCRIBER_RENEGOTIATION_SSC',

  // White board
  startWhiteBoardSSC: 'START_WHITE_BOARD_SSC',
  startWhiteBoardCSS: 'START_WHITE_BOARD_CSS',
  updateWhiteBoardCSS: 'UPDATE_WHITE_BOARD_CSS',
  updateWhiteBoardSSC: 'UPDATE_WHITE_BOARD_SSC',
  cleanWhiteBoardCSS: 'CLEAN_WHITE_BOARD_CSS',
  cleanWhiteBoardSSC: 'CLEAN_WHITE_BOARD_SSC',

  // Chats
  sendMessageSSC: 'SEND_MESSAGE_SSC',
  updateMessageSSC: 'UPDATE_MESSAGE_SSC',
  deleteMessageSSC: 'DELETE_MESSAGE_SSC',
  newMemberJoinedSSC: 'NEW_MEMBER_JOINED_SSC',
  newInvitationSSC: 'NEW_INVITATION_SSC',

  // System
  connection: 'connection',
  disconnect: 'disconnect',
  destroy: 'destroy',
  sendPodNameSSC: 'SEND_POD_NAME_SSC',
  reconnect: 'reconnect_CSS',
} as const;

export default SocketEvent;
