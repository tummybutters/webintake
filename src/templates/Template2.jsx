import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const c = {
  bg: '#ffffff',
  surface: '#f4f7fb',
  navy: '#0f1f3d',
  blue: '#2563eb',
  blueLight: '#eff4ff',
  text: '#0f1f3d',
  muted: '#4a5568',
  border: '#e2e8f0',
};

const s = {
  root: { minHeight: '100vh', background: c.bg, color: c.text, fontFamily: "'Helvetica Neue', Arial, sans-serif", overflowX: 'hidden' },
  nav: { padding: '0 60px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${c.border}`, background: c.bg, position: 'sticky', top: 0, zIndex: 10 },
  navBrand: { fontSize: '15px', fontWeight: 800, letterSpacing: '-0.01em', color: c.navy },
  navBtn: { padding: '9px 22px', background: c.blue, color: '#fff', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' },
  hero: { padding: '100px 60px', maxWidth: '1120px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '80px', alignItems: 'center', minHeight: '82vh' },
  eyebrow: { display: 'inline-block', padding: '5px 12px', background: c.blueLight, color: c.blue, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '24px', borderRadius: '4px' },
  h1: { fontSize: 'clamp(2.4rem, 4.5vw, 4rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '24px', color: c.navy },
  heroP: { fontSize: '1.05rem', lineHeight: 1.78, color: c.muted, marginBottom: '40px' },
  btnPrimary: { padding: '14px 30px', background: c.blue, color: '#fff', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' },
  statCard: { padding: '28px 24px', background: c.bg, border: `1px solid ${c.border}`, borderRadius: '10px', borderLeft: `4px solid ${c.blue}`, marginBottom: '16px' },
  statNum: { fontSize: '2.4rem', fontWeight: 800, color: c.blue, lineHeight: 1, letterSpacing: '-0.04em' },
  statLabel: { fontSize: '13px', color: c.muted, marginTop: '6px' },
  bgSection: { background: c.surface, padding: '100px 0' },
  section: { padding: '100px 0' },
  wrap: { maxWidth: '1120px', margin: '0 auto', padding: '0 60px' },
  label: { fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: c.blue, marginBottom: '12px', display: 'block' },
  h2: { fontSize: 'clamp(1.9rem, 3.5vw, 2.9rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '28px', color: c.navy },
  p: { fontSize: '1rem', lineHeight: 1.8, color: c.muted, marginBottom: '16px', maxWidth: '600px' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '48px' },
  card: { padding: '36px 28px', background: c.bg, border: `1px solid ${c.border}`, borderRadius: '10px' },
  cardBar: { width: '36px', height: '4px', background: c.blue, borderRadius: '2px', marginBottom: '22px' },
  cardH: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: c.navy, lineHeight: 1.3 },
  cardP: { fontSize: '0.9rem', lineHeight: 1.75, color: c.muted },
  contactBg: { background: c.navy, padding: '100px 60px' },
  contactWrap: { maxWidth: '1120px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px' },
  input: { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none', borderRadius: '6px', display: 'block', marginBottom: '16px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none', borderRadius: '6px', resize: 'none', display: 'block', marginBottom: '16px', boxSizing: 'border-box' },
  footer: { padding: '24px 60px', borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: c.muted, background: c.bg },
};

const STATS = [
  ['$2B+', 'Capital Deployed'],
  ['150+', 'Transactions Closed'],
  ['98%', 'Investor Retention'],
];

const SERVICES = [
  ['Deal Sourcing & Acquisition', 'We identify and secure exclusive investment opportunities at competitive valuations, leveraging deep market relationships to deliver superior deal flow.'],
  ['Capital Structuring', 'From equity placement to debt facilitation, we build capital stacks that optimize risk-adjusted returns and align with each investor\'s objectives.'],
  ['Transaction Management', 'End-to-end oversight from letter of intent through closing — our team handles every detail to ensure seamless, transparent execution.'],
];

export default function Template2() {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-r]', { opacity: 0, y: 24 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out', delay: 0.15,
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} style={s.root}>
      <nav style={s.nav}>
        <span style={s.navBrand} data-r>YOUR COMPANY</span>
        <a href="#contact" style={s.navBtn} data-r>Get Started</a>
      </nav>

      <div style={s.hero}>
        <div>
          <span style={s.eyebrow} data-r>Capital & Advisory</span>
          <h1 style={s.h1} data-r>Institutional-Grade<br />Capital Solutions</h1>
          <p style={s.heroP} data-r>We partner with investors and operators to identify, structure, and execute transactions across private real estate, credit, and alternative asset classes.</p>
          <a href="#contact" style={s.btnPrimary} data-r>Explore Opportunities</a>
        </div>
        <div data-r>
          {STATS.map(([num, label]) => (
            <div key={label} style={s.statCard}>
              <div style={s.statNum}>{num}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.bgSection}>
        <div style={s.wrap}>
          <span style={s.label}>About</span>
          <h2 style={s.h2}>Built on expertise.<br />Driven by results.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <p style={{ ...s.p, maxWidth: '100%' }}>We are a privately held capital advisory firm focused on identifying, structuring, and executing investments across real estate and private markets. Our process is rigorous, our relationships are built on trust, and our outcomes are consistent.</p>
            <p style={{ ...s.p, maxWidth: '100%' }}>With deep expertise across acquisition, underwriting, and asset management, we provide partners with full-service support from initial evaluation through disposition — ensuring clarity and confidence at every stage.</p>
          </div>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.wrap}>
          <span style={s.label}>Services</span>
          <h2 style={s.h2}>What we do</h2>
          <div style={s.cardGrid}>
            {SERVICES.map(([h, p]) => (
              <div key={h} style={s.card}>
                <div style={s.cardBar} />
                <h3 style={s.cardH}>{h}</h3>
                <p style={s.cardP}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="contact" style={s.contactBg}>
        <div style={s.contactWrap}>
          <div>
            <span style={{ ...s.label, color: 'rgba(255,255,255,0.5)' }}>Contact</span>
            <h2 style={{ ...s.h2, color: '#fff' }}>Let's talk about<br />your next deal.</h2>
            <p style={{ ...s.p, color: 'rgba(255,255,255,0.6)', maxWidth: '100%' }}>Reach out to discuss opportunities, partnerships, or general inquiries. We respond to all qualified inquiries within 24 hours.</p>
            <div style={{ marginTop: '32px', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 2.4 }}>
              <div>contact@yourcompany.com</div>
              <div>(000) 000-0000</div>
              <div>123 Business Ave, Your City, ST 00000</div>
            </div>
          </div>
          <form onSubmit={e => e.preventDefault()}>
            <input placeholder="Name" style={s.input} />
            <input placeholder="Email" style={s.input} />
            <textarea placeholder="Message" rows={5} style={s.textarea} />
            <button style={{ ...s.btnPrimary, width: '100%', padding: '14px' }} type="submit">Send Message</button>
          </form>
        </div>
      </div>

      <div style={s.footer}>
        <span>© 2026 Your Company Name. All rights reserved.</span>
        <span>Privacy Policy</span>
      </div>
    </div>
  );
}
