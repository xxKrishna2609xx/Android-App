import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, MessageSquare, Mail, Phone } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  getLeads,
  deleteLead as deleteLeadApi
} from '../../services/api';
import toast from 'react-hot-toast';

const ManageLeads = () => {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [viewLead, setViewLead] = useState(null);

  const filtered = leads.filter(l =>
    l.customerName.toLowerCase().includes(search.toLowerCase()) ||
    l.businessName.toLowerCase().includes(search.toLowerCase()) ||
    l.serviceRequired.toLowerCase().includes(search.toLowerCase())
  );
  useEffect(() => {

    const loadLeads = async () => {

      try {

        const data =
          await getLeads();

        setLeads(data);

      } catch (err) {

        console.error(err);

        toast.error(
          'Failed to load leads'
        );
      }
    };

    loadLeads();

  }, []);

  const deleteLead = async (id) => {

    if (
      !window.confirm(
        'Delete this lead?'
      )
    ) return;

    try {

      await deleteLeadApi(id);

      setLeads(
        leads.filter(
          l => l._id !== id
        )
      );

      toast.success(
        'Lead deleted'
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900">Lead Management</h2>
          <p className="text-sm text-slate-500">{leads.length} total leads generated</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-slate-400">
            <MessageSquare size={40} className="mx-auto mb-3 text-slate-200" />
            <p>No leads found</p>
          </div>
        ) : (
          filtered.map(lead => (
            <div key={lead._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900">{lead.customerName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">For: <span className="font-medium text-blue-600">{lead.businessName}</span></p>
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Phone size={12} className="text-blue-400" /> {lead.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Mail size={12} className="text-blue-400" /> {lead.email}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 mb-4">
                <div className="text-xs font-semibold text-slate-500 mb-1">Service Required</div>
                <div className="text-sm font-bold text-slate-800">{lead.serviceRequired}</div>
                {lead.message && (
                  <div className="text-xs text-slate-500 mt-1 line-clamp-2">{lead.message}</div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewLead(lead)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Eye size={13} /> View Details
                </button>
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Mail size={13} />
                </a>
                <button
                  onClick={() => deleteLead(lead.id)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 rounded-xl transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {viewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-slate-900">Lead Details</h3>
              <button onClick={() => setViewLead(null)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Customer', viewLead.customerName],
                ['Email', viewLead.email],
                ['Phone', viewLead.phone],
                ['Business', viewLead.businessName],
                ['Service', viewLead.serviceRequired],
                ['Message', viewLead.message || '—'],
                ['Date', new Date(viewLead.createdAt).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-4">
                  <span className="text-slate-400 font-medium w-20 flex-shrink-0">{label}:</span>
                  <span className="text-slate-700 flex-1">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <a href={`mailto:${viewLead.email}`} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 text-center transition-colors">
                Reply via Email
              </a>
              <button onClick={() => setViewLead(null)} className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageLeads;
