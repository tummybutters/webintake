import { put } from '@vercel/blob';

function sanitizeFileName(fileName) {
  return (fileName || 'logo')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function uploadLogoToBlob(logo, submissionId, env) {
  if (!logo?.provided || !logo?.base64) {
    return {
      pathname: '',
      fileName: '',
      url: '',
    };
  }

  const safeFileName = sanitizeFileName(logo.fileName);
  const pathname = `logos/${submissionId}/${safeFileName || 'logo'}`;
  const body = Buffer.from(logo.base64, 'base64');

  try {
    const uploaded = await put(pathname, body, {
      access: 'public',
      addRandomSuffix: false,
      contentType: logo.mimeType || 'application/octet-stream',
      token: env.BLOB_READ_WRITE_TOKEN || undefined,
    });

    return {
      pathname: uploaded.pathname,
      fileName: logo.fileName || safeFileName,
      url: uploaded.url,
    };
  } catch (error) {
    if (!env.BLOB_READ_WRITE_TOKEN) {
      throw new Error(
        'Vercel Blob is not configured for this runtime. If this Blob store is connected to the same Vercel project, redeploy and try again. For local development, run `vercel env pull` or set BLOB_READ_WRITE_TOKEN manually.',
        { cause: error instanceof Error ? error : undefined },
      );
    }

    throw new Error(
      error instanceof Error ? `Vercel Blob upload failed: ${error.message}` : 'Vercel Blob upload failed',
      { cause: error instanceof Error ? error : undefined },
    );
  }
}
