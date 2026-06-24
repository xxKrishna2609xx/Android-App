import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logo from './assets/logo.png';

/* ─── Branded Loader Screen ─────────────────────────────────────────
   Always visible for at least 1 second (2s used below for smooth experience).
   Shows the Right Ads logo centered with a pulse ring + loading bar.
   Once both auth AND the minimum duration have elapsed, the loader
   fades out and the logo flies to its final position in the navbar
   via layoutId="brand-logo".
──────────────────────────────────────────────────────────────────── */
function BrandedLoader() {
  return (
    <motion.div
      key="brand-loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2 } }}
      exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeInOut' } }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#fff',
      }}
    >
      {/* Outer slow-pulse glow ring */}
      <motion.div
        animate={{ scale: [1, 1.22, 1], opacity: [0.25, 0.08, 0.25] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,86,219,0.14) 0%, transparent 70%)',
          border: '1.5px solid rgba(26,86,219,0.10)',
        }}
      />

      {/* Inner faster-pulse ring */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.18, 0.45] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        style={{
          position: 'absolute',
          width: 100, height: 100, borderRadius: '50%',
          border: '2px solid rgba(26,86,219,0.22)',
        }}
      />

      {/* Logo — shared layout ID ties it to the navbar logo on exit */}
      <motion.img
        layoutId="brand-logo"
        src={logo}
        alt="Right Ads"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ width: 'auto', height: 60, position: 'relative', zIndex: 1 }}
      />

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        style={{
          marginTop: 22, fontSize: 13, fontWeight: 500,
          color: '#aaa', fontFamily: 'Outfit, sans-serif',
          letterSpacing: '0.04em',
        }}
      >
        Connecting Local Businesses…
      </motion.p>

      {/* Animated loading bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 3, background: '#f0f4ff', overflow: 'hidden',
      }}>
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.1 }}
          style={{
            height: '100%', width: '40%',
            background: 'linear-gradient(90deg, transparent, #1a56db, #60a5fa, transparent)',
            borderRadius: 2,
          }}
        />
      </div>
    </motion.div>
  );
}

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import HomePage from './pages/public/Home';
import SearchResults from './pages/public/SearchResults';
import CategoryBrowse from './pages/public/CategoryBrowse';
import BusinessDetails from './pages/public/BusinessDetails';
import ApplyListing from './pages/public/ApplyListing';
import EditBusiness from "./pages/user/EditBusiness";
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import UserDashboard from './pages/user/UserDashboard';
import Categories from "./pages/public/Categories";

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ManageApplications from './pages/admin/ManageApplications';
import ManageListings from './pages/admin/ManageListings';
import ManageCategories from './pages/admin/ManageCategories';
import ManageLeads from './pages/admin/ManageLeads';


// Protected Route for Admin
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // BrandedLoader handles global loading state
  return user?.role === 'admin' ? children : <Navigate to="/login" replace />;
};

// User Protected Route
const UserProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // BrandedLoader handles global loading state
  return user ? children : <Navigate to="/login" replace />;
};



// Public layout wrapper
const PublicLayout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isSearch = location.pathname === '/search';
  return (
    <>
      <Navbar />
      {/* Homepage manages its own spacer inside Navbar.jsx */}
      {/* Search page: paddingTop handled inside SearchResults itself */}
      {/* Other pages: pt-16 (64px) clears the fixed navbar */}
      <main className={!isHome && !isSearch ? 'pt-16' : ''}>{children}</main>
      <Footer />
    </>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/search" element={<PublicLayout><SearchResults /></PublicLayout>} />
      <Route path="/category/:categorySlug" element={<PublicLayout><CategoryBrowse /></PublicLayout>} />
      <Route path="/category/:categorySlug/:subcategorySlug" element={<PublicLayout><CategoryBrowse /></PublicLayout>} />
      <Route path="/business/:id" element={<PublicLayout><BusinessDetails /></PublicLayout>} />
      <Route path="/apply" element={<PublicLayout><UserProtectedRoute><ApplyListing /></UserProtectedRoute></PublicLayout>}/>
      <Route
        path="/categories"
        element={
          <PublicLayout>
            <Categories />
          </PublicLayout>
        }
      />
      <Route
        path="/dashboard/edit-business/:id"
        element={
          <PublicLayout>
            <UserProtectedRoute>
              <EditBusiness />
            </UserProtectedRoute>
          </PublicLayout>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* User Dashboard Route */}
      <Route path="/dashboard" element={<PublicLayout><UserProtectedRoute><UserDashboard /></UserProtectedRoute></PublicLayout>} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/applications" element={<ProtectedRoute><ManageApplications /></ProtectedRoute>} />
      <Route path="/admin/listings" element={<ProtectedRoute><ManageListings /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute><ManageCategories /></ProtectedRoute>} />
      <Route path="/admin/leads" element={<ProtectedRoute><ManageLeads /></ProtectedRoute>} />

      {/* Redirect /admin → /admin/dashboard */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={
        <PublicLayout>
          <div className="min-h-screen flex items-center justify-center pt-24">
            <div className="text-center">
              <div className="text-8xl font-black text-slate-100 mb-4">404</div>
              <h1 className="text-2xl font-bold text-slate-700">Page Not Found</h1>
              <a href="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">Go Home</a>
            </div>
          </div>
        </PublicLayout>
      } />
    </Routes>
  );
}

// Helper component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/* ─── Inner App — enforces minimum loader display ─────────────── */
function InnerApp() {
  const { loading: authLoading } = useAuth();
  const [minDone, setMinDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const showLoader = authLoading || !minDone;

  return (
    <>
      <AnimatePresence mode="wait">
        {showLoader && <BrandedLoader />}
      </AnimatePresence>

      {!showLoader && <AppRoutes />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <InnerApp />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { fontFamily: 'Outfit, sans-serif', fontSize: '13px', borderRadius: '12px' },
            success: { iconTheme: { primary: '#0d9488', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
