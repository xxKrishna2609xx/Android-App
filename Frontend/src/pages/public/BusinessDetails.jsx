import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Globe, BadgeCheck, Star,
  MessageCircle, Send, ChevronRight, Building2, Shield, Sparkles, CheckCircle, Heart
} from 'lucide-react';
import { Facebook, Instagram, Linkedin, Twitter } from '../../components/common/SocialIcons';

import LeadFormModal from '../../components/business/LeadFormModal';
import {
  getBusinessById,
  getReviews,
  createReview
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';


const BusinessDetails = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const navigate = useNavigate();

  const { user, isLoggedIn, toggleBookmark } = useAuth();
  const isBookmarked = user?.bookmarks?.includes(id) || false;

  const [showGallery, setShowGallery] = useState(false);
  const [popupImage, setPopupImage] = useState("");

  const [reviewLoading, setReviewLoading] = useState(false);


  const handleBookmarkToggle = () => {
    if (!isLoggedIn) {
      toast.error('Please sign in to save listings.');
      return;
    }
    toggleBookmark(id);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks');
  };
  const handleLeadClick = () => {
    if (!isLoggedIn) {

      toast.error('Please login to contact this business');

      navigate('/login');
      return;
    }

    setLeadModalOpen(true);
  };
  const handleReviewSubmit = async () => {

    if (!isLoggedIn) {

      toast.error(
        'Please login to leave a review'
      );

      navigate('/login');

      return;
    }

    if (!comment.trim()) {

      toast.error(
        'Please write a review'
      );

      return;
    }

    try {
      setReviewLoading(true);

      const response =
        await createReview({
          businessId: business.id,
          rating,
          comment
        });

      toast.success(
        response.message ||
        'Review submitted successfully'
      );

      const reviewData =
        await getReviews(
          business.id
        );

      setReviews(reviewData);

      setComment('');
      setRating(5);

    } catch (err) {

      console.error(err);

      if (
        err.response?.status === 401
      ) {

        toast.error(
          'Please login to leave a review'
        );

        navigate('/login');

        return;
      }

      toast.error(
        err.response?.data?.detail ||
        'Failed to submit review'
      );
    }
    finally {
      setReviewLoading(false);
    }
  };
  useEffect(() => {
    const fetchBiz = async () => {
      setLoading(true);
      try {
        const data = await getBusinessById(id);
        setBusiness(data);
        const reviewData = await getReviews(data.id);
        setReviews(reviewData);
      } catch (err) {
        console.error("Failed to fetch business", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBiz();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28">
        <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-48 skeleton rounded-2xl" />
          <div className="h-6 skeleton rounded-lg w-1/3" />
          <div className="h-4 skeleton rounded-lg w-1/2" />
          <div className="h-4 skeleton rounded-lg w-full" />
          <div className="h-4 skeleton rounded-lg w-4/5" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <Building2 size={60} className="text-slate-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700">Business Not Found</h2>
          <Link to="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${business.phone.replace(/\D/g, '')}?text=Hi, I found your listing on Right Ads Digital. I'm interested in your services.`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight size={12} />
          <Link to={`/category/${business.categoryId}`} className="hover:text-blue-600">{business.categoryName}</Link>
          <ChevronRight size={12} />
          <span className="text-slate-700">{business.businessName}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main Info */}
          <div className="lg:col-span-2 space-y-5">

            {/* Header Card */}
            <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Gallery / Cover */}
              <div className="relative">

                <img
                  src={
                    business.galleryImages?.length
                      ? business.galleryImages[activeImage]
                      : business.logoUrl || "/default-logo.jpg"
                  }
                  alt={business.businessName}
                  onClick={() => {
                    setPopupImage(
                      business.galleryImages?.length
                        ? business.galleryImages[activeImage]
                        : business.logoUrl
                    );
                    setShowGallery(true);
                  }}
                  className="w-full h-64 md:h-80 object-cover cursor-pointer"
                />

                {business.featured && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-yellow-400 text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold shadow">
                    <Sparkles size={12} />
                    FEATURED
                  </div>
                )}

                {business.galleryImages?.length > 1 && (
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto">
                    {business.galleryImages.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt=""
                        onClick={() => {
                          setActiveImage(index);
                          setPopupImage(img);
                        }}
                        className={`w-16 h-16 rounded-xl object-cover cursor-pointer border-2 flex-shrink-0 ${activeImage === index
                            ? "border-white"
                            : "border-transparent opacity-80"
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-6 relative">
                {business.verified && (
                  <span className="absolute top-6 right-6 bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full text-sm font-medium">
                    Verified
                  </span>
                )}

                <div className="flex flex-col md:flex-row gap-5 items-start">

                  {/* Logo */}
                  <div className="relative flex-shrink-0">

                    <img
                      src={business.logoUrl || "/default-logo.jpg"}
                      alt={business.businessName}
                      onClick={() => {
                        if (business.logoUrl) {
                          setPopupImage(business.logoUrl);
                          setShowGallery(true);
                        }
                      }}
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg bg-white cursor-zoom-in"
                    />

                    {business.verified && (
                      <div className="absolute -bottom-2 -right-2 bg-teal-500 rounded-full p-1.5">
                        <BadgeCheck
                          size={15}
                          className="text-white"
                        />
                      </div>
                    )}

                  </div>

                  {/* Details */}
                  <div className="flex-1 w-full">

                    <div className="flex flex-wrap items-center gap-3 md:pr-24">

                      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                        {business.businessName}
                      </h1>

                    </div>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">

                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                        {business.subcategoryName ||
                          business.categoryName}
                      </span>

                      <div className="flex items-center gap-1">

                        <Star
                          size={18}
                          className="fill-amber-400 text-amber-400"
                        />

                        <span className="font-semibold text-slate-900">
                          {business.reviewCount > 0 ? business.rating.toFixed(1): "New"}
                        </span>

                        <span className="text-slate-500">
                          {business.reviewCount === 0 ? "(No reviews yet)" 
                                    :  `(${business.reviewCount} review)` } 
                        </span>

                      </div>

                    </div>

                    <div className="flex items-center gap-2 mt-4 text-slate-500">

                      <MapPin
                        size={16}
                        className="text-blue-500"
                      />

                      <span>
                        {business.city}, {business.state}
                      </span>

                    </div>

                  </div>

                </div>

                {/* Description */}
                <div className="mt-6 pt-6 border-t border-slate-100">

                  <h3 className="font-semibold text-slate-900 mb-2">
                    About Business
                  </h3>

                  <p className="text-slate-600 leading-8">
                    {business.description}
                  </p>

                </div>

              </div>
            </div>

            {/* Services */}
            {business.services?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle size={16} className="text-teal-500" /> Services Offered
                </h2>
                <div className="flex flex-wrap gap-2">
                  {business.services.map((service, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-blue-600 hover:text-white transition-colors cursor-default">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Brands Serviced */}
            {business.brands?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Shield size={16} className="text-blue-500" /> Brands Serviced
                </h2>
                <div className="flex flex-wrap gap-2">
                  {business.brands.map((brand, i) => (
                    <span key={i} className="bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors cursor-default">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            )}


            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">

              {/* Header */}
              <div className="flex items-center justify-between mb-4">

                <h2 className="font-bold text-slate-900 text-lg">
                  Customer Reviews
                </h2>

                <div className="flex items-center gap-2">
                  <Star
                    size={18}
                    className="fill-amber-400 text-amber-400"
                  />

                  <span className="font-semibold text-slate-900">
                    {business.reviewCount > 0
                      ? business.rating.toFixed(1)
                      : "New"}
                  </span>

                  <span className="text-slate-500 text-sm">
                    ({business?.reviewCount || 0})
                  </span>
                </div>

              </div>

              {/* Write Review */}
              <div className="border border-slate-200 rounded-xl p-3 mb-5">

                <textarea
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                  placeholder="Share your experience..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex items-center justify-between mt-3">

                  <div className="flex gap-0.5">

                    {[1, 2, 3, 4, 5].map((star) => (

                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setRating(star)
                        }
                      >

                        <Star
                          size={26}
                          className={
                            star <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }
                        />

                      </button>

                    ))}

                  </div>

                  <button
                      onClick={handleReviewSubmit}
                      disabled={reviewLoading}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                        reviewLoading
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                      }`}
                    >
                      {reviewLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        "Submit Review"
                      )}
                    </button>

                </div>

              </div>

              {/* Reviews List */}
              <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2">

                {reviews.length > 0 ? (

                  reviews.map((review) => (

                    <div
                      key={review._id}
                      className="border-b border-slate-100 pb-4"
                    >

                      <div className="flex justify-between items-start">

                        <div>

                          <h4 className="font-semibold text-slate-900">
                            {review.customerName}
                          </h4>

                          <p className="text-xs text-slate-400 mt-1">
                            {review.createdAt
                              ? new Date(
                                review.createdAt
                              ).toLocaleDateString()
                              : ""}
                          </p>

                        </div>

                        <div className="flex">

                          {[...Array(review.rating)].map(
                            (_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className="fill-amber-400 text-amber-400"
                              />
                            )
                          )}

                        </div>

                      </div>

                      <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                        {review.comment}
                      </p>

                    </div>

                  ))

                ) : (

                  <div className="text-center py-6 text-slate-500">
                    No reviews yet. Be the first to review this business.
                  </div>

                )}

              </div>

            </div>

          </div>

          {/* Right: Contact Sidebar */}
          <div className="space-y-4">
            {/* CTA Buttons */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
              <button
                onClick={handleLeadClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                <Send size={15} /> Request a Quote
              </button>
              <button
                onClick={handleBookmarkToggle}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 border cursor-pointer ${isBookmarked
                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
              >
                <Heart size={15} className={isBookmarked ? 'fill-red-500 text-red-500' : ''} />
                {isBookmarked ? 'Saved to Bookmarks' : 'Save / Bookmark'}
              </button>
                {isLoggedIn ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-bold transition-colors"
                  >
                    <MessageCircle size={15} />
                    WhatsApp
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      toast.error('Please login to contact this business');
                      navigate('/login');
                    }}
                    className="w-full bg-green-500 text-white py-3 rounded-xl text-sm font-bold"
                  >
                    Login for WhatsApp
                  </button>
                )}
              {isLoggedIn ? (
                  <a
                    href={`tel:${business.phone}`}
                    className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 py-3 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Phone size={15} />
                    {business.phone}
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      toast.error('Please login to view contact details');
                      navigate('/login');
                    }}
                    className="w-full flex items-center justify-center gap-2 border border-slate-200 py-3 rounded-xl text-sm font-semibold"
                  >
                    <Phone size={15} />
                    Login to View Number
                  </button>
                )}
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Business Details</h3>
              <div className="space-y-3">
                {business.email && (
                  <div className="flex items-start gap-2.5">
                    <Mail size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-600 break-all">{business.email}</span>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-start gap-2.5">
                    <Globe size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <a href={business.website} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all">
                      {business.website}
                    </a>
                  </div>
                )}
                <div className="flex items-start gap-2.5">
                  <MapPin size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-600">{business.address}, {business.city}, {business.state}</span>
                </div>
              </div>
            </div>
            {/* Social */}
            {business.socialMediaLinks && Object.values(business.socialMediaLinks).some(Boolean) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h2 className="font-bold text-slate-900 mb-4">Social Media</h2>
                <div className="flex gap-3">
                  {[
                    { key: 'facebook', Icon: Facebook, color: 'hover:bg-blue-600' },
                    { key: 'instagram', Icon: Instagram, color: 'hover:bg-pink-500' },
                    { key: 'linkedin', Icon: Linkedin, color: 'hover:bg-blue-700' },
                    { key: 'twitter', Icon: Twitter, color: 'hover:bg-sky-500' },
                  ].map(({ key, Icon, color }) => business.socialMediaLinks[key] && (
                    <a
                      key={key}
                      href={business.socialMediaLinks[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 bg-slate-100 ${color} hover:text-white text-slate-600 rounded-xl flex items-center justify-center transition-colors`}
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {/* Verified Badge */}
            {business.verified && (
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-teal-800 text-sm">Verified Business</div>
                  <div className="text-teal-600 text-xs">Manually verified by our team</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showGallery && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={() => setShowGallery(false)}
        >
          <button
            className="absolute top-5 right-6 text-white text-5xl"
            onClick={() => setShowGallery(false)}
          >
            ×
          </button>

          <img
            src={popupImage}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-w-[70vw] max-h-[90vh] rounded-xl shadow-2xl"
          />
        </div>
      )}
      <LeadFormModal
        business={business}
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
      />
    </div>
  );
};

export default BusinessDetails;
