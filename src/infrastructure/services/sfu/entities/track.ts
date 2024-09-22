import { Logger } from '@nestjs/common';
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

    // Handle RTP packets for audio
    track.onReceiveRtp.subscribe((packet) => {
      if (track.kind === 'audio') {
        try {
          this.transcribeAudio(packet.payload);
        } catch (error) {
          this.logger.error(error);
        }
      }
    });

    // Start PLI once for RTP
    track.onReceiveRtp.once((rtp) => {
      this.startPLI(rtp.header.ssrc);
    });
  }

  // Send Picture Loss Indication (PLI)
  private startPLI(ssrc: number) {
    this.rtcpId = setInterval(() => {
      this.receiver.receiver.sendRtcpPLI(ssrc);
    }, 2000);
  }

  // Initialize Deepgram's Speech-to-Text (STT) service
  private initializeDeepgramSTT(roomId: string, participantId: string) {
    if (!process.env.DEEPGRAM_API_KEY) return;

    try {
      const subtitleChannel = SocketEvent.subtitleSSC + roomId;

      // Initialize Deepgram Client
      this.deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);

      // Start a Deepgram transcription stream
      this.deepgramStream = this.deepgramClient.listen.live({
        language: 'en',
        punctuate: true,
        smart_format: true,
        model: 'nova-2',
        channels: 1,
        sample_rate: 16000,
        encoding: 'opus',
      });

      // Maintain Deepgram connection via keep-alive mechanism
      if (this.keepAlive) clearInterval(this.keepAlive);
      this.keepAlive = setInterval(() => {
        this.deepgramStream.keepAlive();
      }, 10 * 1000);

      this.deepgramStream.addListener(
        LiveTranscriptionEvents.Open,
        async () => {
          this.logger.log('deepgram: connected');
          // Handle incoming transcriptions from Deepgram
          this.deepgramStream.addListener(
            LiveTranscriptionEvents.Transcript,
            (data) => {
              const transcript = data.channel.alternatives[0].transcript;
              if (data.speech_final && data.is_final && transcript) {
                // Emit transcript to WebSocket clients
                this.serverSocket.server
                  .to(subtitleChannel)
                  .emit(SocketEvent.subtitleSSC, {
                    participantId,
                    transcription: transcript,
                  });
              }
            },
          );

          // Handle errors from Deepgram
          this.deepgramStream.addListener(
            LiveTranscriptionEvents.Error,
            (error) => {
              this.logger.error('Error from Deepgram:', error);
            },
          );

          this.deepgramStream.addListener(
            LiveTranscriptionEvents.Close,
            async () => {
              this.stop();
            },
          );

          this.deepgramStream.addListener(
            LiveTranscriptionEvents.Metadata,
            (data) => {
              this.logger.log('deepgram: packet received');
              this.logger.log('deepgram: metadata received');
            },
          );
        },
      );
    } catch (error) {
      this.logger.error('Error initializing Deepgram STT:', error);
    }
  }

  // Transcribe audio from the WebRTC track
  private async transcribeAudio(payload: Buffer) {
    try {
      if (
        this.deepgramStream &&
        this.deepgramStream.getReadyState() === 1 /* OPEN */
      ) {
        this.deepgramStream.send(payload);
      }
    } catch (error) {
      this.logger.error('Error transcribing audio:', error);
    }
  }

  // Stop the transcription and close connections
  stop = () => {
    if (this.deepgramStream) {
      this.deepgramStream.requestClose(); // Close Deepgram stream
    }
    clearInterval(this.rtcpId); // Clear PLI interval
    if (this.keepAlive) {
      clearInterval(this.keepAlive);
    }
  };
}
