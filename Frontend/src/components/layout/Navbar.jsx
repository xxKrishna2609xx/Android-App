import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Globe, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { loginUserApi, getCategories, getSubcategories } from '../../services/api';
import { config } from '../../config';
import './Navbar.css';
import logo from '../../assets/logo.png';


export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [categoriesList, setCategoriesList] = useState(config.defaultCategories);
  const [suggestionsList, setSuggestionsList] = useState(config.defaultSuggestions);

  useEffect(() => {
    getCategories()
      .then(data => {
        if (data && data.length > 0) {
          setCategoriesList(['All Categories', ...data.map(c => c.name)]);
        }
      })
      .catch(console.error);

    getSubcategories()
      .then(data => {
        if (data && data.length > 0) {
          setSuggestionsList(data.map(s => s.name));
        }
      })
      .catch(console.error);
  }, []);

  const [scrolled,   setScrolled]   = useState(false);
  const [pillQ,      setPillQ]      = useState('');
  const [pillLoc,    setPillLoc]    = useState('');
  const [pillCat,    setPillCat]    = useState('All Categories');
  const [focSec,     setFocSec]     = useState(null);
  const [showSuggs,  setShowSuggs]  = useState(false);
  const [compQ,      setCompQ]      = useState('');
  const [compLoc,    setCompLoc]    = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ddOpen,     setDdOpen]     = useState(false);
  const [mobileQ,    setMobileQ]    = useState('');
  const [mobileCity, setMobileCity] = useState('');

  const pathname     = location.pathname;
  const isHome       = pathname === '/';
  const isSearchPage = pathname === '/search';

  const isCompact   = !isHome || scrolled;
  const showCompact = isCompact && !isSearchPage;

  const pillRef = useRef(null);
  const ddRef   = useRef(null);

  



  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (pillRef.current && !pillRef.current.contains(e.target)) {
        setFocSec(null); setShowSuggs(false);
      }
      if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const doSearch = (
    q = '',
    city = '',
    category = ''
  ) => {

    const params = new URLSearchParams();

    if (q.trim()) {
      params.set(
        'query',
        q.trim()
      );
    }

    if (city.trim()) {
      params.set(
        'city',
        city.trim()
      );
    }

    if (
      category &&
      category !== 'All Categories'
    ) {
      params.set(
        'category',
        category
      );
    }

    navigate(
      `/search?${params.toString()}`
    );

    setShowSuggs(false);
    setMobileOpen(false);
  };

  const avatar = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : <User size={14} />;

  const filtSuggs = suggestionsList.filter(s =>
    !pillQ || s.toLowerCase().includes(pillQ.toLowerCase())
  ).slice(0, 5);

  // BUG 1 FIX: navCls never includes nb--hidden / nb--visible
  const navCls = ['nb', isCompact ? 'nb--compact nb--shadow' : 'nb--expanded'].join(' ');

  return (
    <>
      {/* Spacer on homepage so hero isnot hidden under fixed navbar */}
      {isHome && (
        <div style={{
          height: isCompact ? 64 : 160,
          transition: 'height 0.3s ease',
          pointerEvents: 'none',
        }} />
      )}

      <nav className={navCls}>
        <div className="nb__inner">
          <div className="nb__top">

            {/* Logo — layoutId ties it to BrandedLoader's shared animation */}
            <Link to="/" className="nb__logo">
              <motion.img
                layoutId="brand-logo"
                src={logo}
                alt="Right Ads"
                style={{ width: 'auto', display: 'block' }}
                className="nb__logo-img"
              />
            </Link>

            {/* BUG 2 FIX: only one tab active via match() */}
            <div className="nb__tabs">
              {config.navTabs.map(({ label, to, match }) => (
                <Link
                  key={label}
                  to={to}
                  className={`nb__tab${match(pathname) ? ' nb__tab--active' : ''}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Compact search — hidden on /search to avoid duplicate (BUG 2) */}
            <div className={`nb__compact ${showCompact ? 'nb__compact--visible' : 'nb__compact--hidden'}`}>
              <form
                className="nb__compact-pill"
                onSubmit={e => {
                  e.preventDefault();
                  doSearch(
                    pillQ,
                    pillLoc,
                    pillCat
                  );
                }}
              >
                <div className="nb__compact-sec">
                  <div className="nb__compact-label">Where</div>
                  <input
                    className="nb__compact-input"
                    placeholder="Search businesses"
                    value={compQ}
                    onChange={e => setCompQ(e.target.value)}
                  />
                </div>
                <div className="nb__compact-div" />
                <div className="nb__compact-sec" style={{ maxWidth: 100 }}>
                  <div className="nb__compact-label">Location</div>
                  <input
                    className="nb__compact-input"
                    placeholder="City"
                    value={compLoc}
                    onChange={e => setCompLoc(e.target.value)}
                  />
                </div>
                <div className="nb__compact-div" />
                <div className="nb__compact-sec" style={{ maxWidth: 100 }}>
                  <div className="nb__compact-label">Category</div>
                  <select className="nb__compact-input" style={{ appearance: 'none' }}>
                    {categoriesList.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <button type="submit" className="nb__compact-btn" aria-label="Search">
                  <Search size={13} color="#fff" />
                </button>
              </form>
            </div>

            {/* Right actions */}
            <div className="nb__actions">
              <Link to="/apply" className="nb__host-btn">List Business</Link>
              <button className="nb__globe-btn" aria-label="Language"><Globe size={18} /></button>
              <div style={{ position: 'relative' }} ref={ddRef}>
                <button className="nb__user-btn" onClick={() => setDdOpen(v => !v)}>
                  <Menu size={15} />
                  <div className="nb__avatar">{avatar}</div>
                </button>
                {ddOpen && (
                  <div className="nb__dropdown">
                    {isLoggedIn ? (
                      <>
                        <div className="nb__dd-header">
                          <div className="nb__dd-label">Logged in as</div>
                          <div className="nb__dd-name">{user?.name}</div>
                        </div>
                        <Link to="/dashboard" className="nb__dd-item nb__dd-item--bold"
                          onClick={() => setDdOpen(false)}>My Dashboard</Link>
                        {user?.role === 'admin' && (
                          <Link to="/admin/dashboard" className="nb__dd-item nb__dd-item--blue"
                            onClick={() => setDdOpen(false)}>Admin Panel</Link>
                        )}
                        <button
                          className="nb__dd-item nb__dd-item--sep nb__dd-item--danger"
                          onClick={() => { setDdOpen(false); logout(); toast.success('Logged out'); navigate('/'); }}
                        >Sign Out</button>
                      </>
                    ) : (
                      <>
                        <Link to="/signup" className="nb__dd-item nb__dd-item--bold"
                          onClick={() => setDdOpen(false)}>Sign up</Link>
                        <Link to="/login" className="nb__dd-item"
                          onClick={() => setDdOpen(false)}>Log in</Link>
                        <Link to="/apply" className="nb__dd-item nb__dd-item--sep"
                          onClick={() => setDdOpen(false)}>List your business</Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button className="nb__hamburger" onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Expanded search pill — homepage only, collapses when scrolled */}
          {isHome && (
            <div className="nb__pill-row">
              <form
                ref={pillRef}
                className="nb__pill"
                onSubmit={e => { e.preventDefault(); doSearch(pillQ, pillLoc); }}
              >
                <div
                  className={`nb__pill-sec${focSec === 'q' ? ' nb__pill-sec--focus' : ''}`}
                  onClick={() => setFocSec('q')}
                  style={{ position: 'relative' }}
                >
                  <div className="nb__pill-label">Search <span className="nb__pill-label-desc">Businesses</span></div>
                  <input
                    className="nb__pill-input"
                    placeholder="What are you looking for?"
                    value={pillQ}
                    onChange={e => { setPillQ(e.target.value); setShowSuggs(true); }}
                    onFocus={() => { setFocSec('q'); setShowSuggs(true); }}
                  />
                  {showSuggs && filtSuggs.length > 0 && (
                    <div className="nb__suggestions">
                      <div className="nb__sugg-hd">Popular searches</div>
                      {filtSuggs.map((s, i) => (
                        <button key={i} type="button" className="nb__sugg-item"
                          onClick={() => { setPillQ(s); setShowSuggs(false); doSearch(s, pillLoc); }}>
                          <Search size={13} style={{ color: '#aaa', flexShrink: 0 }} /> {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="nb__pill-divider" />

                <div
                  className={`nb__pill-sec${focSec === 'loc' ? ' nb__pill-sec--focus' : ''}`}
                  onClick={() => setFocSec('loc')}
                >
                  <div className="nb__pill-label">Location</div>
                  <input
                    className="nb__pill-input"
                    placeholder="City, area..."
                    value={pillLoc}
                    onChange={e => setPillLoc(e.target.value)}
                    onFocus={() => setFocSec('loc')}
                  />
                </div>

                <div className="nb__pill-divider" />

                <div
                  className={`nb__pill-sec${focSec === 'cat' ? ' nb__pill-sec--focus' : ''}`}
                  onClick={() => setFocSec('cat')}
                  style={{ minWidth: 150 }}
                >
                  <div className="nb__pill-label">Category</div>
                  <select
                    className="nb__pill-select"
                    value={pillCat}
                    onChange={e => setPillCat(e.target.value)}
                    onFocus={() => setFocSec('cat')}
                  >
                    {categoriesList.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <button type="submit" className="nb__pill-btn" aria-label="Search">
                  <Search size={20} color="#fff" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="nb__mobile-drawer">
            
            <div className="nb__mobile-links">
              <Link to="/" className="nb__mobile-link nb__mobile-link--outline"
                onClick={() => setMobileOpen(false)}>Home</Link>
              <Link to="/categories" className="nb__mobile-link nb__mobile-link--outline"
                onClick={() => setMobileOpen(false)}>Categories</Link>
              <Link to="/apply" className="nb__mobile-link nb__mobile-link--primary"
                onClick={() => setMobileOpen(false)}>List Business</Link>
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard" className="nb__mobile-link nb__mobile-link--outline"
                    onClick={() => setMobileOpen(false)}>My Dashboard</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin/dashboard" className="nb__mobile-link nb__mobile-link--blue"
                      onClick={() => setMobileOpen(false)}>Admin Panel</Link>
                  )}
                  <button className="nb__mobile-link nb__mobile-link--danger"
                    onClick={() => { setMobileOpen(false); logout(); toast.success('Logged out'); navigate('/'); }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nb__mobile-link nb__mobile-link--outline"
                    onClick={() => setMobileOpen(false)}>Log In</Link>
                  <Link to="/signup" className="nb__mobile-link nb__mobile-link--primary"
                    onClick={() => setMobileOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
