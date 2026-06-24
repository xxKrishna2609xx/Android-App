import { Link } from 'react-router-dom';
import { MapPin, Star, BadgeCheck, Sparkles, Phone, ExternalLink, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BusinessCard = ({ business, featured = false }) => {
  const { _id, id, businessName, city, state, categoryName, subcategoryName,
    logoUrl, description, rating, reviewCount, verified, phone, brands } = business;

  const { user, isLoggedIn, toggleBookmark } = useAuth();
  const isBookmarked = user?.bookmarks?.includes(id) || false;

  const handleBookmarkToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.error('Please sign in to save listings.');
      return;
    }
    toggleBookmark(id);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks');
  };

  return (
    <div className={`bg-white rounded-[10px] border overflow-hidden card-hover group relative ${
      featured ? 'border-blue-200 shadow-blue-50 shadow-lg' : 'border-slate-100 shadow-sm'
    }`}>
      {/* Bookmark Button */}
      <button
        onClick={handleBookmarkToggle}
        className={`absolute right-3 ${featured ? 'top-10' : 'top-3'} z-10 p-2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-xl border border-slate-100/50 shadow-sm transition-all duration-200 hover:scale-105 group/btn cursor-pointer`}
        title={isBookmarked ? 'Remove from Bookmarks' : 'Save Listing'}
      >
        <Heart
          size={15}
          className={`transition-all duration-200 ${
            isBookmarked
              ? 'fill-red-500 text-red-500 scale-110'
              : 'text-slate-400 group-hover/btn:text-red-500'
          }`}
        />
      </button>

      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-0 left-0 z-10 rounded-tl-xl rounded-br-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 flex items-center gap-1.5 shadow-sm">
          <Sparkles size={11} className="text-white" />
          <span className="text-white text-[10px] font-bold tracking-wider uppercase ">
            FEATURED
          </span>
        </div>
      )}

      <div className="p-5 mt-2">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative flex-shrink-0">
            <img
              src={
                logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  businessName
                )}&background=2563eb&color=fff&size=64&rounded=false`
                
              }
              alt={businessName}
              className="w-14 h-14 rounded-xl object-cover border-2 border-slate-100"
              onError={(e) => {
                e.target.src =
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    businessName
                  )}&background=2563eb&color=fff&size=64&rounded=false`;
              }}
            />
            {verified && (
              <div className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full p-0.5 shadow-sm">
                <BadgeCheck size={12} className="text-white fill-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-base leading-tight truncate group-hover:text-blue-600 transition-colors">
              {businessName}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                {subcategoryName || categoryName}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {description}
        </p>

        {/* Brands Serviced */}
        {/* {brands && brands.length > 0 ? (
          <div className="flex flex-wrap gap-1 mb-3">
            {brands.slice(0, 3).map((brand, i) => (
              <span key={i} className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-lg">
                {brand}
              </span>
            ))}
            {brands.length > 3 && (
              <span className="text-[10px] font-semibold text-slate-400 self-center ml-1">
                +{brands.length - 3} more
              </span>
            )}
          </div>
        ) : verified ? (

          <div className="flex flex-wrap gap-1 mb-3">
            <span className="text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-600 px-1.5 py-0.5 rounded-lg flex items-center gap-1">
              
              <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
              Verified Fit
            </span>
          </div>
        ) : (
         
            <div className="flex flex-wrap gap-1 mb-3">
            <span className="text-[10px] font-bold bg-red-50 border border-red-200 text-red-500 px-1.5 py-0.5 rounded-lg flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
              Not Verified Fit
            </span>
          </div>
        )} */}
        

        {/* Meta */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={12} className="text-blue-400" />
            <span>{city}, {state}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-slate-800">{rating}</span>
            <span className="text-xs text-slate-400">({reviewCount})</span>
          </div>
        </div>

        {/* CTA Row */}
        <div className="flex gap-2">
          <Link
            to={`/business/${business._id}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            View Details <ExternalLink size={11} />
          </Link>
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600 rounded-xl text-xs font-medium transition-colors"
          >
            <Phone size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
