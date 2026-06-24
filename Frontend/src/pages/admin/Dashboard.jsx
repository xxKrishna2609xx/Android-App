import { useState, useEffect } from 'react';
import {
  Building2, FileText, CheckCircle, XCircle, Sparkles,
  MessageSquare, TrendingUp, ArrowUpRight, Clock, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  getBusinesses,
  getApplications,
  getLeads
} from '../../services/api';

const StatCard = ({ icon: Icon, label, value, change, color, to }) => (
  <Link to={to || '#'} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center shadow-lg`}>
        <Icon size={20} className="text-white" />
      </div>
      <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
    </div>
    <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
    <div className="text-sm text-slate-500 font-medium">{label}</div>
    {change && (
      <div className="text-xs text-teal-600 font-semibold mt-1 flex items-center gap-1">
        <TrendingUp size={11} /> {change}
      </div>
    )}
  </Link> 
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  const [businesses, setBusinesses] = useState([]);

  const [applications, setApplications] = useState([]);

  const [leads, setLeads] = useState([]);

  useEffect(() => {

    const loadDashboard =
      async () => {

        try {

          const [
            businessData,
            applicationData,
            leadData
          ] = await Promise.all([
            getBusinesses(),
            getApplications(),
            getLeads()
          ]);

          setBusinesses(
            businessData
          );

          setApplications(
            applicationData
          );

          setLeads(
            leadData
          );

        } catch (err) {

          console.error(err);

        } finally {

          setLoading(false);

        }
      };

    loadDashboard();

  }, []);

  const recentApps = applications.slice(0, 3);
  const recentLeads = leads.slice(0, 3);

  const stats = [

    {
      icon: Building2,
      label: 'Total Listings',
      value: businesses.length,
      color: 'bg-blue-600',
      to: '/admin/listings'
    },

    {
      icon: Clock,
      label: 'Pending Applications',
      value: applications.filter(
        a => a.status === 'PENDING'
      ).length,
      color: 'bg-amber-500',
      to: '/admin/applications'
    },

    {
      icon: CheckCircle,
      label: 'Approved Listings',
      value: businesses.filter(
        b => b.status === 'APPROVED'
      ).length,
      color: 'bg-teal-600',
      to: '/admin/listings'
    },

    {
      icon: XCircle,
      label: 'Rejected',
      value: applications.filter(
        a => a.status === 'REJECTED'
      ).length,
      color: 'bg-red-500',
      to: '/admin/applications'
    },

    {
      icon: Sparkles,
      label: 'Featured Listings',
      value: businesses.filter(
        b => b.featured
      ).length,
      color: 'bg-indigo-600',
      to: '/admin/listings'
    },

    {
      icon: MessageSquare,
      label: 'Total Leads',
      value: leads.length,
      color: 'bg-rose-500',
      to: '/admin/leads'
    }

  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-2xl" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 
        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm max-h-[350px] overflow-y-auto space-y-2 pr-2 pl-2 pb-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-900">Recent Applications</h3>
            <Link to="/admin/applications" className="text-xs text-blue-600 font-semibold hover:underline">View all</Link>
          </div>
          <div className="flex flex-col items-center justify-between gap-3 ">
            {recentApps.map(app => (
              <div key={app._id} className="w-full bg-white flex items-center justify-between px-5 py-4 border border-gray-200 rounded-xl hover:bg-slate-100 transition-all duration-200">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{app.businessName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{app.city}, {app.state}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      app.status === 'APPROVED'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : app.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {applications.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">No pending applications</div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm max-h-[350px] overflow-y-auto space-y-2 pr-2 pl-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-900">Recent Leads</h3>
            <Link to="/admin/leads" className="text-xs text-blue-600 font-semibold hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentLeads.map(lead => (
              <div key={lead._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-100 transition-colors">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{lead.customerName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{lead.serviceRequired} • {lead.businessName}</div>
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rated Businesses */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm max-h-[300px] overflow-y-auto space-y-2 pr-2 lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-900">Top Rated Businesses</h3>
            <Link to="/admin/listings" className="text-xs text-blue-600 font-semibold hover:underline">Manage all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Business</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">City</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rating</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {businesses.slice(0, 4).map(biz => (
                  <tr key={biz._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <img src={biz.logoUrl} alt={biz.businessName} className="w-8 h-8 rounded-lg" />
                        <span className="font-semibold text-slate-800">{biz.businessName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{biz.categoryName}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{biz.city}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="font-bold text-slate-700 text-xs">{biz.rating}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        biz.status === 'APPROVED' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {biz.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
