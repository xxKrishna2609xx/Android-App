import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, BadgeCheck, Shield, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [phone,           setPhone]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [loading,         setLoading]         = useState(false);

  const { signupUser } = useAuth();
  const navigate       = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error('All fields are required.'); return;
    }
    if (password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match.'); return; }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) { toast.error('Please enter a valid 10-digit phone number.'); return; }

    setLoading(true);
    try {
      await signupUser(name, email, cleanPhone, password);
      toast.success('Registration successful! Welcome to Right Ads.');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', paddingLeft: 40, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
    fontSize: 14, border: '1.5px solid #EBEBEB', borderRadius: 12, outline: 'none',
    background: '#fff', color: '#111', fontFamily: 'inherit', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#ffffff', fontFamily: "'Outfit', sans-serif" }}>

      {/* ── Left panel ─────────────────────────────── */}
      <div style={{
        display: 'none',
        flex: '0 0 50%',
        background: 'linear-gradient(150deg, #00B8FF 0%, #0099D4 60%, #007aaa 100%)',
        position: 'relative',
        overflow: 'hidden',
      }} className="signup-left-panel">
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', color: '#fff' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56, textDecoration: 'none' }}>
            <img src="/logo-light.png" alt="Right Ads" style={{ height: 40, width: 'auto' }} />
          </Link>

          <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.2, color: '#fff', marginBottom: 16 }}>
            Join India's trusted<br />business directory.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, marginBottom: 48, maxWidth: 380 }}>
            Create your free account to list your business, get direct leads, and reach thousands of customers across India.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { Icon: BadgeCheck, text: 'Manually verified listings for higher trust' },
              { Icon: Star,       text: 'Direct leads via phone & WhatsApp' },
              { Icon: Shield,     text: 'Free listing — no hidden charges' },
            ].map(({ Icon, text }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color="#fff" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel / form ─────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }} className="signup-mobile-logo">
            <Link to="/">
              <img src="/logo.png" alt="Right Ads" style={{ height: 42, width: 'auto' }} />
            </Link>
          </div>

          <div style={{
            background: '#fff',
            border: '1.5px solid #EBEBEB',
            borderRadius: 24,
            padding: '36px 32px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
          }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fbff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <User size={22} color="#00B8FF" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 4 }}>Create Account</h2>
              <p style={{ fontSize: 14, color: '#717171' }}>Join Right Ads Business Directory today</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#00B8FF'}
                    onBlur={(e)  => e.target.style.borderColor = '#EBEBEB'} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#00B8FF'}
                    onBlur={(e)  => e.target.style.borderColor = '#EBEBEB'} />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#00B8FF'}
                    onBlur={(e)  => e.target.style.borderColor = '#EBEBEB'} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters" required
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={(e) => e.target.style.borderColor = '#00B8FF'}
                    onBlur={(e)  => e.target.style.borderColor = '#EBEBEB'} />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex' }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 5 }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                  <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#00B8FF'}
                    onBlur={(e)  => e.target.style.borderColor = '#EBEBEB'} />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px',
                  background: loading ? '#99e0f7' : '#00B8FF',
                  color: '#fff', fontSize: 15, fontWeight: 700,
                  border: 'none', borderRadius: 12,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.2s', marginTop: 4,
                }}
                onMouseEnter={(e) => { if (!loading) e.target.style.background = '#0099D4'; }}
                onMouseLeave={(e) => { if (!loading) e.target.style.background = '#00B8FF'; }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Creating Account...
                  </>
                ) : 'Create Account'}
              </button>
            </form>

            <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid #f5f5f5', textAlign: 'center', fontSize: 14, color: '#717171' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#00B8FF', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) {
          .signup-left-panel  { display: flex !important; flex-direction: column; }
          .signup-mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Signup;
