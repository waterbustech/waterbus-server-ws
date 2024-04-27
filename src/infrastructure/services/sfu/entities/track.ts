import { Logger } from '@nestjs/common';
import { OpusEncoder } from '@discordjs/opus';
import { RTCRtpTransceiver, MediaStreamTrack, MediaStream } from 'werift';
import { SpeechClient } from '@google-cloud/speech';
import fs from 'fs';
import SocketEvent from 'src/domain/constants/socket_events';
import { SocketGateway } from 'src/infrastructure/gateways/socket/socket.gateway';

export class Track {
  private rtcpId: any;
  private logger: Logger;
  private speechClient: SpeechClient;
  private recognizeStream: any;
  private audioDecoder: OpusEncoder;

  constructor(
    public track: MediaStreamTrack,
    public ms: MediaStream,
    public receiver: RTCRtpTransceiver,
    private readonly serverSocket: SocketGateway,
    private readonly roomId: string,
    private readonly participantId: string,
  ) {
    this.logger = new Logger(Track.name);

    // this.initialGoogleSTT(roomId, participantId);

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

  private initialGoogleSTT(roomId: string, participantId: string) {
    try {
      const subtitleChannel = SocketEvent.subtitleSSC + roomId;
      const keyFilePath = './credentials.json';
      const keyFileContent = fs.readFileSync(keyFilePath, 'utf-8');

      if (!keyFileContent) {
        this.logger.warn('Missing credentials file to use Speech to Text');
        return;
      }

      const credentials = JSON.parse(keyFileContent);

      this.audioDecoder = new OpusEncoder(16000, 1);

      this.speechClient = new SpeechClient({
        credentials: credentials,
      });

      this.recognizeStream = this.speechClient
        .streamingRecognize({
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
            model: 'phone_call',
          },
          interimResults: true,
        })
        .on('data', (data) => {
          if (data.results[0] && data.results[0].alternatives[0]) {
            const transcription = data.results[0].alternatives[0].transcript;

            this.serverSocket.server
              .to(subtitleChannel)
              .emit(SocketEvent.subtitleSSC, {
                participantId,
                transcription,
              });
          }
        })
        .on('error', (error) => {
          this.logger.error('Error transcribing audio:', error);
        });
    } catch (error) {}
  }

  private async transcribeAudio(payload: Buffer) {
    try {
      if (this.recognizeStream != null) {
        const decoded = this.audioDecoder.decode(payload);

        this.recognizeStream.write(decoded);
      }
    } catch (error) {
      this.logger.error('Error transcribing audio:', error);
    }
  }

  stop = () => {
    if (this.recognizeStream != null) {
      this.recognizeStream.end();
    }
    clearInterval(this.rtcpId);
  };
}
