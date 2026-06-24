import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  AlertCircle
} from 'lucide-react';
import { loginUserApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setLoggedInUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!email || !password) {

      toast.error(
        'Please enter credentials'
      );

      return;
    }

    setLoading(true);

    try {

      const data =
        await loginUserApi(
          email,
          password
        );

      if (
        data.user.role !==
        'admin'
      ) {

        toast.error(
          'Admin access only'
        );

        return;
      }

      localStorage.setItem(
        'token',
        data.token
      );

      setLoggedInUser(
        data.user
      );

      toast.success(
        'Welcome back, Admin!'
      );

      navigate(
        '/admin/dashboard'
      );

    } catch (err) {

      toast.error(
        err?.response?.data?.detail ||
        'Invalid credentials'
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <Building2 size={30} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">Right Ads Digital</div>
              <div className="text-blue-300 text-xs">Admin Panel</div>
            </div>
          </Link>
        </div>



   


          <div className="text-center mt-5">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Back to main website
            </Link>
          </div>
        </div>
      </div>
  );
};

export default AdminLogin;
