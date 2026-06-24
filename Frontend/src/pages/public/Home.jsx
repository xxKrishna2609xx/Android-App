import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  GraduationCap,
  Heart,
  Building2,
  UtensilsCrossed,
  Home,
  Dumbbell,
  ArrowRight,
  Star,
  BadgeCheck,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Users,
  ChevronRight,
  ChevronLeft,
  Quote,
  Hotel,
  Key,
  Activity,
  HardHat,
  Dog,
  BedDouble,
  Smile,
  Coins,
  PartyPopper,
  Car,
  Truck,
  Send,
  Grid,
  ShoppingBag,
  Apple,
  Milk,
  Pill,
  Droplet,
  WashingMachine,
  Plane,
  Train,
  Bus,Locate
} from 'lucide-react';
import BusinessCard from '../../components/business/BusinessCard';
import { BusinessCardSkeleton } from '../../components/common/Skeletons';
import { getCategories, getBusinesses, getBanners, getQuickServices, getPublicStats } from '../../services/api';
import toast from 'react-hot-toast';

const iconMap = {
  UtensilsCrossed, Hotel, Sparkles, Home, Heart, GraduationCap, Key,
  Activity, HardHat, Dog, BedDouble, Building2, Smile, Dumbbell, Coins,
  PartyPopper, Car, Truck, Send, Grid,
  ShoppingBag, Apple, Milk, Pill, Droplet, WashingMachine, Plane, Train, Bus
};

