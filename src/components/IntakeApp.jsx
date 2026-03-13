import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Upload } from 'lucide-react';
import { templateRegistry } from '../templateStudio/templateRegistry';

const INTAKE_API_URL = '/api/intake';
const INTAKE_TIMEOUT_MS = 5000;
const INTAKE_RETRY_DELAY_MS = 400;
const INTAKE_MAX_ATTEMPTS = 2;

function SuccessPage() {
  return (
    <div className="root-wrapper">
      <div className="ambient-glow" />
      <motion.div
        className="success-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="corner corner-tl" />
        <span className="corner corner-tr" />
        <span className="corner corner-bl" />
        <span className="corner corner-br" />

        <div className="success-check">
          <Check size={22} strokeWidth={2.5} />
        </div>

        <p className="success-eyebrow">Payment Confirmed</p>
        <h1 className="success-title">You&apos;re all set.</h1>
        <p className="success-body">
          Be on the lookout. We&apos;ll reach out within the next few hours with either a call or
          text, and a link to your new website.
        </p>
        <p className="success-contact">
          Questions? Reach us at{' '}
          <a href="tel:+16025550000" className="success-phone">
            (602) 555-0000
          </a>
        </p>

        <div className="success-divider" />
        <p className="success-fine">Professional 1-page website • 3 months free hosting included</p>
      </motion.div>
    </div>
  );
}

const TEMPLATES = templateRegistry.map((template) => ({
  id: template.id,
  name: template.label,
  desc: template.tone,
  url: `/preview/${template.id}`,
}));

function createSubmissionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `sub_${crypto.randomUUID()}`;
  }

  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const [, base64 = ''] = result.split(',');
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error || new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

function getTemplateById(templateId) {
  return TEMPLATES.find((template) => template.id === templateId) || null;
}

async function extractApiError(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json().catch(() => null);
    if (data?.error) {
      return data.error;
    }
  } else {
    const text = await response.text().catch(() => '');
    if (text) {
      return text;
    }
  }

  return `Webhook responded with ${response.status}`;
}

