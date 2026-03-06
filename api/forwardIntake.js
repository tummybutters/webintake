export async function forwardIntake(body, webhookUrl) {
  if (!webhookUrl) {
    return {
      status: 500,
      payload: { error: 'INTAKE_WEBHOOK_URL is not configured' },
    };
  }

  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });

    if (!webhookResponse.ok) {
      const text = await webhookResponse.text();
      return {
        status: 502,
        payload: {
          error: 'Upstream webhook failed',
          status: webhookResponse.status,
          details: text.slice(0, 500),
        },
      };
    }

    return {
      status: 200,
      payload: { ok: true },
    };
  } catch {
    return {
      status: 500,
      payload: { error: 'Failed to reach intake webhook' },
    };
  }
}
