import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, User, Mail, Phone, MapPin, Globe, FileText,
  Upload, CheckCircle, ChevronRight, Sparkles, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import {getCategories, getSubcategories, submitBusiness,  uploadImage } from '../../services/api';
const steps = ['Business Info', 'Location', 'Media & Socials', 'Review'];

// ✅ Defined OUTSIDE the component so React doesn't recreate it on every render
// (recreating it inside would cause inputs to lose focus on every keystroke)
const InputField = ({ name, label, type = 'text', placeholder, icon: Icon, required, form, errors, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input
        type={type}
        name={name}
        value={form[name] ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
          errors[name] ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
        }`}
      />
    </div>
    {errors[name] && (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <AlertCircle size={11} /> {errors[name]}
      </p>
    )}
  </div>
);
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ApplyListing = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [form, setForm] = useState({
    businessName: '', ownerName: '', email: '', phone: '',
    categoryId: '', subcategoryId: '', address: '', city: '',
    state: '', website: '', description: '', logo: null, gallery: [],
    facebook: '', instagram: '', linkedin: '', twitter: '',
  });
  const [errors, setErrors] = useState({});

  const selectedCatObj = categories.find(c => c.id === form.categoryId || c._id === form.categoryId);
  const filteredSubs = selectedCatObj
    ? subcategories?.filter(s => s.categoryId === selectedCatObj.id || s.categoryId === selectedCatObj._id) || []
    : [];

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {

    const loadData = async () => {

      try {

        const cats =
          await getCategories();

        const subs =
          await getSubcategories();

        setCategories(cats);
        setSubcategories(subs);

      } catch (err) {

        console.error(err);

        toast.error(
          "Failed to load categories"
        );
      }
    };

    loadData();

  }, []);


  const handleChange = (e) => {

    const {
      name,
      value,
      files
    } = e.target;

    if (files) {

      if (name === "logo") {

        setForm(prev => ({
          ...prev,
          logo: files[0]
        }));

      } else {

        setForm(prev => ({
          ...prev,
          gallery: Array.from(files)
        }));

      }

      return;
    }

    if (name === "categoryId") {

      setForm(prev => ({
        ...prev,
        categoryId: value,
        subcategoryId: ""
      }));

    } else {

      setForm(prev => ({
        ...prev,
        [name]: value
      }));

    }

    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!form.businessName) newErrors.businessName = 'Required';
      if (!form.ownerName) newErrors.ownerName = 'Required';
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Valid email required';
      if (!form.phone || form.phone.length < 10) newErrors.phone = 'Valid phone required';
      if (!form.categoryId) newErrors.categoryId = 'Please select a category';
      if (!form.description) newErrors.description = 'Required';
    } else if (step === 1) {
      if (!form.address) newErrors.address = 'Required';
      if (!form.city) newErrors.city = 'Required';
      if (!form.state) newErrors.state = 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async () => {

    setLoading(true);
    setIsUploading(true);
    setUploadStep("Uploading Logo...");
    setUploadProgress(5);

    try {

      // ===========================
      // Upload Logo
      // ===========================

      let logoUrl = "";

      if (form.logo) {

        setUploadStep("Uploading Logo...");
        setUploadProgress(10);

        const logoRes = await uploadImage(
          form.logo,
          (percent) => {

              setUploadProgress(Math.round(percent * 0.35));
          }
      );

        if (logoRes.success) {
            logoUrl = logoRes.url;
        }

        setUploadProgress(35);

      }

      // ===========================
      // Upload Gallery Images
      // ===========================

      const galleryImages = [];
      setUploadStep("Uploading Gallery Images...");
      setUploadProgress(40);

      if (form.gallery.length > 0) {

        const progressMap = {};

          const uploadPromises = form.gallery.map((image, index) => {

              return uploadImage(
                  image,
                  (percent) => {

                      progressMap[index] = percent;

                      const totalProgress =
                          Object.values(progressMap).reduce(
                              (sum, value) => sum + value,
                              0
                          );

                      const averageProgress =
                          totalProgress / form.gallery.length;

                      setUploadProgress(
                          Math.round(
                              35 + averageProgress * 0.45
                          )
                      );

                  }
              ).then(res => res.url);

          });

          const uploadedUrls = await Promise.all(uploadPromises);

          galleryImages.push(...uploadedUrls);

      }

      // ===========================

      const selectedCategory = categories.find(
        c => c.id === form.categoryId || c._id === form.categoryId
      );

      const selectedSubcategory = subcategories.find(
        s => s.id === form.subcategoryId || s._id === form.subcategoryId
      );

      await submitBusiness({

        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,

        businessName: form.businessName,

        categoryId: form.categoryId,
        subcategoryId: form.subcategoryId,

        categoryName: selectedCategory?.name || "",
        subcategoryName: selectedSubcategory?.name || "",

        address: form.address,
        city: form.city,
        state: form.state,

        website: form.website,
        description: form.description,

        // Cloudflare URLs
        logoUrl,
        galleryImages,

        socialMediaLinks: {
          instagram: form.instagram,
          facebook: form.facebook,
          linkedin: form.linkedin,
          twitter: form.twitter
        },

        services: (form.services || "")
          .split(",")
          .map(s => s.trim())
          .filter(Boolean)

      });

      setSubmitted(true);
      setUploadStep("Saving Business...");
      setUploadProgress(90);

      toast.success("Application submitted successfully!");

    }
    catch (err) {

      console.error(err);

      toast.error("Failed to submit application");

    }
    finally {

      setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setUploadStep("");
      }, 800);

      setLoading(false);

    }

  };



  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-teal-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Application Submitted!</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Your business listing application for <strong>{form.businessName}</strong> has been submitted successfully.
            Our team will review and respond within 24–48 hours.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-start gap-2">
              <AlertCircle size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <strong>What happens next?</strong>
                <ul className="mt-1 space-y-1 list-disc list-inside text-blue-600">
                  <li>Admin reviews your application</li>
                  <li>We verify your business details</li>
                  <li>You'll be notified via email upon approval</li>
                  <li>Your listing goes live automatically</li>
                </ul>
              </div>
            </div>
          </div>
          <Link to="/" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles size={12} /> Free Business Listing
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">List Your Business</h1>
          <p className="text-slate-500 text-sm">Get discovered by thousands of potential customers</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 px-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${i < steps.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${
                  i < currentStep ? 'bg-teal-500 text-white' :
                  i === currentStep ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' :
                  'bg-slate-200 text-slate-500'
                }`}>
                  {i < currentStep ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={`hidden sm:block text-xs font-semibold flex-shrink-0 ${
                  i === currentStep ? 'text-blue-600' : i < currentStep ? 'text-teal-600' : 'text-slate-400'
                }`}>
                  {step}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${i < currentStep ? 'bg-teal-400' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
          {/* Step 0: Business Info */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" /> Business Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField name="businessName" label="Business Name" icon={Building2} placeholder="Your Business Name" required form={form} errors={errors} onChange={handleChange} />
                <InputField name="ownerName" label="Owner Name" icon={User} placeholder="Full Name" required form={form} errors={errors} onChange={handleChange} />
                <InputField name="email" label="Email Address" type="email" icon={Mail} placeholder="business@email.com" required form={form} errors={errors} onChange={handleChange} />
                <InputField name="phone" label="Phone Number" type="tel" icon={Phone} placeholder="+91 98765 43210" required form={form} errors={errors} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 bg-white ${
                      errors.categoryId ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subcategory</label>
                  <select
                    name="subcategoryId"
                    value={form.subcategoryId}
                    onChange={handleChange}
                    disabled={!form.categoryId || filteredSubs.length === 0}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">Select Subcategory</option>
                    {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your business, services offered, and what makes you unique..."
                  className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 resize-none ${
                    errors.description ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Services Offered
                </label>

                <textarea
                  name="services"
                  value={form.services}
                  onChange={handleChange}
                  rows={3}
                  placeholder="SEO, Web Development, Social Media Marketing"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

                <p className="text-xs text-slate-400 mt-1">
                  Separate services with commas
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Location */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" /> Location Details
              </h2>
              <InputField name="address" label="Full Address" icon={MapPin} placeholder="Street, Building, Area" required form={form} errors={errors} onChange={handleChange} />
              <div className="grid grid-cols-2 gap-4">
                <InputField name="city" label="City" placeholder="Mumbai" required form={form} errors={errors} onChange={handleChange} />
                <InputField name="state" label="State" placeholder="Maharashtra" required form={form} errors={errors} onChange={handleChange} />
              </div>
              <InputField name="website" label="Website URL" icon={Globe} placeholder="https://yourwebsite.com" form={form} errors={errors} onChange={handleChange} />
            </div>
          )}

          {/* Step 2: Media & Socials */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Upload size={18} className="text-blue-600" /> Media & Social Links
              </h2>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business Logo</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 cursor-pointer transition-colors">
                  <Upload size={24} className="text-slate-300 mb-2" />
                  <span className="text-sm text-slate-500">{form.logo ? form.logo.name : 'Click to upload logo'}</span>
                  <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                  <input type="file" name="logo" accept="image/*" onChange={handleChange} className="hidden" />
                </label>
              </div>

              {/* Gallery Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gallery Images</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 cursor-pointer transition-colors">
                  <Upload size={24} className="text-slate-300 mb-2" />
                  <span className="text-sm text-slate-500">
                    {form.gallery.length > 0 ? `${form.gallery.length} files selected` : 'Click to upload gallery images'}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">Up to 5 images, PNG or JPG</span>
                  <input type="file" name="gallery" accept="image/*" multiple onChange={handleChange} className="hidden" />
                </label>
              </div>

              {/* Social Links */}
              <div className="pt-2">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Social Media Links (Optional)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: 'facebook', placeholder: 'Facebook URL' },
                    { name: 'instagram', placeholder: 'Instagram URL' },
                    { name: 'linkedin', placeholder: 'LinkedIn URL' },
                    { name: 'twitter', placeholder: 'Twitter URL' },
                  ].map(({ name, placeholder }) => (
                    <InputField key={name} name={name} label={name.charAt(0).toUpperCase() + name.slice(1)} placeholder={placeholder} form={form} errors={errors} onChange={handleChange} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" /> Review Your Application
              </h2>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-sm">
                {[
                  ['Business Name', form.businessName],
                  ['Owner Name', form.ownerName],
                  ['Email', form.email],
                  ['Phone', form.phone], 
                  ['City', `${form.city}, ${form.state}`],
                  ['Website', form.website || '—'],
                  
                  ['Facebook', form.facebook || '—'],
                  ['Instagram', form.instagram || '—'],
                  ['LinkedIn', form.linkedin || '—'],
                  ['Twitter', form.twitter || '—'],

                  ['Logo', form.logo?.name || 'Not uploaded'],
                  ['Gallery', form.gallery.length > 0 ? `${form.gallery.length} images` : 'Not uploaded'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-slate-500 font-medium">{label}:</span>
                    <span className="text-slate-800 font-semibold text-right">{value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    By submitting, you agree that your business information will be reviewed by our team.
                    Approved listings will go live within 24–48 hours.
                  </p>
                </div>
              </div>
            </div>
          )}
          {isUploading && (
            <div className="mb-6">

              <div className="flex justify-between text-sm mb-2">

                <span className="font-semibold">
                  {uploadStep}
                </span>

                <span>
                  {uploadProgress}%
                </span>

              </div>

              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">

                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`
                  }}
                />

              </div>

            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <><CheckCircle size={15} /> Submit Application</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyListing;