function TemplateStep({ formData, updateFormData }) {
  return (
    <div className="template-grid">
      {TEMPLATES.map((t) => (
        <div
          key={t.id}
          className={`template-card${formData.templateId === t.id ? ' template-selected' : ''}`}
          onClick={() => updateFormData('templateId', t.id)}
        >
          <div className="template-preview-wrap">
            <iframe
              src={t.url}
              scrolling="no"
              title={t.name}
              className="template-iframe"
            />
            <div className="template-overlay" />
            {formData.templateId === t.id && (
              <div className="template-check">✓</div>
            )}
          </div>
          <div className="template-card-footer">
            <div>
              <span className="template-name">{t.name}</span>
              <span className="template-desc">{t.desc}</span>
            </div>
            <a
              href={t.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="template-open"
            >
              View ↗
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

const steps = [
  {
    id: 'contact',
    title: 'Contact Info',
    description: 'Basic information for the site and for bank, client, and partner validation.',
    fields: [
      { name: 'businessName', label: 'Business Name', placeholder: 'Blue Water Investing', type: 'text', required: true },
      { name: 'contactEmail', label: 'Contact Email', placeholder: 'email@example.com', type: 'email', required: true },
      { name: 'phoneNumber', label: 'Phone Number', placeholder: '+1 (555) 000-0000', type: 'tel', required: true },
      { name: 'businessAddress', label: 'Business Address', placeholder: '123 W Main St, Phoenix, AZ', type: 'text', required: true },
    ],
  },
  {
    id: 'domain',
    title: 'Domain',
    description: 'If the first choice is unavailable we will try the next option.',
    fields: [
      { name: 'domain1', label: 'Preferred Domain #1', placeholder: 'bluewaterinvesting.com', type: 'text', required: true },
      { name: 'domain2', label: 'Preferred Domain #2', placeholder: 'bluewatercapitalgroup.com', type: 'text' },
      { name: 'domain3', label: 'Preferred Domain #3', placeholder: 'bluewateradvisory.com', type: 'text' },
    ],
  },
  {
    id: 'area',
    title: 'Service Area',
    description: 'This helps us tailor the site copy to where the business actually operates.',
    fields: [{ name: 'serviceArea', label: 'Areas you serve', placeholder: 'Nationwide or Arizona and Nevada', type: 'text', required: true }],
  },
  {
    id: 'template',
    title: 'Choose a Design',
    description: 'We start with a strong template, then customize the content, photography, structure, and details so it feels fully yours.',
    fields: [],
  },
  {
    id: 'logo',
    title: 'Logo',
    description: 'Optional. If blank, automation can generate a premium text-first logo.',
    fields: [{ name: 'logo', label: 'Upload a logo', type: 'file' }],
  },
];

export default function IntakeApp() {
  const isSuccess = new URLSearchParams(window.location.search).get('success') === 'true';

  useEffect(() => {
    document.body.classList.add('body-intake-lock');
    return () => {
      document.body.classList.remove('body-intake-lock');
    };
  }, []);

  if (isSuccess) return <SuccessPage />;

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [formData, setFormData] = useState({});
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [stepError, setStepError] = useState('');
  const [submissionId] = useState(() => createSubmissionId());

  const handleNextRef = useRef(null);
  const loadingRef = useRef(false);
  loadingRef.current = loading;

  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA' || loadingRef.current) return;
      handleNextRef.current?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const currentStep = steps[currentStepIdx];
  const progress = ((currentStepIdx + 1) / steps.length) * 100;
  const isLastStep = currentStepIdx === steps.length - 1;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const submitIntake = async () => {
    const submittedAt = new Date().toISOString();
    const selectedTemplate = getTemplateById(formData.templateId);
    const logoPayload = formData.logo
      ? {
          provided: true,
          fileName: formData.logo.name,
          mimeType: formData.logo.type || 'application/octet-stream',
          sizeBytes: formData.logo.size || 0,
          base64: await fileToBase64(formData.logo),
          storage: {
            provider: 'vercel_blob',
            pathname: null,
            fileName: formData.logo.name,
            url: null,
          },
        }
      : {
          provided: false,
          fileName: '',
          mimeType: '',
          sizeBytes: 0,
          base64: '',
          storage: {
            provider: 'vercel_blob',
            pathname: null,
            fileName: '',
            url: null,
          },
        };

    const rawIntake = {
      businessName: formData.businessName || '',
      contactEmail: formData.contactEmail || '',
      phoneNumber: formData.phoneNumber || '',
      businessAddress: formData.businessAddress || '',
      domain1: formData.domain1 || '',
      domain2: formData.domain2 || '',
      domain3: formData.domain3 || '',
      serviceArea: formData.serviceArea || '',
      templateId: formData.templateId || '',
      preferredContact: 'Email',
      logoFileName: formData.logo?.name || '',
      submittedAt,
    };

    const payload = {
      submissionId,
      createdAt: submittedAt,
      updatedAt: submittedAt,
      source: 'website_intake',
      status: 'submitted',
      paymentStatus: 'pending',
      buildStatus: 'not_started',
      domainStatus: 'not_started',
      notificationStatus: 'pending',
      preferredContact: 'Email',
      customer: {
        businessName: rawIntake.businessName,
        contactEmail: rawIntake.contactEmail,
        phoneNumber: rawIntake.phoneNumber,
        businessAddress: rawIntake.businessAddress,
        serviceArea: rawIntake.serviceArea,
      },
      website: {
        domains: [rawIntake.domain1, rawIntake.domain2, rawIntake.domain3].filter(Boolean),
        template: selectedTemplate
          ? {
              id: selectedTemplate.id,
              name: selectedTemplate.name,
              description: selectedTemplate.desc,
              previewUrl: selectedTemplate.url,
            }
          : null,
      },
      assets: {
        logo: logoPayload,
      },
      stripe: {
        checkoutSessionId: null,
        customerId: null,
        subscriptionId: null,
        paymentIntentId: null,
        clientReferenceId: submissionId,
        customerEmailPrefill: rawIntake.contactEmail,
      },
      automation: {
        buildStartedAt: null,
        buildCompletedAt: null,
        deployedAt: null,
        liveAt: null,
        textSentAt: null,
      },
      rawIntake,
    };

    for (let attempt = 1; attempt <= INTAKE_MAX_ATTEMPTS; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), INTAKE_TIMEOUT_MS);

      try {
        const response = await fetch(INTAKE_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          const apiError = await extractApiError(response);
          throw new Error(apiError);
        }

        const result = await response.json();
        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        if (attempt === INTAKE_MAX_ATTEMPTS) {
          throw error;
        }
        await wait(INTAKE_RETRY_DELAY_MS);
      }
    }
  };

  const handleNext = async () => {
    if (!isLastStep) {
      setStepError('');
      setDirection(1);
      setCurrentStepIdx((prev) => prev + 1);
      return;
    }

    setSubmitError('');
    setLoading(true);

    try {
      const result = await submitIntake();
      if (!result?.checkoutUrl) {
        throw new Error('Checkout URL missing from intake response');
      }

      window.location.href = result.checkoutUrl;
    } catch (error) {
      console.error('Intake submit failed:', error);
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : 'Could not submit your details right now. Please check your connection and try again.',
      );
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setStepError('');
      setDirection(-1);
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const updateFormData = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  handleNextRef.current = handleNext;

  return (
    <div className="root-wrapper">
      <div className="ambient-glow" />

      <div className="form-card">
        <span className="corner corner-tl" />
        <span className="corner corner-tr" />
        <span className="corner corner-bl" />
        <span className="corner corner-br" />

        <div className="card-header">
          <span className="brand-label">Website Intake</span>
          <span className="step-counter">
            <span className="step-current">{String(currentStepIdx + 1).padStart(2, '0')}</span>
            <span className="step-sep"> / </span>
            <span className="step-total">{String(steps.length).padStart(2, '0')}</span>
          </span>
        </div>

        <div className="progress-track">
          <motion.div
            className="progress-fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep.id}
            custom={direction}
            initial={{ opacity: 0, y: direction > 0 ? 18 : -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction > 0 ? -18 : 18 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="intake-step-content"
          >
            <div className="step-body">
            <div>
              <p className="step-label-tag">{currentStep.id}</p>
              <h1 className="step-title">{currentStep.title}</h1>
              <p className="step-description">{currentStep.description}</p>
            </div>

            {currentStep.id === 'template' ? (
              <TemplateStep formData={formData} updateFormData={updateFormData} />
            ) : (
              <div className="fields-container">
                {currentStep.fields.map((field) => (
                  <div key={field.name} className="field-group">
                    <label className="field-label">
                      {field.label}
                      {field.required && <span className="required-mark"> *</span>}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        className="field-textarea"
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(event) => updateFormData(field.name, event.target.value)}
                      />
                    ) : field.type === 'radio' ? (
                      <div className="radio-group">
                        {field.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => updateFormData(field.name, option)}
                            className={`radio-option${formData[field.name] === option ? ' radio-selected' : ''}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : field.type === 'file' ? (
                      <div className="file-upload">
                        <input
                          type="file"
                          className="file-input"
                          onChange={(event) => updateFormData(field.name, event.target.files[0])}
                        />
                        <div className="file-display">
                          {formData[field.name] ? (
                            <>
                              <Check size={16} className="upload-icon-check" />
                              <span className="upload-filename">{formData[field.name].name}</span>
                            </>
                          ) : (
                            <>
                              <Upload size={16} className="upload-icon" />
                              <span>Click to upload</span>
                              <span className="upload-hint">SVG, PNG, JPG — max 5MB</span>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        className="field-input"
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(event) => updateFormData(field.name, event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && handleNext()}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            </div>

            <div className="nav-row">
              <button
                onClick={handlePrev}
                disabled={loading}
                className={`nav-back${currentStepIdx === 0 ? ' nav-hidden' : ''}`}
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className={`nav-next${loading ? ' nav-loading' : ''}`}
              >
                {loading ? 'Submitting...' : isLastStep ? 'Submit & Pay →' : 'Continue →'}
              </button>
            </div>
            {stepError && <div className="checkout-error">{stepError}</div>}
            {submitError && <div className="checkout-error">{submitError}</div>}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="enter-hint">
        Press <span className="enter-key">Enter</span> to continue
      </div>
    </div>
  );
}
