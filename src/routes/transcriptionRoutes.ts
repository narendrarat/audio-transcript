import { Router } from 'express';
import { createTranscription,getAllTranscriptions } from '../controllers/transcriptionController';


const router = Router();
router.post('/transcription', createTranscription);
router.get('/transcriptions', getAllTranscriptions);

export default router;