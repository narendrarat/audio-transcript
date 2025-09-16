
import Transcription from '../models/Transcription';
import path from 'path';
import fs from 'fs';
import speech from '@google-cloud/speech';
import { protos } from '@google-cloud/speech';   
import fetch from 'node-fetch';

const keyFilename = path.join(__dirname, '../config/intense-clarity-185416-05b99e70144b.json');
const uploadDir = path.join(__dirname, '../../upload');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const client = new speech.SpeechClient({ keyFilename });

export interface TranscriptionRequest {
  audioUrl: string;
}

export interface TranscriptionResponse {
  _id: string;
  audioUrl: string;
  transcription: string;
  createdAt: Date;
}

async function downloadAudio(url: string, dest: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}: Downloading audio from`, url);
      const res = await fetch(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CopilotBot/1.0)' }
      });
      if (!res.ok || !res.body) throw new Error(`Failed to fetch audio: ${res.status} ${res.statusText}`);
      const fileStream = fs.createWriteStream(dest);
      await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on('error', reject);
        fileStream.on('finish', () => resolve(undefined));
      });
      return dest;
    } catch (err) {
      console.error(`Attempt ${attempt + 1} failed:`, err);
      if (attempt === retries) throw new Error('Failed to download audio after retries');
    }
  }
  throw new Error('Failed to download audio');
}

export async function transcribeAudio(req: TranscriptionRequest): Promise<TranscriptionResponse> {
  const audioFilename = `audio_${Date.now()}.mp3`;
  const audioPath = path.join(uploadDir, audioFilename);
  await downloadAudio(req.audioUrl, audioPath);

  const audio = {
    content: fs.readFileSync(audioPath).toString('base64'),
  };

  const config = {
  encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
  languageCode: 'en-US',
  enableAutomaticPunctuation: true,
  enableSpeakerDiarization: true,
  diarizationSpeakerCount: 2
};

  let transcriptionText = '';
  try {
    const [response] = await client.recognize({
      audio,
      config
    });


    transcriptionText =
      response.results?.map((r: any) => r.alternatives?.[0]?.transcript).join(' ') || '';
  } catch (err) {
    console.error('Transcription error', err);
    transcriptionText = 'Transcription failed';
  }

  const record = await Transcription.create({
    audioUrl: req.audioUrl,
    transcription: transcriptionText,
    createdAt: new Date()
  });

  return {
    _id: String(record._id),
    audioUrl: record.audioUrl,
    transcription: record.transcription,
    createdAt: record.createdAt
  };
}
export async function getAllTranscriptionsService() {
  return await Transcription.find({}, { _id: 1, audioUrl: 1, transcription: 1 }).sort({ createdAt: -1 });
}