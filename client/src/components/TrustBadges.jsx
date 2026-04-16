import { ShieldCheck, Phone, Award, Star } from 'lucide-react';
import './TrustBadges.css';

const BADGES = [
  {
    icon: <ShieldCheck size={20} />,
    title: 'NABH & JCI Accredited',
    desc: 'Internationally certified hospitals meeting global care standards',
    color: 'emerald',
  },
  {
    icon: <Phone size={20} />,
    title: 'Free Visa Invitation Letter',
    desc: 'We handle your medical visa documentation — guaranteed within 48 hrs',
    color: 'blue',
  },
  {
    icon: <Award size={20} />,
    title: 'Dedicated Care Coordinator',
    desc: 'Your personal guide from arrival to recovery, 24/7 support',
    color: 'violet',
  },
  {
    icon: <Star size={20} />,
    title: 'Book Now, Pay Later',
    desc: 'Reserve your spot today — settle payment on arrival in India',
    color: 'amber',
  },
];

export default function TrustBadges() {
  return (
    <section className="trust-bar" aria-label="Why patients trust Rogveda">
      <div className="container">
        <div className="trust-grid">
          {BADGES.map((b, i) => (
            <div key={i} className={`trust-item trust-item--${b.color}`}>
              <div className="trust-icon">{b.icon}</div>
              <div className="trust-content">
                <p className="trust-title">{b.title}</p>
                <p className="trust-desc">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
