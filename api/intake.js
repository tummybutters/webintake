import { forwardIntake } from './forwardIntake.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const result = await forwardIntake(req.body, process.env.INTAKE_WEBHOOK_URL);
  return res.status(result.status).json(result.payload);
}
