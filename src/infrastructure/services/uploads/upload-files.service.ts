import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import FormData from 'form-data';
import { AxiosRequestConfig } from 'axios';
import * as fs from 'fs';
import { lastValueFrom } from 'rxjs';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environments';
import path from 'path';

@Injectable()
export class UploadFilesService {
  constructor(
    private environment: EnvironmentConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Upload multiple video files to the Flask API's /uploads endpoint.
   * @param filePaths Array of local video file paths to upload.
   * @returns The response from the Flask API.
   */
  async uploadVideos(filePaths: string[]): Promise<string[]> {
    const flaskUploadUrl = this.environment.getUploadRecordUrl();

    if (!flaskUploadUrl) {
      throw new InternalServerErrorException(
        'Flask upload URL not configured.',
      );
    }

    const form = new FormData();

    for (const filePath of filePaths) {
      const fileStats = fs.statSync(filePath);
      if (!fileStats.isFile()) {
        throw new InternalServerErrorException(`File not found: ${filePath}`);
      }

      form.append('files', fs.readFileSync(filePath), {
        filename: path.basename(filePath),
        contentType: 'video/webm',
      });
    }

    try {
      const response = await lastValueFrom(
        this.httpService.post(`${flaskUploadUrl}/uploads`, form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }),
      );

      const saved: any[] = response.data['files'];

      // Remove files after successful upload
      for (const filePath of filePaths) {
        fs.unlinkSync(filePath);
      }

      return saved.map((v) => v['saved_name']);
    } catch (error) {
      console.error(
        'Error uploading videos:',
        error.response?.data || error.message,
      );
      return [];
    }
  }
}
