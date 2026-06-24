import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, ChevronRight, SlidersHorizontal } from 'lucide-react';
import BusinessCard from '../../components/business/BusinessCard';
import { BusinessCardSkeleton } from '../../components/common/Skeletons';
import { searchBusinesses, getCategories, getSubcategories } from '../../services/api';

const CategoryBrowse = () => {
  const { categorySlug, subcategorySlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, subs] = await Promise.all([getCategories(), getSubcategories()]);
        setCategories(cats);
        setSubcategories(subs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const category = categories.find(c => c.slug === categorySlug || c.id === categorySlug || c._id === categorySlug);
  const subcategory = subcategories.find(s => s.slug === subcategorySlug || s.id === subcategorySlug || s._id === subcategorySlug);
  const catSubcategories = category ? subcategories.filter(s => s.categoryId === category.id || s.categoryId === category._id) : [];


  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        
        const response = await searchBusinesses({
          query: "",
          city: "",
          pincode: "",
          categoryId: category?.id || "",
          subcategoryId: subcategory?.id || "",
          brand: "",
          page: 1,
          limit: 12,
        });
        setResults(response.data);

      } catch (err) {
        console.error("Failed to load results", err);
      } finally {
        setLoading(false);
      }
    };
    if (categories.length > 0) fetchResults();
  }, [categorySlug, subcategorySlug, category, subcategory, categories]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb Banner */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to={`/category/${categorySlug}`} className="hover:text-blue-600 transition-colors">
              {category?.name || 'Category'}
            </Link>
            {subcategory && (
              <>
                <ChevronRight size={12} />
                <span className="text-slate-600">{subcategory.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">
            {subcategory ? subcategory.name : category?.name || 'Category'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {results.length} verified businesses{' '}
            {!loading && `• ${category?.name}`}
          </p>

          {/* Subcategory pills */}
          {!subcategorySlug && catSubcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {catSubcategories.map(sub => (
                <Link
                  key={sub.id}
                  to={`/category/${categorySlug}/${sub.slug}`}
                  className="px-4 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-full text-xs font-semibold transition-colors border border-blue-100"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <BusinessCardSkeleton key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <Building2 size={48} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Businesses Found</h3>
            <p className="text-slate-500 text-sm">No businesses are listed under this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map(biz => (
              <BusinessCard key={biz.id} business={biz} featured={biz.featured} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryBrowse;
