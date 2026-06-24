import { useState, useEffect } from 'react';
import { X, Send, User, Phone, Mail, MessageSquare, Briefcase, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createLead } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LeadFormModal = ({ business, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', email: '', serviceRequired: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setForm({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        serviceRequired: '',
        message: ''
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {

      toast.error('Please login first');

      onClose();

      navigate('/login');

      return;
    }
    
    if (!form.name || !form.phone || !form.email) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      await createLead({
        businessId: business?.id,
        businessName: business?.businessName,
        customerName: form.name,
        phone: form.phone,
        email: form.email,
        serviceRequired: form.serviceRequired || 'General Consultation',
        message: form.message
      });

      setSubmitted(true);
      toast.success('Quote request sent successfully!');
    } 
    catch (err) {
      // console.error(err);
      if (err.response?.status === 401) {

        toast.error('Please login to contact this business');
        onClose();

        navigate('/login');

        return;
      }
      toast.error('Failed to send request');
    }
    finally {
      setLoading(false);
    }
  };
    
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-5 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-white font-bold text-lg">Request a Quote</h3>
              <p className="text-blue-100 text-sm mt-0.5">{business?.businessName}</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-5">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-teal-500" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">Request Sent!</h4>
              <p className="text-slate-500 text-sm">
                {business?.businessName} will contact you within 24 hours.
              </p>
              <button
                onClick={onClose}
                className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { name: 'name', label: 'Full Name *', icon: User, type: 'text', placeholder: 'John Doe' },
                { name: 'phone', label: 'Phone Number *', icon: Phone, type: 'tel', placeholder: '+91 98765 43210' },
                { name: 'email', label: 'Email Address *', icon: Mail, type: 'email', placeholder: 'john@email.com' },
                { name: 'serviceRequired', label: 'Service Required', icon: Briefcase, type: 'text', placeholder: 'e.g., SEO, Branding...' },
              ].map(({ name, label, icon: Icon, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                  <div className="relative">
                    <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={type}
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Message</label>
                <div className="relative">
                  <MessageSquare size={14} className="absolute left-3 top-3 text-slate-400" />
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe your requirements..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <><Send size={15} /> Send Quote Request</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadFormModal;
