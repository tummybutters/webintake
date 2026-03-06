// Triggering Vercel deployment with a minor update
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Upload } from 'lucide-react';

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/4gMeVcbaLbU63cD0005AQ01';
const INTAKE_WEBHOOK_URL = import.meta.env.VITE_INTAKE_WEBHOOK_URL;
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
                <h1 className="success-title">You're all set.</h1>
                <p className="success-body">
                    Be on the lookout — we'll reach out within the next few hours
                    with either a call or text, and a link to your new website.
                </p>
                <p className="success-contact">
                    Questions? Reach us at{' '}
                    <a href="tel:+16025550000" className="success-phone">
                        (602) 555-0000
                    </a>
                </p>

                <div className="success-divider" />
                <p className="success-fine">Professional 1-Page Website · 3 months free hosting included</p>
            </motion.div>
        </div>
    );
}

// HSV → Hex (gradient square uses SV not SL)
function hsvToHex(h, s, v) {
    s /= 100; v /= 100;
    const k = (n) => (n + h / 60) % 6;
    const f = (n) => v - v * s * Math.max(0, Math.min(k(n), 4 - k(n), 1));
    const toH = (n) => Math.round(f(n) * 255).toString(16).padStart(2, '0');
    return `#${toH(5)}${toH(3)}${toH(1)}`;
}

function SpectrumPicker({ fieldName, label, value, onChange }) {
    const [hue, setHue] = useState(220);
    const [sat, setSat] = useState(65);
    const [val, setVal] = useState(35);
    const gradRef = useRef(null);
    const hueRef = useRef(null);
    const isDraggingGrad = useRef(false);
    const isDraggingHue = useRef(false);

    const hex = hsvToHex(hue, sat, val);

    useEffect(() => { onChange(fieldName, hex); }, [hue, sat, val]);

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

    useEffect(() => {
        const onMove = (e) => {
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            if (isDraggingGrad.current) updateGrad(cx, cy);
            if (isDraggingHue.current) updateHue(cx);
        };
        const onUp = () => { isDraggingGrad.current = false; isDraggingHue.current = false; };
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
    }, [updateGrad, updateHue]);

    return (
        <div className="spectrum-picker">
            <p className="spectrum-label">{label}</p>

            {/* Gradient square */}
            <div
                ref={gradRef}
                className="grad-square"
                style={{
                    background: `
                        linear-gradient(to bottom, transparent, #000),
                        linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))
                    `
                }}
                onMouseDown={(e) => { isDraggingGrad.current = true; updateGrad(e.clientX, e.clientY); e.preventDefault(); }}
                onTouchStart={(e) => { isDraggingGrad.current = true; updateGrad(e.touches[0].clientX, e.touches[0].clientY); }}
            >
                <div
                    className="grad-cursor"
                    style={{ left: `${sat}%`, top: `${100 - val}%` }}
                />
            </div>

            {/* Hue strip */}
            <div
                ref={hueRef}
                className="hue-strip"
                onMouseDown={(e) => { isDraggingHue.current = true; updateHue(e.clientX); e.preventDefault(); }}
                onTouchStart={(e) => { isDraggingHue.current = true; updateHue(e.touches[0].clientX); }}
            >
                <div className="hue-cursor" style={{ left: `${(hue / 360) * 100}%` }} />
            </div>

            {/* Color preview + hex readout */}
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

            {/* Keep both mounted so state is preserved when switching tabs */}
            <div style={{ display: active === 'primaryColor' ? 'block' : 'none' }}>
                <SpectrumPicker
                    fieldName="primaryColor"
                    label="Main Color"
                    value={formData.primaryColor}
                    onChange={updateFormData}
                />
            </div>
            <div style={{ display: active === 'secondaryColor' ? 'block' : 'none' }}>
                <SpectrumPicker
                    fieldName="secondaryColor"
                    label="Secondary Color"
                    value={formData.secondaryColor}
                    onChange={updateFormData}
                />
            </div>
        </div>
    );
}

