import { google } from 'googleapis';
import { Readable } from 'node:stream';

export const SHEET_HEADERS = [
  'submission_id',
  'created_at',
  'updated_at',
  'status',
  'payment_status',
  'build_status',
  'domain_status',
  'notification_status',
  'business_name',
  'contact_email',
  'phone_number',
  'business_address',
  'service_area',
  'domain_1',
  'domain_2',
  'domain_3',
  'template_id',
  'template_name',
  'template_description',
  'preferred_contact',
  'logo_file_name',
  'logo_mime_type',
  'logo_drive_file_id',
  'logo_drive_url',
  'stripe_checkout_session_id',
  'stripe_customer_id',
  'stripe_subscription_id',
  'stripe_payment_intent_id',
  'paid_at',
  'raw_intake_json',
  'website_json',
];

function isPermissionError(error) {
  const status = error?.code || error?.status || error?.response?.status;
  return status === 401 || status === 403;
}

function formatGoogleAccessError(resourceLabel, env, error) {
  const serviceAccount = env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'the configured Google service account';
  return new Error(
    `${resourceLabel} access denied for ${serviceAccount}. Share the ${resourceLabel.toLowerCase()} with that service account and make sure the Google API is enabled.`,
    { cause: error instanceof Error ? error : undefined },
  );
}

function getGoogleAuth(env) {
  const clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Google service account credentials are not configured');
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });
}

function getSheetRange(sheetName) {
  return `${sheetName}!A:AE`;
}

function buildRowValues(submission) {
  return [
    submission.submissionId,
    submission.createdAt,
    submission.updatedAt,
    submission.status,
    submission.paymentStatus,
    submission.buildStatus,
    submission.domainStatus,
    submission.notificationStatus,
    submission.customer.businessName,
    submission.customer.contactEmail,
    submission.customer.phoneNumber,
    submission.customer.businessAddress,
    submission.customer.serviceArea,
    submission.website.domains[0] || '',
    submission.website.domains[1] || '',
    submission.website.domains[2] || '',
    submission.website.template?.id || '',
    submission.website.template?.name || '',
    submission.website.template?.description || '',
    submission.preferredContact,
    submission.assets.logo.fileName || '',
    submission.assets.logo.mimeType || '',
    submission.assets.logo.storage.fileId || '',
    submission.assets.logo.storage.url || '',
    submission.stripe.checkoutSessionId || '',
    submission.stripe.customerId || '',
    submission.stripe.subscriptionId || '',
    submission.stripe.paymentIntentId || '',
    submission.stripe.paidAt || '',
    JSON.stringify(submission.rawIntake),
    JSON.stringify({
      domains: submission.website.domains,
      template: submission.website.template,
      logo: {
        provided: submission.assets.logo.provided,
        fileName: submission.assets.logo.fileName,
        mimeType: submission.assets.logo.mimeType,
        storage: submission.assets.logo.storage,
      },
    }),
  ];
}

async function ensureSheetHeaders(sheets, spreadsheetId, sheetName) {
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  });

  const currentHeaders = existing.data.values?.[0] || [];
  const matches =
    currentHeaders.length === SHEET_HEADERS.length &&
    currentHeaders.every((value, index) => value === SHEET_HEADERS[index]);

  if (matches) return;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!1:1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [SHEET_HEADERS],
    },
  });
}

export async function uploadLogoToDrive(logo, submissionId, env) {
  if (!logo?.provided || !logo?.base64) {
    return {
      fileId: '',
      fileName: '',
      url: '',
    };
  }

  const folderId = env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID is not configured');
  }

  const auth = getGoogleAuth(env);
  const drive = google.drive({ version: 'v3', auth });
  const extension = logo.fileName.includes('.') ? logo.fileName.split('.').pop() : '';
  const safeName = extension
    ? `${submissionId}-logo.${extension}`
    : `${submissionId}-logo`;
  const logoBuffer = Buffer.from(logo.base64, 'base64');

  let response;

  try {
    response = await drive.files.create({
      requestBody: {
        name: safeName,
        parents: [folderId],
        mimeType: logo.mimeType || 'application/octet-stream',
      },
      media: {
        mimeType: logo.mimeType || 'application/octet-stream',
        body: Readable.from(logoBuffer),
      },
      fields: 'id, webViewLink, webContentLink, name',
    });
  } catch (error) {
    if (isPermissionError(error)) {
      throw formatGoogleAccessError('Google Drive folder', env, error);
    }

    throw error;
  }

  return {
    fileId: response.data.id || '',
    fileName: response.data.name || safeName,
    url: response.data.webViewLink || response.data.webContentLink || '',
  };
}

export async function appendSubmissionToSheet(submission, env) {
  const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = env.GOOGLE_SHEETS_SHEET_NAME || 'Submissions';

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID is not configured');
  }

  const auth = getGoogleAuth(env);
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    await ensureSheetHeaders(sheets, spreadsheetId, sheetName);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: getSheetRange(sheetName),
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [buildRowValues(submission)],
      },
    });
  } catch (error) {
    if (isPermissionError(error)) {
      throw formatGoogleAccessError('Google Sheet', env, error);
    }

    throw error;
  }
}

export async function updateSubmissionFromStripe(checkoutSession, env) {
  const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = env.GOOGLE_SHEETS_SHEET_NAME || 'Submissions';
  const submissionId =
    checkoutSession.client_reference_id || checkoutSession.metadata?.submission_id || '';

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID is not configured');
  }

  if (!submissionId) {
    throw new Error('Stripe session is missing submission_id');
  }

  const auth = getGoogleAuth(env);
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: getSheetRange(sheetName),
  });

  const rows = response.data.values || [];
  const headerRow = rows[0] || SHEET_HEADERS;
  const submissionIndex = headerRow.indexOf('submission_id');
  const matchedRowIndex = rows.findIndex((row, index) => index > 0 && row[submissionIndex] === submissionId);

  if (matchedRowIndex === -1) {
    throw new Error(`No submission found for ${submissionId}`);
  }

  const rowNumber = matchedRowIndex + 1;
  const existingRow = rows[matchedRowIndex];
  const rowRecord = Object.fromEntries(
    headerRow.map((header, index) => [header, existingRow[index] || '']),
  );

  rowRecord.updated_at = new Date().toISOString();
  rowRecord.status = 'paid';
  rowRecord.payment_status = 'paid';
  rowRecord.stripe_checkout_session_id = checkoutSession.id || '';
  rowRecord.stripe_customer_id = checkoutSession.customer || '';
  rowRecord.stripe_subscription_id = checkoutSession.subscription || '';
  rowRecord.stripe_payment_intent_id = checkoutSession.payment_intent || '';
  rowRecord.paid_at = new Date().toISOString();

  const updatedRow = headerRow.map((header) => rowRecord[header] || '');

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${rowNumber}:AE${rowNumber}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [updatedRow],
    },
  });

  return { submissionId };
}
