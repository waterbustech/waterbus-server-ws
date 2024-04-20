import { Logger } from '@nestjs/common';
import { OpusEncoder } from '@discordjs/opus';
import { RTCRtpTransceiver, MediaStreamTrack } from 'werift';
import { SpeechClient } from '@google-cloud/speech';
import fs from 'fs';

export class Track {
  rtcpId: any;
  logger: Logger;
  speechClient: SpeechClient;
  recognizeStream: any;
  audioDecoder: OpusEncoder;

  constructor(
    public track: MediaStreamTrack,
    public receiver: RTCRtpTransceiver,
  ) {
    this.logger = new Logger(Track.name);

    const keyFilePath = './credentials.json';
    const keyFileContent = fs.readFileSync(keyFilePath, 'utf-8');
    const credentials = JSON.parse(keyFileContent);
    this.audioDecoder = new OpusEncoder(48000, 2);

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
          this.logger.verbose('Transcription:', transcription);
        }
      })
      .on('error', (error) => {
        this.logger.error('Error transcribing audio:', error);
      });

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

  private async transcribeAudio(payload: Buffer) {
    try {
      const decoded = this.audioDecoder.decode(payload);
      this.logger.verbose(decoded);
      this.writeToFile(decoded);
      // this.recognizeStream.write(decoded);
    } catch (error) {
      this.logger.error('Error transcribing audio:', error);
    }
  }

  private writeToFile(decoded: Uint8Array) {
    const filePath = './audio.wav';
    fs.appendFileSync(filePath, decoded);
  }

  private startPLI(ssrc: number) {
    this.rtcpId = setInterval(() => {
      this.receiver.receiver.sendRtcpPLI(ssrc);
    }, 2000);
  }

  stop = () => {
    if (this.recognizeStream != null) {
      this.recognizeStream.end();
    }
    clearInterval(this.rtcpId);
  };
}
