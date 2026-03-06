import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { templates } from '../data/templates';

export default function TemplateGallery() {
  return (
    <div className="gallery-shell">
      <div className="gallery-ambient gallery-ambient-one" />
      <div className="gallery-ambient gallery-ambient-two" />

      <header className="gallery-header">
        <div>
          <p className="gallery-kicker">Template Chooser</p>
          <h1>Four premium starter sites built for fast personalization.</h1>
          <p className="gallery-subcopy">
            Each preview below is a real page in this app. Click any card to open the full
            template and use the matching `AGENTS.md` instructions to personalize it from intake
            data.
          </p>
        </div>

        <div className="gallery-actions">
          <a href="/" className="gallery-link">
            Back to intake
          </a>
        </div>
      </header>

      <div className="gallery-grid">
        {templates.map((template) => (
          <article key={template.slug} className="template-card">
            <div className="template-frame">
              <iframe
                title={`${template.name} preview`}
                src={`${template.route}?embed=1`}
                loading="lazy"
              />
              <Link to={template.route} className="template-frame-overlay" aria-label={`Open ${template.name}`}>
                <span>Open full preview</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="template-card-body">
              <div className="template-card-topline">
                <span>{template.label}</span>
                <span>{template.tagline}</span>
              </div>

              <h2>{template.name}</h2>
              <p>{template.summary}</p>

              <div className="template-swatches" aria-hidden="true">
                {template.palette.map((color) => (
                  <span key={color} style={{ background: color }} />
                ))}
              </div>

              <Link to={template.route} className="template-card-link">
                View template
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
