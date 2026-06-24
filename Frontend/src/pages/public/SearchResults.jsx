import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Filter, ChevronDown, SlidersHorizontal, X, Building2 } from 'lucide-react';
import BusinessCard from '../../components/business/BusinessCard';
import { BusinessCardSkeleton } from '../../components/common/Skeletons';
import { searchBusinesses } from '../../services/api';
import { getCategories, getBusinesses } from '../../services/api';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');

  const [categories, setCategories] = useState([]);

  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const searchQuery = searchParams.get('query') || '';
  const searchCity = searchParams.get('city') || '';
  const searchPincode =searchParams.get('pincode') || '';

  useEffect(() => {
    setPage(1);
    setSelectedBrand('');
  }, [query, selectedCategory]);
  
  useEffect(() => {
    const loadCategories = async () => {

      try {

        const data =
          await getCategories();
        setPage(1);
        setCategories(data);

      } catch (err) {

        console.error(
          'Failed to load categories',
          err
        );
      }
    };

    loadCategories();

  }, []);

  useEffect(() => {
    setQuery(
      searchParams.get('query') || ''
    );

    setCity(
      searchParams.get('city') || ''
    );

  }, [searchParams]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);

      try {

        const response = await searchBusinesses({
              query: searchQuery,
              city: searchCity,
              pincode: searchPincode,
              categoryId: selectedCategory,
              subcategoryId: "",
              brand: selectedBrand,
              page,
              limit: 6,
            });

        setTotalPages(response.totalPages);

        let filtered = response.data;
    
        if (sortBy === "rating")
          filtered.sort((a, b) => b.rating - a.rating);

        else if (sortBy === "reviews")
          filtered.sort(
            (a, b) => b.reviewCount - a.reviewCount
          );

        else if (sortBy === "latest")
          filtered.sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          );

        setResults(filtered);

      } catch (error) {
        console.error("Failed to load results", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [searchParams, selectedCategory, selectedBrand, sortBy, page]);

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(1);
    setSearchParams({
      query,
      city,
      pincode
    });
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setCity('');
    setPage(1);
    setSearchParams({ query });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Bar */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search businesses, services..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative sm:w-40">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 border px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              <SlidersHorizontal size={15} /> Filters
            </button>
          </form>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
              <div className="flex flex-wrap gap-3 items-center">
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 font-semibold"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 font-semibold"
                  >
                    <option value="rating">Sort: Highest Rated</option>
                    <option value="reviews">Sort: Most Reviews</option>
                    <option value="latest">Sort: Newest</option>
                  </select>
                </div>
                {(selectedCategory || city || selectedBrand) && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors cursor-pointer font-bold">
                    <X size={14} /> Clear Filters
                  </button>
                )}
              </div>

              {/* Brand Filters */}
              {availableBrands.length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs font-bold text-slate-400 mr-1.5">Brands:</span>
                  <button
                    onClick={() => setSelectedBrand('')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      !selectedBrand
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    All Brands
                  </button>
                  {availableBrands.map(brand => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedBrand === brand
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Result Count */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {searchQuery ? `Results for "${searchQuery}"` : 'All Businesses'}
              {searchCity  && <span className="text-slate-500 font-normal"> in {searchCity}</span>}
            </h1>
            {!loading && (
              <p className="text-sm text-slate-500 mt-0.5">
                {results.length} {results.length === 1 ? 'business' : 'businesses'} found
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <BusinessCardSkeleton key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 size={36} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Businesses Found</h3>
            <p className="text-slate-500 text-sm mb-6">Try adjusting your search or removing filters.</p>
            <Link to="/" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map(biz => (
              <BusinessCard key={biz.id} business={biz} featured={biz.featured} />
            ))}
          </div>
           )}
            {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10 mb-6 flex-wrap">

                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg border font-medium transition ${
                      page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white hover:bg-blue-50 hover:border-blue-500"
                    }`}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setPage(index + 1)}
                      className={`w-10 h-10 rounded-lg font-semibold transition ${
                        page === index + 1
                          ? "bg-blue-600 text-white"
                          : "bg-white border hover:bg-blue-50"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-lg border font-medium transition ${
                      page === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white hover:bg-blue-50 hover:border-blue-500"
                    }`}
                  >
                    Next
                  </button>

                </div>
              )}
      </div>
    </div>
  );
};

export default SearchResults;
