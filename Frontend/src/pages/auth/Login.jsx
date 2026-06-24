import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, Building2, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to dashboard or where they came from
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }
 
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      
      // If admin, redirect to admin dashboard
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
        if (err.response?.status === 401) {

          toast.error('Invalid email or password');
 
          return;
        }
        toast.error(err.response?.data?.detail || 'Login failed. Please try again.');
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Column: Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative items-center justify-center p-12 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-md relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <img src="/logo-icon-light.png" alt="Right Ads Logo" className="w-12 h-12 object-contain" />
            <div>
              <div className="text-2xl font-black leading-tight">Right Ads</div>
              <div className="text-teal-300 text-xs font-semibold tracking-wider uppercase">Business Directory</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black leading-tight">
              Connect with the Best <br />
              <span className="text-yellow-300">Local Services</span>
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Create an account or sign in to get direct quotes, manage your business listings, and bookmark your favorite service providers.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            {[
              'Get quotes from 700+ verified businesses',
              'Fast & direct contact via Phone or WhatsApp',
              'Save your preferred listings for quick access',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm font-medium">
                <Sparkles size={16} className="text-yellow-300 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100">
          <div className="text-center lg:text-left">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-4">
              <LogIn size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Sign In</h2>
            <p className="text-slate-500 text-sm mt-1">Access your Right Ads account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="text-center pt-4 border-t border-slate-100 text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline font-bold">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
