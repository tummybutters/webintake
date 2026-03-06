import { processIntakeSubmission } from './intakeFlow.js';

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
  }

  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await readJsonBody(req);
    const result = await processIntakeSubmission(body, process.env);
    return res.status(result.status).json(result.payload);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process intake submission',
    });
  }
}
