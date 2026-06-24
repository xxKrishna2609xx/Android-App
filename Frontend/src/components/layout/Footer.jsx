import { Link } from 'react-router-dom';
import {
  Mail, Phone, MapPin, ArrowRight, Heart
} from 'lucide-react';
import { Facebook, Instagram, Linkedin, Twitter } from '../common/SocialIcons';
import { useState, useEffect } from 'react';
import { getCategories } from '../../services/api';

const Footer = () => {
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);
  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* CTA Strip */}
      {/* <div className="bg-gradient-to-r from-blue-600 to-teal-500">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white text-xl font-bold">Ready to grow your business?</h3>
            <p className="text-blue-100 text-sm mt-1">Join 700+ verified businesses on Right Ads Digital</p>
          </div>
          <Link
            to="/apply"
            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-lg"
          >
            List Your Business Free <ArrowRight size={16} />
          </Link>
        </div>
      </div> */}

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img
                src="/logo-light.png"
                alt="Right Ads Logo"
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              India's premier digital business directory connecting customers with verified local businesses across all categories.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Facebook, href: import.meta.env.VITE_SOCIAL_FACEBOOK || '#' },
                { Icon: Instagram, href: import.meta.env.VITE_SOCIAL_INSTAGRAM || '#' },
                { Icon: Linkedin, href: import.meta.env.VITE_SOCIAL_LINKEDIN || '#' },
                { Icon: Twitter, href: import.meta.env.VITE_SOCIAL_TWITTER || '#' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Categories</h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight size={12} /> {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'Search Businesses', to: '/search' },
                { label: 'List Your Business', to: '/apply' },
                { label: 'Admin Panel', to: '/admin/login' },
                { label: 'Privacy Policy', to: import.meta.env.VITE_POLICY_PRIVACY || '#' },
                { label: 'Terms of Service', to: import.meta.env.VITE_POLICY_TERMS || '#' },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight size={12} /> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-slate-400">
                <MapPin size={15} className="mt-0.5 text-blue-400 flex-shrink-0" />
                {import.meta.env.VITE_CONTACT_ADDRESS || "14, Business Hub, Sector 21, Mumbai, Maharashtra 400001"}
              </li>
              <li>
                <a 
                  href={`tel:${(import.meta.env.VITE_CONTACT_PHONE || "+91 98765 00000").replace(/\s+/g, '')}`} 
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Phone size={15} className="text-blue-400" /> {import.meta.env.VITE_CONTACT_PHONE || "+91 98765 00000"}
                </a>
              </li>
              <li>
                <a 
                  href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL || "support@rightadsdigital.com"}`} 
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Mail size={15} className="text-blue-400" /> {import.meta.env.VITE_CONTACT_EMAIL || "support@rightadsdigital.com"}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Right Ads Digital. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={11} className="text-rose-400 fill-rose-400" /> by Right Ads Digital Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
