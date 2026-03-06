import React, { useMemo, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ChevronLeft, Mail, MapPin, Phone } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getTemplateBySlug } from '../data/templates';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const contactDetails = [
  { icon: Mail, label: 'contact@firmname.com' },
  { icon: Phone, label: '(555) 000-0000' },
  { icon: MapPin, label: 'Nationwide service availability' },
];

const credibilityNotes = [
  'Premium boilerplate copy',
  'Built for bank-validation value',
  'Easy agent-driven personalization',
];

export default function TemplatePage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const pageRef = useRef(null);
  const template = getTemplateBySlug(slug);
  const isEmbed = searchParams.get('embed') === '1';

  const sectionLabel = useMemo(() => {
    if (!template) return '';
    return template.variant.toUpperCase();
  }, [template]);

  useGSAP(
    () => {
      if (!template) return undefined;

      const heroItems = gsap.utils.toArray('.js-hero-reveal');
      const panels = gsap.utils.toArray('.js-panel');
      const sections = gsap.utils.toArray('.js-section');

      gsap.set(heroItems, { y: 36, opacity: 0 });
      gsap.set(panels, { y: 28, opacity: 0 });

      const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTimeline.to(heroItems, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.12,
      });
      heroTimeline.to(
        '.js-orb',
        {
          scale: 1,
          opacity: 1,
          duration: 1.1,
          stagger: 0.08,
        },
        0.05,
      );
      heroTimeline.to(
        panels,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
        },
        0.2,
      );

      sections.forEach((section) => {
        const targets = section.querySelectorAll('.js-reveal');
        gsap.fromTo(
          targets,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: section,
              start: 'top 78%',
            },
          },
        );
      });

      gsap.to('.template-hero-visual-card--floating', {
        yPercent: -8,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    },
    { scope: pageRef, dependencies: [template] },
  );

  if (!template) {
    return (
      <div className="template-missing">
        <p>Template not found.</p>
        <Link to="/templates">Return to gallery</Link>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className={`template-page template-page--${template.variant}${isEmbed ? ' is-embed' : ''}`}
    >
      <div className="template-bg-grid" />
      <div className="template-orb template-orb-a js-orb" />
      <div className="template-orb template-orb-b js-orb" />
      <div className="template-orb template-orb-c js-orb" />

      {!isEmbed && (
        <div className="template-topbar">
          <Link to="/templates" className="template-backlink">
            <ChevronLeft size={16} />
            Template gallery
          </Link>
          <a href="/" className="template-intake-link">
            Website intake
          </a>
        </div>
      )}

      <main className="template-main">
        <section className="template-hero">
          <div className="template-hero-copy">
            <p className="template-kicker js-hero-reveal">{template.heroEyebrow}</p>
            <h1 className="template-hero-title js-hero-reveal">{template.heroTitle}</h1>
            <p className="template-hero-body js-hero-reveal">{template.heroBody}</p>

            <div className="template-hero-actions js-hero-reveal">
              <a href="#contact" className="template-primary-cta">
                {template.ctaPrimary}
              </a>
              <a href="#services" className="template-secondary-cta">
                {template.ctaSecondary}
              </a>
            </div>

            <div className="template-note-row js-hero-reveal">
              {credibilityNotes.map((note) => (
                <span key={note}>{note}</span>
              ))}
            </div>
          </div>

          <div className="template-hero-visual">
            <div className="template-hero-visual-card template-hero-visual-card--primary js-panel">
              <p>{template.label}</p>
              <h2>{template.name}</h2>
              <span>{template.tagline}</span>
            </div>
            <div className="template-hero-visual-card template-hero-visual-card--floating js-panel template-hero-visual-card--floating">
              <p>Framework</p>
              <ul>
                {template.metrics.map((metric) => (
                  <li key={metric.label}>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="template-hero-visual-card template-hero-visual-card--accent js-panel">
              <span>{sectionLabel}</span>
              <p>{template.introTitle}</p>
            </div>
          </div>
        </section>

        <section className="template-intro js-section">
          <div className="template-section-heading js-reveal">
            <p className="template-kicker">Positioning</p>
            <h2>{template.introTitle}</h2>
          </div>
          <p className="template-intro-body js-reveal">{template.introBody}</p>

          <div className="template-metric-grid">
            {template.metrics.map((metric) => (
              <article key={metric.label} className="template-metric-card js-reveal">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section id="services" className="template-services js-section">
          <div className="template-section-heading js-reveal">
            <p className="template-kicker">Services</p>
            <h2>{template.serviceTitle}</h2>
          </div>

          <div className="template-service-grid">
            {template.services.map((service, index) => (
              <article key={service.title} className={`template-service-card js-reveal template-service-card--${index + 1}`}>
                <p>{String(index + 1).padStart(2, '0')}</p>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="template-process js-section">
          <div className="template-section-heading js-reveal">
            <p className="template-kicker">Process</p>
            <h2>{template.processTitle}</h2>
          </div>

          <div className="template-process-list">
            {template.process.map((item) => (
              <article key={item.step} className="template-process-item js-reveal">
                <span>{item.step}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="template-contact js-section">
          <div className="template-contact-copy js-reveal">
            <p className="template-kicker">Contact</p>
            <h2>{template.contactTitle}</h2>
            <p>{template.contactBody}</p>
          </div>

          <div className="template-contact-card js-reveal">
            <div className="template-contact-card-head">
              <h3>{template.name}</h3>
              <a href="mailto:contact@firmname.com">
                contact@firmname.com
                <ArrowUpRight size={16} />
              </a>
            </div>

            <div className="template-contact-list">
              {contactDetails.map((detail) => {
                const Icon = detail.icon;
                return (
                  <div key={detail.label} className="template-contact-item">
                    <Icon size={16} />
                    <span>{detail.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
