import { Logger } from '@nestjs/common';
import { RTCRtpTransceiver, MediaStreamTrack } from 'werift';
import { SpeechClient } from '@google-cloud/speech';
import fs from 'fs';

export class Track {
  rtcpId: any;
  logger: Logger;
  speechClient: SpeechClient;
  recognizeStream: any;

  constructor(
    public track: MediaStreamTrack,
    public receiver: RTCRtpTransceiver,
  ) {
    this.logger = new Logger(Track.name);

    const keyFilePath = './credentials.json';
    const keyFileContent = fs.readFileSync(keyFilePath, 'utf-8');
    const credentials = JSON.parse(keyFileContent);

    this.speechClient = new SpeechClient({
      credentials: credentials,
    });

    this.recognizeStream = this.speechClient
      .streamingRecognize({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
        },
        interimResults: true,
      })
      .on('data', (data) => {
        if (data.results[0] && data.results[0].alternatives[0]) {
          const transcription = data.results[0].alternatives[0].transcript;
          this.logger.verbose('Partial Transcription:', transcription);
        }
      })
      .on('error', (error) => {
        this.logger.error('Error transcribing audio:', error);
      });

    track.onReceiveRtp.subscribe((rtp) => {
      if (track.kind == 'audio') {
        // this.transcribeAudio(rtp.payload.buffer);
      }
    });

    track.onReceiveRtp.once((rtp) => {
      this.startPLI(rtp.header.ssrc);
    });
  }

  private async transcribeAudio(audioBuffer: ArrayBufferLike) {
    try {
      const binaryBuffer = Buffer.from(audioBuffer);
      
      this.recognizeStream.write(binaryBuffer);
      this.recognizeStream.end();
    } catch (error) {
      this.logger.error('Error transcribing audio:', error);
    }
  }

  private startPLI(ssrc: number) {
    this.rtcpId = setInterval(() => {
      this.receiver.receiver.sendRtcpPLI(ssrc);
    }, 2000);
  }

  stop = () => {
    clearInterval(this.rtcpId);
  };
}
