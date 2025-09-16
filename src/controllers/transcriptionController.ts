import { Request, Response } from 'express';
import { transcribeAudio, getAllTranscriptionsService } from '../services/transcriptionService';


export async function getAllTranscriptions(req: Request, res: Response) {
  try {
    const transcriptions = await getAllTranscriptionsService();
    res.json(transcriptions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transcriptions' });
  }
}

export async function createTranscription(req: Request, res: Response) {
  try {
    const { audioUrl } = req.body;
    if (!audioUrl) return res.status(400).json({ error: 'audioUrl is required' });
    const result = await transcribeAudio({ audioUrl });
    res.status(201).json({ _id: result._id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}