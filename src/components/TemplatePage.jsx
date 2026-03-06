import React, { useRef } from 'react';
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

export default function TemplatePage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const pageRef = useRef(null);
  const template = getTemplateBySlug(slug);
  const isEmbed = searchParams.get('embed') === '1';

  useGSAP(
    () => {
      if (!template) return undefined;

      const heroItems = gsap.utils.toArray('.js-hero-reveal');
      const sections = gsap.utils.toArray('.js-section');

      gsap.fromTo(
        heroItems,
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.09,
          ease: 'power2.out',
        },
      );

      sections.forEach((section) => {
        const targets = section.querySelectorAll('.js-reveal');
        gsap.fromTo(
          targets,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 82%',
            },
          },
        );
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
        <section className="template-shell template-hero js-section">
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
          </div>

          <aside className="template-hero-side js-hero-reveal">
            <div className="template-side-card">
              <span>{template.label}</span>
              <h2>{template.name}</h2>
              <p>{template.tagline}</p>
            </div>

            <div className="template-metric-list">
              {template.metrics.map((metric) => (
                <div key={metric.label} className="template-metric-row">
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="template-shell template-intro js-section">
          <div className="template-section-heading js-reveal">
            <p className="template-kicker">Overview</p>
            <h2>{template.introTitle}</h2>
          </div>
          <p className="template-intro-body js-reveal">{template.introBody}</p>
        </section>

        <section id="services" className="template-shell template-services js-section">
          <div className="template-section-heading js-reveal">
            <p className="template-kicker">Services</p>
            <h2>{template.serviceTitle}</h2>
          </div>

          <div className="template-service-grid">
            {template.services.map((service) => (
              <article key={service.title} className="template-service-card js-reveal">
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="template-shell template-process js-section">
          <div className="template-section-heading js-reveal">
            <p className="template-kicker">Process</p>
            <h2>{template.processTitle}</h2>
          </div>

          <div className="template-process-grid">
            {template.process.map((item) => (
              <article key={item.step} className="template-process-item js-reveal">
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="template-shell template-contact js-section">
          <div className="template-contact-copy js-reveal">
            <p className="template-kicker">Contact</p>
            <h2>{template.contactTitle}</h2>
            <p>{template.contactBody}</p>
          </div>

          <div className="template-contact-card js-reveal">
            <div className="template-contact-card-head">
              <div>
                <h3>{template.name}</h3>
                <p>Professional one-page presentation</p>
              </div>
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
