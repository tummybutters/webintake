import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Upload } from 'lucide-react';

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/4gMeVcbaLbU63cD0005AQ01';
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

function hsvToHex(h, s, v) {
  s /= 100;
  v /= 100;
  const k = (n) => (n + h / 60) % 6;
  const f = (n) => v - v * s * Math.max(0, Math.min(k(n), 4 - k(n), 1));
  const toH = (n) => Math.round(f(n) * 255).toString(16).padStart(2, '0');
  return `#${toH(5)}${toH(3)}${toH(1)}`;
}

function SpectrumPicker({ fieldName, label, onChange }) {
  const [hue, setHue] = useState(220);
  const [sat, setSat] = useState(65);
  const [val, setVal] = useState(35);
  const gradRef = useRef(null);
  const hueRef = useRef(null);
  const valRef = useRef(null);
  const isDraggingGrad = useRef(false);
  const isDraggingHue = useRef(false);
  const isDraggingVal = useRef(false);

  const hex = hsvToHex(hue, sat, val);

  useEffect(() => {
    onChange(fieldName, hex);
  }, [fieldName, hex, onChange]);

  const updateGrad = useCallback((clientX, clientY) => {
    const rect = gradRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setSat(Math.round(x * 100));
    setVal(Math.round((1 - y) * 100));
  }, []);

  const updateHue = useCallback((clientX) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setHue(Math.round(x * 360));
  }, []);

  const updateVal = useCallback((clientX) => {
    const rect = valRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setVal(Math.round(x * 100));
  }, []);

  useEffect(() => {
    const onMove = (event) => {
      const cx = event.touches ? event.touches[0].clientX : event.clientX;
      const cy = event.touches ? event.touches[0].clientY : event.clientY;
      if (isDraggingGrad.current) updateGrad(cx, cy);
      if (isDraggingHue.current) updateHue(cx);
      if (isDraggingVal.current) updateVal(cx);
    };
    const onUp = () => {
      isDraggingGrad.current = false;
      isDraggingHue.current = false;
      isDraggingVal.current = false;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [updateGrad, updateHue, updateVal]);

  return (
    <div className="spectrum-picker">
      <p className="spectrum-label">{label}</p>

      <div
        ref={gradRef}
        className="grad-square"
        style={{
          background: `
            linear-gradient(to bottom, transparent, #000),
            linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))
          `,
        }}
        onMouseDown={(event) => {
          isDraggingGrad.current = true;
          updateGrad(event.clientX, event.clientY);
          event.preventDefault();
        }}
        onTouchStart={(event) => {
          isDraggingGrad.current = true;
          updateGrad(event.touches[0].clientX, event.touches[0].clientY);
        }}
      >
        <div className="grad-cursor" style={{ left: `${sat}%`, top: `${100 - val}%` }} />
      </div>

      <div
        ref={hueRef}
        className="hue-strip"
        onMouseDown={(event) => {
          isDraggingHue.current = true;
          updateHue(event.clientX);
          event.preventDefault();
        }}
        onTouchStart={(event) => {
          isDraggingHue.current = true;
          updateHue(event.touches[0].clientX);
        }}
      >
        <div className="hue-cursor" style={{ left: `${(hue / 360) * 100}%` }} />
      </div>

      <div
        ref={valRef}
        className="val-strip"
        style={{ background: `linear-gradient(90deg, #000, hsl(${hue}, 100%, 50%))` }}
        onMouseDown={(event) => {
          isDraggingVal.current = true;
          updateVal(event.clientX);
          event.preventDefault();
        }}
        onTouchStart={(event) => {
          isDraggingVal.current = true;
          updateVal(event.touches[0].clientX);
        }}
      >
        <div className="hue-cursor" style={{ left: `${val}%` }} />
      </div>

      <div className="color-readout">
        <div className="color-block" style={{ background: hex }} />
        <div className="hex-readout">
          <span className="hex-symbol">#</span>
          <span className="hex-code">{hex.replace('#', '').toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}

function ColorsStep({ formData, updateFormData }) {
  const [active, setActive] = useState('primaryColor');

  return (
    <div className="colors-step">
      <div className="color-tabs">
        <button
          className={`color-tab${active === 'primaryColor' ? ' color-tab-active' : ''}`}
          onClick={() => setActive('primaryColor')}
        >
          Main Color
          {formData.primaryColor && (
            <span className="tab-swatch" style={{ background: formData.primaryColor }} />
          )}
        </button>
        <button
          className={`color-tab${active === 'secondaryColor' ? ' color-tab-active' : ''}`}
          onClick={() => setActive('secondaryColor')}
        >
          Secondary Color
          {formData.secondaryColor && (
            <span className="tab-swatch" style={{ background: formData.secondaryColor }} />
          )}
        </button>
      </div>

      <div style={{ display: active === 'primaryColor' ? 'block' : 'none' }}>
        <SpectrumPicker fieldName="primaryColor" label="Main Color" onChange={updateFormData} />
      </div>
      <div style={{ display: active === 'secondaryColor' ? 'block' : 'none' }}>
        <SpectrumPicker fieldName="secondaryColor" label="Secondary Color" onChange={updateFormData} />
      </div>
    </div>
  );
}

const TEMPLATES = [
  { id: '1', name: 'Obsidian', desc: 'Dark luxury', url: '/preview/1' },
  { id: '2', name: 'Clearfield', desc: 'Clean & light', url: '/preview/2' },
  { id: '3', name: 'Summit', desc: 'Bold modern', url: '/preview/3' },
  { id: '4', name: 'Ashford', desc: 'Warm classic', url: '/preview/4' },
];

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
    description: 'The site needs a way for banks, clients, and partners to see the business exists.',
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
    id: 'description',
    title: 'What the Business Does',
    description: 'One sentence is enough. We can shape it into polished website copy.',
    fields: [
      {
        name: 'businessDescription',
        label: 'What does your company do?',
        placeholder: 'We help real estate operators access capital and move opportunities forward...',
        type: 'textarea',
        required: true,
      },
    ],
  },
  {
    id: 'area',
    title: 'Service Area',
    description: 'Where do you operate?',
    fields: [{ name: 'serviceArea', label: 'Areas you serve', placeholder: 'Nationwide or Arizona and Nevada', type: 'text', required: true }],
  },
  {
    id: 'colors',
    title: 'Brand Colors',
    description: 'Pick your main and secondary colors. Drag the spectrum, then switch tabs.',
    fields: [],
  },
  {
    id: 'template',
    title: 'Choose a Design',
    description: 'Select a layout. Click a preview to select it, or open full size in a new tab.',
    fields: [],
  },
  {
    id: 'logo',
    title: 'Logo',
    description: 'Optional. If blank, automation can generate a premium text-first logo.',
    fields: [{ name: 'logo', label: 'Upload a logo', type: 'file' }],
  },
  {
    id: 'cta',
    title: 'Call To Action',
    description: 'This decides the main button treatment on the finished site.',
    fields: [
      {
        name: 'preferredContact',
        label: 'Preferred contact method',
        type: 'radio',
        options: ['Call', 'Text', 'Email'],
        required: true,
      },
    ],
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
    const payload = {
      businessName: formData.businessName || '',
      contactEmail: formData.contactEmail || '',
      phoneNumber: formData.phoneNumber || '',
      businessAddress: formData.businessAddress || '',
      domain1: formData.domain1 || '',
      domain2: formData.domain2 || '',
      domain3: formData.domain3 || '',
      businessDescription: formData.businessDescription || '',
      serviceArea: formData.serviceArea || '',
      primaryColor: formData.primaryColor || '',
      secondaryColor: formData.secondaryColor || '',
      preferredContact: formData.preferredContact || '',
      logoFileName: formData.logo?.name || '',
      submittedAt: new Date().toISOString(),
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
          throw new Error(`Webhook responded with ${response.status}`);
        }

        clearTimeout(timeoutId);
        return;
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
      await submitIntake();

      const params = new URLSearchParams();
      if (formData.contactEmail) params.set('prefilled_email', formData.contactEmail);
      window.location.href = `${STRIPE_PAYMENT_LINK}?${params.toString()}`;
    } catch (error) {
      console.error('Intake submit failed:', error);
      setSubmitError('Could not submit your details right now. Please check your connection and try again.');
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

            {currentStep.id === 'colors' ? (
              <ColorsStep formData={formData} updateFormData={updateFormData} />
            ) : currentStep.id === 'template' ? (
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
