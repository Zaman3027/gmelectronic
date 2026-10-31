import { useState, type ChangeEvent, type FormEvent, type ComponentType, type SVGProps } from 'react';
import { submitInquiry, ApiError, type InquiryPayload } from './api';
import {
  BoltIcon,
  TvIcon,
  PhoneMobileIcon,
  WasherIcon,
  LaptopIcon,
  PinIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  CheckIcon,
  AlertIcon,
} from './Icons';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const DEVICE_TYPES = [
  'Television',
  'Mobile',
  'Washing Machine',
  'Laptop',
  'Other',
] as const;

interface Service {
  Icon: IconType;
  title: string;
  desc: string;
}

const SERVICES: Service[] = [
  { Icon: TvIcon, title: 'Televisions', desc: 'Panels, backlights, power boards, smart-TV mainboards.' },
  { Icon: PhoneMobileIcon, title: 'Mobiles & Tablets', desc: 'Screens, batteries, charging ports, water damage.' },
  { Icon: WasherIcon, title: 'Washing Machines', desc: 'Control boards, motors, sensors, drainage systems.' },
  { Icon: LaptopIcon, title: 'Laptops & More', desc: 'Any circuit-based device — microwaves, ACs, audio gear.' },
];

interface ContactItem {
  Icon: IconType;
  label: string;
  value: string;
}

const CONTACT: ContactItem[] = [
  { Icon: PinIcon, label: 'Address', value: '142 Circuit Lane, Tech Bazaar, Dhaka 1207' },
  { Icon: PhoneIcon, label: 'Phone', value: '+880 1700-000000' },
  { Icon: MailIcon, label: 'Email', value: 'support@mondalelectronics.com' },
  { Icon: ClockIcon, label: 'Hours', value: 'Sat–Thu 9:00 AM – 8:00 PM' },
];

type Status =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'success' }
  | { state: 'error'; message: string; details?: Record<string, string[]> };

const EMPTY: InquiryPayload = {
  name: '',
  phone: '',
  email: '',
  deviceType: 'Television',
  message: '',
};

export default function App() {
  const [form, setForm] = useState<InquiryPayload>(EMPTY);
  const [status, setStatus] = useState<Status>({ state: 'idle' });

  const update = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ state: 'loading' });
    try {
      await submitInquiry(form);
      setStatus({ state: 'success' });
      setForm(EMPTY);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Something went wrong.';
      const details = err instanceof ApiError ? err.details : undefined;
      setStatus({ state: 'error', message, details });
    }
  };

  return (
    <div className="page">
      <header className="nav">
        <div className="brand">
          <span className="brand-mark">
            <BoltIcon width={20} height={20} />
          </span>
          Mondal <span className="brand-accent">Electronics</span>
        </div>
        <button className="btn btn-primary">Book a Repair</button>
      </header>

      <section className="hero">
        <div className="blob blob-a" />
        <div className="blob blob-b" />
        <div className="hero-inner">
          <div className="pill">
            <span className="dot" /> Trusted by 12,000+ customers
          </div>
          <h1>
            If it has a circuit,
            <br />
            <span className="grad-text">we can fix it.</span>
          </h1>
          <p className="hero-sub">
            TVs, mobiles, washing machines, laptops &amp; appliances — expert
            diagnostics and same-day repairs, backed by a 90-day warranty on
            every job.
          </p>
          <div className="hero-cta">
            <a href="#inquiry" className="btn btn-primary">Get a Free Quote</a>
            <a href="tel:+8801700000000" className="btn btn-ghost">
              <PhoneIcon width={18} height={18} /> Call Now
            </a>
          </div>
        </div>
      </section>

      <section className="services">
        <h2>What We Repair</h2>
        <p className="section-sub">Any electronic device with a circuit board</p>
        <div className="grid">
          {SERVICES.map(({ Icon, title, desc }) => (
            <div className="card" key={title}>
              <div className="icon-tile">
                <Icon width={26} height={26} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="contact" id="inquiry">
        <div className="contact-info">
          <h2>Contact Us</h2>
          <p className="section-sub">
            Drop by the shop or reach out — we usually reply within an hour.
          </p>
          <div className="contact-list">
            {CONTACT.map(({ Icon, label, value }) => (
              <div className="contact-row" key={label}>
                <span className="icon-tile sm">
                  <Icon width={18} height={18} />
                </span>
                <span>
                  <b>{label}</b>
                  <br />
                  <span className="muted">{value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <form className="form-card" onSubmit={onSubmit}>
          <h3>Repair Inquiry Form</h3>
          <p className="section-sub">
            Tell us about your device and we'll get back with a quote.
          </p>

          <div className="form-grid">
            <label className="field">
              <span>Full Name</span>
              <input name="name" value={form.name} onChange={update} placeholder="Your name" required />
            </label>
            <label className="field">
              <span>Phone</span>
              <input name="phone" value={form.phone} onChange={update} placeholder="+880…" required />
            </label>
            <label className="field wide">
              <span>Email</span>
              <input name="email" type="email" value={form.email} onChange={update} placeholder="you@email.com" />
            </label>
            <label className="field wide">
              <span>Device Type</span>
              <select name="deviceType" value={form.deviceType} onChange={update}>
                {DEVICE_TYPES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="field wide">
              <span>Describe the problem</span>
              <textarea name="message" rows={3} value={form.message} onChange={update} placeholder="e.g. TV turns on but no picture…" required />
            </label>
          </div>

          <button className="btn btn-primary full" type="submit" disabled={status.state === 'loading'}>
            {status.state === 'loading' ? 'Sending…' : 'Submit Inquiry →'}
          </button>

          {status.state === 'success' && (
            <p className="msg ok">
              <CheckIcon width={18} height={18} /> Thanks! We've received your inquiry and will contact you shortly.
            </p>
          )}
          {status.state === 'error' && (
            <p className="msg err">
              <AlertIcon width={18} height={18} /> {status.message}
            </p>
          )}
        </form>
      </section>

      <footer className="footer">
        © 2026 Mondal Electronics Repair · 142 Circuit Lane, Dhaka · +880 1700-000000
      </footer>
    </div>
  );
}