const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="flex flex-col items-center text-center">
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-3`}>
      <Icon size={22} className="text-white" />
    </div>
    <div className="text-3xl font-black text-white mb-1">{value}</div>
    <div className="text-blue-200 text-sm">{label}</div>
  </div>
);
/* ── Banner images (Unsplash CDN, free-to-use) ── */
const FALLBACK_BANNERS = [
  {
    url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80',
    title: 'Find Trusted Businesses Near You',
    sub: 'Discover 700+ verified local businesses across India',
  },
  {
    url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1400&q=80',
    title: 'Connect with Local Service Experts',
    sub: 'From home repairs to healthcare — all in one place',
  },
  {
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&q=80',
    title: 'Grow Your Business with Right Ads',
    sub: 'List your business free and reach thousands of customers',
  },
  {
    url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400&q=80',
    title: 'India\'s Premier Business Directory',
    sub: 'Restaurants, Hotels, Education, Health and more',
  },
  {
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1400&q=80',
    title: 'Real Reviews. Verified Listings.',
    sub: 'Make informed decisions with genuine customer feedback',
  },
];
const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const [loadingPincode, setLoadingPincode] =useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('featured');
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  
  const [banners, setBanners] = useState(FALLBACK_BANNERS);
  const [quickServices, setQuickServices] = useState([]);
  const [stats, setStats] = useState(null);

  const [bannerIdx, setBannerIdx] = useState(0);
  const banner = banners[bannerIdx] || FALLBACK_BANNERS[0];
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const bannerTimer = useRef(null);
  const [bannerAnim, setBannerAnim] = useState('slide-in');

  const dailyNeedsItems = quickServices.filter(item => item.section === 'Daily Needs');
  const travelBookingsItems = quickServices.filter(item => item.section === 'Travel Bookings');

  const dailyNeeds = dailyNeedsItems.length > 0 ? dailyNeedsItems : [
    { name: 'Groceries', icon: ShoppingBag, iconColor: 'text-indigo-500 fill-indigo-50', query: 'Groceries' },
    { name: 'Fruits & Veg', icon: Apple, iconColor: 'text-emerald-500 fill-emerald-50', query: 'Vegetables' },
    { name: 'Milk & Dairy', icon: Milk, iconColor: 'text-blue-500 fill-blue-50', query: 'Dairy' },
    { name: 'Medicines', icon: Pill, iconColor: 'text-rose-500 fill-rose-50', query: 'Pharmacy' },
    { name: 'Water Supplier', icon: Droplet, iconColor: 'text-cyan-500 fill-cyan-50', query: 'Water' },
    { name: 'Laundry/Dry', icon: WashingMachine, iconColor: 'text-amber-500 fill-amber-50', query: 'Laundry' },
  ];

  const travelBookings = travelBookingsItems.length > 0 ? travelBookingsItems : [
    { name: 'Flight', icon: Plane, iconColor: 'text-sky-500 fill-sky-50', subtext: 'Powered By\nEasemytrip.com', query: 'Flights' },
    { name: 'Bus', icon: Bus, iconColor: 'text-red-500 fill-red-50', subtext: 'Affordable Rides', query: 'Bus' },
    { name: 'Train', icon: Train, iconColor: 'text-indigo-600 fill-indigo-50', subtext: '', query: 'Train' },
    { name: 'Hotel', icon: Hotel, iconColor: 'text-emerald-500 fill-emerald-50', subtext: 'Budget-friendly\nStay', query: 'Hotels' },
    { name: 'Car Rentals', icon: Car, iconColor: 'text-blue-500 fill-blue-50', subtext: 'Drive Easy\nAnywhere', query: 'Car Rentals' },
  ];

  const allSuggestions = [
    'SEO Services', 'Web Development', 'Graphic Design', 'Social Media Marketing',
    'Mobile App Development', 'Branding', 'Cloud Services', 'UI/UX Design',
    'Content Writing', 'Digital Marketing', 'Logo Design', 'E-commerce',
  ];

  /* ── Auto-advance banner every 5s ── */
  const advanceBanner = (dir = 1) => {
    setBannerAnim('slide-out');
    setTimeout(() => {
      setBannerIdx(i => (i + dir + banners.length) % banners.length);
      setBannerAnim('slide-in');
    }, 320);
  };

  useEffect(() => {
    bannerTimer.current = setInterval(() => advanceBanner(1), 5000);
    return () => clearInterval(bannerTimer.current);
  }, []);

  const goBanner = (dir) => {
    clearInterval(bannerTimer.current);
    advanceBanner(dir);
    bannerTimer.current = setInterval(() => advanceBanner(1), 5000);
  };
  const detectLocation = () => {
    
    return new Promise((resolve) => {

      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(

        async (position) => {

          try {

            const { latitude, longitude } =
              position.coords;

            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );

            const data = await res.json();

            resolve({
              city:
                data.address.city ||
                data.address.town ||
                data.address.village ||
                '',
              pincode:
                data.address.postcode || ''
            });

          } catch {

            resolve(null);
          }
        },

        () => resolve(null)

      );
    });
  };
  const handleDetectLocation = async () => {

    try {

      setLocLoading(true);

      const loc = await detectLocation();

      if (!loc) {

        toast.error('Unable to detect location');
        return;
      }

      if (loc.city) {
        setSearchCity(loc.city);
      }

      if (loc.pincode) {
        setPincode(loc.pincode);
      }

      toast.success('Location detected successfully');

    } catch (err) {

      console.error(err);

      toast.error('Location access denied');

    } finally {

      setLocLoading(false);
    }
  };


  useEffect(() => {
      const getStats = async () => {
        try{
          const data = await getPublicStats();
          setStats(data);
        } catch(err){
           toast.error(err || "error from getstats")
        }
      };

      getStats();
    }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cats, bizs, fetchedBanners, fetchedQuickServices] = await Promise.all([
          getCategories(),
          getBusinesses(),
          getBanners().catch(() => []),
          getQuickServices().catch(() => [])
        ]);
        setCategories(cats);
        setBusinesses(bizs);
        if (fetchedBanners && fetchedBanners.length > 0) {
          setBanners(fetchedBanners);
        }
        if (fetchedQuickServices && fetchedQuickServices.length > 0) {
          setQuickServices(fetchedQuickServices);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setSuggestions(
        allSuggestions.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
      );
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIdx(prev =>
        (prev + 1) % banners.length
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set(
        'query',
        searchQuery.trim()
      );
    }

    if (searchCity.trim()) {
      params.set(
        'city',
        searchCity.trim()
      );
    }

    if (pincode.trim()) {
      params.set(
        'pincode',
        pincode.trim()
      );
    }

    if ([...params.keys()].length === 0) {
      return;
    }

    navigate(
      `/search?${params.toString()}`
    );
  };

  const handlePincodeChange = async (value) => {
    setPincode(value);
    if (value.length < 6) {
      setSearchCity('');
      setLoadingPincode(false);
    }
    
    if (value.length === 6) {
      setLoadingPincode(true);
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${value}`
        );
        const data = await res.json();
        setLoadingPincode(false);
        if (data[0].Status === 'Success') {
          setSearchCity(
            data[0].PostOffice[0].District ||
            data[0].PostOffice[0].Block ||
            data[0].PostOffice[0].Name
          );
        }
      } catch (err) {
        console.error('Pincode lookup failed', err);
        setLoadingPincode(false);
      }
    } else if (value.length > 6) {
      setLoadingPincode(false);
    }
  };

  const featuredBusinesses = businesses.filter(b => b.featured);
  const displayedBusinesses = activeTab === 'featured'
    ? (featuredBusinesses.length > 0 ? featuredBusinesses : businesses.slice(0, 6))
    : businesses.slice().reverse();

  return (
    <div className="min-h-screen">

      {/* ───────── HERO SECTION ───────── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 520 }}>

        {/* Background image */}
        <div key={bannerIdx} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${banner.url})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          animation: `${bannerAnim} 0.38s ease`,
        }} />
        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,20,60,0.72) 0%, rgba(10,20,60,0.55) 100%)' }} />

        {/* Arrow controls */}
        {[{ dir: -1, side: 'left', Icon: ChevronLeft }, { dir: 1, side: 'right', Icon: ChevronRight }].map(({ dir, side, Icon }) => (
          <button key={side} onClick={() => goBanner(dir)} className="hero-banner__arrow" style={{
            position: 'absolute', top: '50%', [side]: 20,
            transform: 'translateY(-50%)',
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.3)',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', zIndex: 10, transition: 'background 0.2s',
          }}>
            <Icon size={20} />
          </button>
        ))}

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 7, zIndex: 10 }}>
          {banners.map((_, i) => (
            <button key={i} onClick={() => { clearInterval(bannerTimer.current); setBannerIdx(i); bannerTimer.current = setInterval(() => advanceBanner(1), 5000); }} style={{
              width: i === bannerIdx ? 22 : 8, height: 8, borderRadius: 4,
              background: i === bannerIdx ? '#fff' : 'rgba(255,255,255,0.45)',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 5, maxWidth: 1280, margin: '0 auto', padding: '80px 24px 100px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(28px,5vw,56px)', fontWeight: 900, color: '#fff',
            lineHeight: 1.15, marginBottom: 16,
            animation: 'fadeUp 0.5s ease both',
          }}>
            {banner.title}
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.82)', marginBottom: 40, animation: 'fadeUp 0.6s ease both' }}>
            {banner.sub}
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} ref={searchRef} className="hero-search__form">
            <div className="hero-search__container">
              {/* Query */}
              <div className="hero-search__query">
                <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                <input
                  type="text"
                  placeholder="Search businesses, services..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="hero-search__query-input"
                />
              </div>
              {/* Desktop City + Pincode */}
              <div className="hero-search__location hero-search__location--desktop">
                <MapPin size={14} style={{ color: '#888', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="City"
                  value={searchCity}
                  onChange={e => setSearchCity(e.target.value)}
                  className="hero-search__location-input-city"
                />
                <div className="hero-search__location-divider" />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={pincode}
                  onChange={(e) =>handlePincodeChange(e.target.value)}
                  className="hero-search__location-input-pincode"
                />
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locLoading}
                  title="Detect my location"
                  className="hero-search__location-gps-btn"
                  style={{ cursor: locLoading ? 'not-allowed' : 'pointer', opacity: locLoading ? 0.7 : 1, color: locLoading ? '#1a56db' : '#555' }}
                >
                  <Locate size={13} style={{animation: locLoading ? 'spin 1s linear infinite' : 'none'}}/>
                </button>
              </div>

              {/* Mobile City + Pincode Split side-by-side */}
              <div className="hero-search__location-wrapper--mobile">
                <div className="hero-search__city-box-mobile">
                  <MapPin size={14} style={{ color: '#888', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="City"
                    value={searchCity}
                    onChange={e => setSearchCity(e.target.value)}
                    className="hero-search__location-input-city-mobile"
                  />
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={locLoading}
                    title="Detect my location"
                    className="hero-search__location-gps-btn"
                    style={{ cursor: locLoading ? 'not-allowed' : 'pointer', opacity: locLoading ? 0.7 : 1, color: locLoading ? '#1a56db' : '#555' }}
                  >
                    <Locate size={13} style={{animation: locLoading ? 'spin 1s linear infinite' : 'none'}}/>
                  </button>
                </div>
                <div className="hero-search__pincode-box-mobile">
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={pincode}
                    onChange={(e) =>handlePincodeChange(e.target.value)}
                    className="hero-search__location-input-pincode-mobile"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="hero-search__submit-btn"
                disabled={loadingPincode}
              >
                <Search size={16} /> {loadingPincode ? 'Finding City...': 'Search'}
              </button>
            </div>
          </form>

          {/* Trending tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>Trending:</span>
            {['Restaurants', 'Gyms', 'Hospitals', 'Beauty Spa', 'Education'].map(tag => (
              <button key={tag} onClick={() => navigate(`/search?query=${encodeURIComponent(tag)}`)}
                style={{
                  fontSize: 12, background: 'rgba(255,255,255,0.15)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)', padding: '5px 14px',
                  borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s',
                }}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ STATS STRIP ══════════ */}
      <section style={{ background: '#1a56db', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px 60px' }}>
          {[
            
            { icon: Building2, value: stats?.listingsCount,  label: 'Businesses'   },
            { icon: BadgeCheck,value: stats?.verifiedCount,  label: 'Verified'     },
            { icon: Users,     value: stats?.monthlyUsers,  label: 'Monthly Users'},
            { icon: Star,      value: stats?.avgRating,  label: 'Avg Rating'   },  
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon size={22} color="rgba(255,255,255,0.7)" />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── CATEGORIES SECTION ───────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-10">

            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
              Explore Popular <span className="text-blue-600">Categories</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">
              Browse through our curated business categories to find the services you need.
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-2 gap-y-6 md:gap-x-4">
            {categories.slice(0, 15).map((cat, i) => {
              const Icon = iconMap[cat.icon] || Building2;
              return (
                <Link
                  key={cat._id}
                  to={`/category/${cat.slug}`}
                  className="group flex flex-col items-center w-full animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white border border-slate-150 hover:border-blue-400 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:shadow-blue-600/5 transition-all duration-200 group-hover:scale-105 cursor-pointer">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-50 group-hover:bg-blue-50/50 group-hover:border-blue-100/30 transition-colors">
                      <Icon size={22} className={`${cat.color.split(' ')[0]} group-hover:scale-110 transition-transform duration-200`} />
                    </div>
                  </div>
                  <span className="text-[11px] md:text-xs font-bold text-slate-700 text-center mt-2 leading-tight group-hover:text-blue-600 transition-colors px-1 line-clamp-2">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all"
            >
              View All Categories
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── QUICK SERVICES & BOOKINGS SECTION ───────── */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-8">
            
            {/* Row 1: Daily Needs */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center">
              {/* Left Column */}
              <div className="w-full lg:w-1/4 pr-4">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 font-sans tracking-tight">
                  Daily Needs
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-3">
                  Find essential daily services and local supplies instantly near you
                </p>
                <Link
                  to="/search?query=Daily+Needs"
                  className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Explore More <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Right Column */}
              <div className="w-full lg:w-3/4 grid grid-cols-3 sm:grid-cols-6 gap-x-2 gap-y-6 md:gap-x-4">
                {dailyNeeds.map((item, idx) => {
                  const Icon = typeof item.icon === 'string' ? (iconMap[item.icon] || Grid) : item.icon;
                  return (
                    <Link
                      key={idx}
                      to={`/search?query=${encodeURIComponent(item.query)}`}
                      className="group flex flex-col items-center w-full text-center"
                    >
                      <div className="w-20 h-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:border-blue-500 group-hover:shadow-md group-hover:-translate-y-1 cursor-pointer">
                        <Icon size={32} strokeWidth={1.5} className={`${item.iconColor || 'text-slate-600'} transition-transform duration-300 group-hover:scale-110`} />
                      </div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-700 mt-2 text-center group-hover:text-blue-600 transition-colors leading-tight">
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-slate-200 -mx-6 md:-mx-8" />

            {/* Row 2: Travel Bookings */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center">
              {/* Left Column */}
              <div className="w-full lg:w-1/4 pr-4">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 font-sans tracking-tight">
                  Travel Bookings
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-3">
                  Instant ticket bookings for your best travel and commute experiences
                </p>
                <Link
                  to="/search?query=Travel"
                  className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Explore More <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Right Column */}
              <div className="w-full lg:w-3/4 grid grid-cols-3 sm:grid-cols-6 gap-x-2 gap-y-6 md:gap-x-4">
                {travelBookings.map((item, idx) => {
                  const Icon = typeof item.icon === 'string' ? (iconMap[item.icon] || Grid) : item.icon;
                  return (
                    <Link
                      key={idx}
                      to={`/search?query=${encodeURIComponent(item.query)}`}
                      className="group flex flex-col items-center w-full text-center"
                    >
                      <div className="w-20 h-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:border-blue-500 group-hover:shadow-md group-hover:-translate-y-1 cursor-pointer">
                        <Icon size={32} strokeWidth={1.5} className={`${item.iconColor || 'text-slate-600'} transition-transform duration-300 group-hover:scale-110`} />
                      </div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-700 mt-2 text-center group-hover:text-blue-600 transition-colors leading-tight">
                        {item.name}
                      </span>
                      {item.subtext && (
                        <span className="text-[10px] text-emerald-600 font-semibold mt-1 leading-tight whitespace-pre-line text-center max-w-[96px]">
                          {item.subtext}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ───────── FEATURED / LATEST BUSINESSES ───────── */}
      <section className="py-16 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900">
                Discover <span className="text-blue-600">Businesses</span>
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex w-fit sm:w-auto bg-white border border-slate-200 rounded-full p-1 gap-1">
              {[
                { key: 'featured', label: 'Featured' },
                { key: 'latest', label: 'Latest' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-250 ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <BusinessCardSkeleton key={i} />)
              : displayedBusinesses.map(biz => (
                  <BusinessCard key={biz._id} business={biz} featured={biz.featured} />
                ))
            }
          </div>

          <div className="text-center mt-8">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg"
            >
              View All Businesses <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section className="py-16 bg-white rounded-xl  w-3/4 h-1/2 mx-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            {/* <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <TrendingUp size={12} /> Simple Process
            </div> */}
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
              How It <span className="text-blue-600">Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 via-teal-200 to-blue-200" />

            {[
              {
                step: '01', icon: Search, title: 'Search & Discover',
                desc: 'Search for any service or business by name, category, or city. Browse through 700+ verified businesses.',
                color: 'bg-blue-600',
              },
              {
                step: '02', icon: BadgeCheck, title: 'Compare & Choose',
                desc: 'Read reviews, compare ratings, view business profiles, and contact directly or request a quote.',
                color: 'bg-teal-600',
              },
              {
                step: '03', icon: TrendingUp, title: 'Connect & Grow',
                desc: 'Get in touch via phone, WhatsApp, or quote form. Businesses respond within 24 hours.',
                color: 'bg-indigo-600',
              },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="text-center group">
                <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={28} className="text-white" />
                </div>
                <div className="text-xs font-bold text-slate-400 mb-2">STEP {step}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── WHY CHOOSE US ───────── */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                <Shield size={12} /> Why Choose Us
              </div> */}
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-5">
                Trusted by Thousands of{' '}
                <span className="text-blue-600">Businesses & Customers</span> 
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Right Ads Digital is India's most trusted business directory with a rigorous verification process, real reviews, and a powerful lead-generation system.
              </p>
              <div className="space-y-4">
                {[
                  { icon: BadgeCheck, title: 'Verified Businesses', desc: 'Every listed business is manually reviewed and verified.', color: 'text-teal-600 bg-teal-50' },
                  { icon: Shield, title: 'Secure & Reliable', desc: 'Your data is protected with enterprise-grade security.', color: 'text-blue-600 bg-blue-50' },
                  { icon: Zap, title: 'Instant Lead Connection', desc: 'Connect directly with businesses via WhatsApp or quote forms.', color: 'text-indigo-600 bg-indigo-50' },
                ].map(({ icon: Icon, title, desc, color }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
                      <p className="text-slate-500 text-sm">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <Link to="/apply" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                  List Your Business
                </Link>
                <Link to="/search" className="border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold text-sm hover:border-blue-400 hover:text-blue-600 transition-colors">
                  Browse Directory
                </Link>
              </div>
            </div>

            {/* Right side cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: stats?.verifiedCount, label: 'Verified Listings', icon: Building2, color: 'from-blue-500 to-indigo-600' },
                { value: '10K+', label: 'Monthly Visitors', icon: Users, color: 'from-teal-500 to-emerald-600' },
                { value: stats?.categoriesCount, label: 'Categories', icon: Zap, color: 'from-violet-500 to-purple-600' },
                { value: stats?.avgRating, label: 'Average Rating', icon: Star, color: 'from-amber-500 to-orange-600' },
              ].map(({ value, label, icon: Icon, color }) => (
                <div key={label} className={`bg-gradient-to-br ${color} p-6 rounded-2xl flex flex-col items-center text-center shadow-lg`}>
                  <Icon size={28} className="text-white/80 mb-2" />
                  <div className="text-3xl font-black text-white">{value}</div>
                  <div className="text-white/80 text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* ───────── FINAL CTA ───────── */}
      <section className="py-16 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to List Your Business?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl">
            Join 700+ verified businesses on Right Ads Digital and start receiving leads from thousands of potential customers today.
          </p>
          <Link
            to="/apply"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 shadow-xl shadow-yellow-400/20 hover:scale-105"
          >
            List Your Business <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