const steps = [
    {
        id: 'contact',
        title: 'Contact Info',
        description: 'The site needs a way for banks (or anyone) to see a business exists.',
        fields: [
            { name: 'businessName', label: 'Business Name', placeholder: 'Blue Water Investing', type: 'text', required: true },
            { name: 'contactEmail', label: 'Contact Email', placeholder: 'email@example.com', type: 'email', required: true },
            { name: 'phoneNumber', label: 'Phone Number', placeholder: '+1 (555) 000-0000', type: 'tel', required: true },
            { name: 'businessAddress', label: 'Business Address', placeholder: '123 W Main St, Phoenix, AZ', type: 'text', required: true },
        ]
    },
    {
        id: 'domain',
        title: 'Domain',
        description: 'If your first choice is unavailable we will try the next one.',
        fields: [
            { name: 'domain1', label: 'Preferred Domain #1', placeholder: 'bluewaterinvesting.com', type: 'text', required: true },
            { name: 'domain2', label: 'Preferred Domain #2', placeholder: 'bluewaterinvestinggroup.com', type: 'text' },
            { name: 'domain3', label: 'Preferred Domain #3', placeholder: 'bluewatercapitalfunding.com', type: 'text' },
        ]
    },
    {
        id: 'description',
        title: 'What the Business Does',
        description: 'You only need one sentence. Your AI can expand it.',
        fields: [
            { name: 'businessDescription', label: 'What does your company do?', placeholder: 'We provide consulting and funding connections...', type: 'textarea', required: true },
        ]
    },
    {
        id: 'area',
        title: 'Service Area',
        description: 'Where do you operate?',
        fields: [
            { name: 'serviceArea', label: 'Areas you serve', placeholder: 'Nationwide or Arizona and Nevada', type: 'text', required: true },
        ]
    },
    {
        id: 'colors',
        title: 'Brand Colors',
        description: 'Pick your main and secondary colors. Drag the spectrum, then switch tabs.',
        fields: []
    },
    {
        id: 'logo',
        title: 'Logo',
        description: 'Optional. If blank, automation generates a simple text logo.',
        fields: [
            { name: 'logo', label: 'Upload a logo', type: 'file' },
        ]
    },
    {
        id: 'cta',
        title: 'Call to Action',
        description: 'This decides the primary button on the site.',
        fields: [
            {
                name: 'preferredContact',
                label: 'Preferred contact method',
                type: 'radio',
                options: ['Call', 'Text', 'Email'],
                required: true
            },
        ]
    }
];

export default function App() {
    const isSuccess = new URLSearchParams(window.location.search).get('success') === 'true';
    if (isSuccess) return <SuccessPage />;
    return <QuizApp />;
}

function QuizApp() {
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [formData, setFormData] = useState({});
    const [direction, setDirection] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const currentStep = steps[currentStepIdx];
    const progress = ((currentStepIdx + 1) / steps.length) * 100;
    const isLastStep = currentStepIdx === steps.length - 1;

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const submitIntake = async () => {
        if (!INTAKE_WEBHOOK_URL) {
            throw new Error('Webhook URL is not configured');
        }

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
                const response = await fetch(INTAKE_WEBHOOK_URL, {
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
            setDirection(1);
            setCurrentStepIdx(prev => prev + 1);
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
            setDirection(-1);
            setCurrentStepIdx(prev => prev - 1);
        }
    };

    const updateFormData = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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
                    >
                        <div>
                            <p className="step-label-tag">{currentStep.id}</p>
                            <h1 className="step-title">{currentStep.title}</h1>
                            <p className="step-description">{currentStep.description}</p>
                        </div>

                        {currentStep.id === 'colors' ? (
                            <ColorsStep formData={formData} updateFormData={updateFormData} />
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
                                                onChange={(e) => updateFormData(field.name, e.target.value)}
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
                                                    onChange={(e) => updateFormData(field.name, e.target.files[0])}
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
                                                onChange={(e) => updateFormData(field.name, e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

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
