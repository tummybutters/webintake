import { appendSubmissionToSheet, uploadLogoToDrive } from './googleSheetsDrive.js';
import { createCheckoutSession } from './stripeCheckout.js';

function cloneSubmission(body) {
  return JSON.parse(JSON.stringify(body || {}));
}

export async function processIntakeSubmission(body, env) {
  const submission = cloneSubmission(body);

  if (!submission.submissionId) {
    return {
      status: 400,
      payload: { error: 'submissionId is required' },
    };
  }

  const logoUpload = await uploadLogoToDrive(submission.assets?.logo, submission.submissionId, env);

  submission.assets.logo = {
    ...submission.assets.logo,
    base64: '',
    storage: {
      provider: 'google_drive',
      fileId: logoUpload.fileId,
      fileName: logoUpload.fileName,
      url: logoUpload.url,
    },
  };

  const checkoutSession = await createCheckoutSession(submission, env);

  submission.updatedAt = new Date().toISOString();
  submission.status = 'checkout_created';
  submission.stripe.checkoutSessionId = checkoutSession.id;
  submission.stripe.checkoutUrl = checkoutSession.url;

  await appendSubmissionToSheet(submission, env);

  return {
    status: 200,
    payload: {
      ok: true,
      submissionId: submission.submissionId,
      checkoutUrl: checkoutSession.url,
      driveFileId: logoUpload.fileId,
      driveFileUrl: logoUpload.url,
    },
  };
}
