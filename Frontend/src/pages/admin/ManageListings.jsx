import { useState, useEffect } from 'react';
import { Search, BadgeCheck, Sparkles, Trash2, Edit2, Star, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
// import { businesses as initialBusinesses } from '../../data/mockData';

import {
  deleteBusiness,
  toggleBusinessVerified,
  toggleBusinessFeatured,
  getBusinesses
} from '../../services/api';
import toast from 'react-hot-toast';

const ManageListings = () => {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('ALL');

  const filtered = listings.filter(b => {
    const matchSearch = b.businessName.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase());
    const matchFeatured =
      filterFeatured === 'ALL' ||
      (filterFeatured === 'FEATURED' && b.featured) ||
      (filterFeatured === 'VERIFIED' && b.verified);
    return matchSearch && matchFeatured;
  });
  useEffect(() => {

    const loadBusinesses = async () => {

      try {

        const data =
          await getBusinesses();

        setListings(data);

      } catch (err) {

        console.error(err);

        toast.error(
          'Failed to load businesses'
        );
      }
    };

    loadBusinesses();

  }, []);

  const toggleVerified = async (id) => {

    try {

      await toggleBusinessVerified(id);

      const data =
        await getBusinesses();

      setListings(data);

      toast.success(
        'Verification status updated'
      );

    } catch (err) {

      console.error(err);

      toast.error(
        'Update failed'
      );
    }
  };

  const toggleFeatured = async (id) => {

    try {

      await toggleBusinessFeatured(id);

      const data =
        await getBusinesses();

      setListings(data);

      toast.success(
        'Featured status updated'
      );

    } catch (err) {

      console.error(err);

      toast.error(
        'Update failed'
      );
    }
  };

  const handleDelete = async (id) => {

    if (
      !window.confirm(
        'Delete this listing permanently?'
      )
    ) return;

    try {

      await deleteBusiness(id);

      setListings(
        prev =>
          prev.filter(
            b => b._id !== id
          )
      );

      toast.success(
        'Listing deleted'
      );

    } catch (err) {

      console.error(err);

      toast.error(
        'Delete failed'
      );
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900">Manage Listings</h2>
          <p className="text-sm text-slate-500">{listings.length} total businesses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterFeatured}
          onChange={e => setFilterFeatured(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none bg-white"
        >
          <option value="ALL">All Listings</option>
          <option value="FEATURED">Featured Only</option>
          <option value="VERIFIED">Verified Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Business', 'Category', 'City', 'Rating', 'Verified', 'Featured', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">No listings found</td>
                </tr>
              ) : (
                filtered.map(biz => (
                  <tr key={biz._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img src={biz.logoUrl || "/default-logo.jpg"} alt={biz.businessName} className="w-9 h-9 rounded-xl object-cover" />
                        <span className="font-semibold text-slate-800 text-sm">{biz.businessName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{biz.categoryName}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{biz.city}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-700">{biz.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleVerified(biz._id)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                          biz.verified
                            ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {biz.verified ? '✓ Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleFeatured(biz._id)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                          biz.featured
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {biz.featured ? '★ Featured' : 'Normal'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/business/${biz._id}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View on site"
                        >
                          <Eye size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(biz._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageListings;
