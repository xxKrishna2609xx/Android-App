import { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Trash2, Search, Filter } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';

import toast from 'react-hot-toast';
import {
  getApplications,
  approveApplication,
  rejectApplication,
  deleteApplication
} from '../../services/api';

const ManageApplications = () => {
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewModal, setViewModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  useEffect(() => {

    const loadApplications = async () => {

      try {

        const data =
          await getApplications();

        setApps(data);

      } catch (err) {

        console.error(err);

        toast.error(
          "Failed to load applications"
        );
      }
    };

    loadApplications();

  }, []);

  const filtered = apps.filter(a => {
    const matchSearch = a.businessName.toLowerCase().includes(search.toLowerCase()) ||
      a.ownerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleApprove = async (id) => {

    try {

      await approveApplication(id);

      setApps(
        apps.filter(
          app => app._id !== id
        )
      );

      toast.success(
        'Application approved'
      );

    } catch (err) {

      console.error(err);

      toast.error(
        'Approval failed'
      );
    }
  };

  const handleReject = async (id) => {

    try {

      await rejectApplication(id, rejectReason);

      setApps(
        apps.filter(
          app => app._id !== id
        )
      );

      toast.success(
        'Application rejected'
      );

      setRejectModal(null);
      setRejectReason('');
      setViewModal(null);

    } catch (err) {

      console.error(err);

      toast.error(
        'Rejection failed'
      );
    }
  };

  const handleDelete = async (id) => {

    if (
      !window.confirm('Are you sure you want to delete this application?')
    ) return;

    try {

      await deleteApplication(id);

      setApps(
        prev =>
          prev.filter(
            a => a._id !== id
          )
      );

      toast.success('Application deleted');

    } catch (err) {

      console.error(err);

      toast.error('Delete failed');
    }
  };

  const statusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      APPROVED: 'bg-teal-50 text-teal-700 border-teal-200',
      REJECTED: 'bg-red-50 text-red-600 border-red-200',
    };
    return (
      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${styles[status] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900">Business Applications</h2>
          <p className="text-sm text-slate-500">{apps.filter(a => a.status === 'PENDING').length} pending review</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Business', 'Owner', 'Contact', 'Category', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">No applications found</td>
                </tr>
              ) : (
                filtered.map(app => {
                  
                  return (
                    <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{app.businessName}</td>
                      <td className="px-4 py-3 text-slate-600">{app.ownerName}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{app.email}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{app.categoryName}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">{statusBadge(app.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setViewModal(app)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          {app.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(app._id)}
                                className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button
                                onClick={() => setRejectModal(app)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(app._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-slate-900 text-lg">{viewModal.businessName}</h3>
              {statusBadge(viewModal.status)}
            </div>
            <div className="space-y-2.5 text-sm mb-6">
              {[
                ['Owner', viewModal.ownerName],
                ['Email', viewModal.email],
                ['Phone', viewModal.phone],
                ['City', `${viewModal.city}, ${viewModal.state}`],
                ['Description', viewModal.description],
                ['Website', viewModal.website || '—'],
                ['Services', viewModal.services || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-4">
                  <span className="text-slate-400 font-medium w-20 flex-shrink-0">{label}:</span>
                  <span className="text-slate-700">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {viewModal.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleApprove(viewModal._id)}
                    className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button
                    onClick={() => { setRejectModal(viewModal); setViewModal(null); }}
                    className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </>
              )}
              <button onClick={() => setViewModal(null)} className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <h3 className="font-black text-slate-900 text-lg mb-1">Reject Application</h3>
            <p className="text-slate-500 text-sm mb-4">Provide a reason for rejecting <strong>{rejectModal.businessName}</strong></p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Reason for rejection..."
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleReject(rejectModal._id)}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
              >
                Confirm Reject
              </button>
              <button onClick={() => setRejectModal(null)} className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageApplications;
