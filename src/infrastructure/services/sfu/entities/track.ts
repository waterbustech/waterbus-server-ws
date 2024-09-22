import { Logger } from '@nestjs/common';
import { OpusEncoder } from '@discordjs/opus';
import { RTCRtpTransceiver, MediaStreamTrack, MediaStream } from 'werift';
import {
  createClient,
  DeepgramClient,
  ListenLiveClient,
  LiveTranscriptionEvents,
} from '@deepgram/sdk';
import SocketEvent from 'src/domain/constants/socket_events';
import { SocketGateway } from 'src/infrastructure/gateways/socket/socket.gateway';

export class Track {
  private rtcpId: any;
  private logger: Logger;
  private audioDecoder: OpusEncoder;
  private deepgramClient: DeepgramClient;
  private deepgramStream: ListenLiveClient;
  private keepAlive: any;

  constructor(
    public track: MediaStreamTrack,
    public ms: MediaStream,
    public receiver: RTCRtpTransceiver,
    private readonly serverSocket: SocketGateway,
    private readonly roomId: string,
    private readonly participantId: string,
  ) {
    this.logger = new Logger(Track.name);

    this.initializeDeepgramSTT(roomId, participantId);

    track.onReceiveRtp.subscribe((packet) => {
      if (track.kind == 'audio') {
        try {
          this.transcribeAudio(packet.payload);
        } catch (error) {
          this.logger.error(error);
        }
      }
    });

    track.onReceiveRtp.once((rtp) => {
      this.startPLI(rtp.header.ssrc);
    });
  }

  private startPLI(ssrc: number) {
    this.rtcpId = setInterval(() => {
      this.receiver.receiver.sendRtcpPLI(ssrc);
    }, 2000);
  }

  private initializeDeepgramSTT(roomId: string, participantId: string) {
    try {
      const subtitleChannel = SocketEvent.subtitleSSC + roomId;

      this.audioDecoder = new OpusEncoder(16000, 1);

      this.deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);

      this.deepgramStream = this.deepgramClient.listen.live({
        language: 'en',
        punctuate: true,
        smart_format: true,
        model: 'nova-2',
      });

      if (this.keepAlive) clearInterval(this.keepAlive);
      this.keepAlive = setInterval(() => {
        console.log('deepgram: keepalive');
        this.deepgramStream.keepAlive();
      }, 10 * 1000);

      this.deepgramStream.addListener(
        LiveTranscriptionEvents.Transcript,
        (data) => {
          if (
            data.speech_final &&
            data.is_final &&
            data.channel &&
            data.channel.alternatives[0].transcript
          ) {
            const transcription = data.channel.alternatives[0].transcript;

            this.serverSocket.server
              .to(subtitleChannel)
              .emit(SocketEvent.subtitleSSC, {
                participantId,
                transcription,
              });
          }
        },
      );

      this.deepgramStream.addListener(
        LiveTranscriptionEvents.Error,
        (error) => {
          this.logger.error('Error from Deepgram:', error);
        },
      );
    } catch (error) {
      this.logger.error('Error initializing Deepgram STT:', error);
    }
  }

  private async transcribeAudio(payload: Buffer) {
    try {
      if (
        this.deepgramStream &&
        this.deepgramStream.getReadyState() === 1 /* OPEN */
      ) {
        const decoded = this.audioDecoder.decode(payload);
        this.deepgramStream.send(decoded);
      }
    } catch (error) {
      this.logger.error('Error transcribing audio:', error);
    }
  }

  stop = () => {
    if (this.deepgramStream) {
      this.deepgramStream.requestClose();
    }
    clearInterval(this.rtcpId);
  };
}
