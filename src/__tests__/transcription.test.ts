import request from 'supertest';
import app from '../app';

describe('POST /transcription', () => {
  it('should create a transcription and return _id', async () => {
    const res = await request(app)
      .post('/transcription')
      .send({ audioUrl: 'https://example.com/sample.mp3' });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
  });
});
