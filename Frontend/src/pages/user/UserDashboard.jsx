  import { useState, useEffect } from 'react';
  import { useNavigate, Link } from 'react-router-dom';
  import { User, Heart, Send, Calendar, Phone, Mail, Edit3, Trash2, LogOut, Building2, ExternalLink } from 'lucide-react';
  import { useAuth } from '../../context/AuthContext';
  import BusinessCard from '../../components/business/BusinessCard';
  import toast from 'react-hot-toast';
  import { updateProfile } from '../../services/api';
  import {
    getUserApplications,
    getUserLeads,
    getBusinesses,
    getMyBusinessLeads,
    getMyBusinesses
  } from '../../services/api';


  const UserDashboard = () => {
    const { user, logout, toggleBookmark } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [applications, setApplications] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [myBusinesses, setMyBusinesses] = useState([]);
    // Profile editing state
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [isEditing, setIsEditing] = useState(false);

    // Leads state
    const [myLeads, setMyLeads] = useState([]);
    const [receivedLeads, setReceivedLeads] = useState([]);

    useEffect(() => {
      const loadleads = async ()=> {

        if (user) {
          setName(user.name);
          setPhone(user.phone);

          // Load leads submitted by this user from local storage
          const leads = await getUserLeads(user.email);

          setMyLeads(leads);
          // Filter leads belonging to this user
          const userLeads = leads.filter(l => l.email.toLowerCase() === user.email.toLowerCase());
          setMyLeads(userLeads);
        }
      };
      const fetchMyBusinesses = async () => {
        try {
          const data = await getMyBusinesses();
          setMyBusinesses(data);
          
        } catch (err) {
          console.error(err);
        }
      };
      const loadApplications = async () => {
        
        if (!user?.email) return;
        
        try {
          
          const data =
          await getUserApplications(
            user.email
          );
          
          setApplications(data);
          
        } catch (err) {
          
          console.error(err);
          
        }
      };
      
      const loadBusinesses = async () => {
        
        try {
          
          const data =
          await getBusinesses();
          
          setBusinesses(data);
          
        } catch (err) {
          
          console.error(err);
          
        }
      };
      const loadReceivedLeads = async () => {

        if (!user?.email) return;

        try {

          const data =
            await getMyBusinessLeads(
              user.email
            );

          setReceivedLeads(data);

        } catch (err) {

          console.error(err);

        }
      };
      
    loadleads();
    loadApplications();
    loadBusinesses();
    loadReceivedLeads();
    fetchMyBusinesses();
    }, [user]);


    const handleLogout = () => {
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    };

    const handleUpdateProfile = async (e) => {
      e.preventDefault();

      if (!name || !phone) {
        toast.error('Name and Phone are required.');
        return;
      }

      try {
        const updatedUser = await updateProfile(
          user.id,
          {
            name,
            phone
          }
        );

        localStorage.setItem(
          'auth_user',
          JSON.stringify(updatedUser)
        );

        toast.success(
          'Profile updated successfully!'
        );

        setIsEditing(false);

        window.location.reload();

      } catch (err) {
        toast.error(
          'Failed to update profile'
        );

        console.error(err);
      }
    };

    // Get bookmarked businesses
    const bookmarkedIds = user?.bookmarks || [];
    const bookmarkedBusinesses = businesses.filter(b => bookmarkedIds.includes(b.id));
    
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar / Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Profile Card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 to-teal-500" />
                
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-400 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4 mt-2 shadow-lg shadow-blue-500/20">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : <User />}
                </div>

                <h2 className="text-lg font-bold text-slate-900 truncate">{user?.name}</h2>
                <p className="text-xs text-slate-400 capitalize font-semibold tracking-wider mt-0.5">{user?.role === 'admin' ? 'Administrator' : 'Verified Member'}</p>

                <div className="mt-4 pt-4 border-t border-slate-50 space-y-2.5 text-left text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-400" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-slate-400" />
                    <span>+91 {user?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-slate-400" />
                    <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</span>
                  </div>
                </div>
              </div>

              {/* Sidebar Menu */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-2">
                <nav className="space-y-1">
                  {[
                    { id: 'profile', label: 'My Profile', icon: User },
                    { id: 'bookmarks', label: `Saved Listings (${bookmarkedIds.length})`, icon: Heart },
                    {id: 'receivedLeads',label: `Received Leads (${receivedLeads.length})`,icon: Send},
                    { id: 'My Businesses', label: `My Businesses (${myBusinesses.length})`, icon: Building2 },
                    { id: 'My Applications', label: `Pending Applications (${applications.length})`, icon: Send },
                    { id: 'leads', label: `Quote Requests (${myLeads.length})`, icon: Send },
                  ].map(item => {
                    const Icon = item.icon;
                    const active = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                          active 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={16} className={active ? 'text-blue-600' : 'text-slate-400'} />
                        {item.label}
                      </button>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors border-t border-slate-50 mt-2 pt-3"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area / Right Column */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 min-h-[500px]">
                
                {/* Tab: Profile Details */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Profile Details</h3>
                        <p className="text-xs text-slate-400">View and update your directory registration info</p>
                      </div>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-1 text-xs font-bold text-blue-600 border border-blue-200 px-3.5 py-1.5 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Edit3 size={13} /> Edit Profile
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phone Number</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={user?.email}
                          disabled
                          className="w-full px-3 py-2.5 text-sm border border-slate-100 bg-slate-50 text-slate-400 rounded-xl cursor-not-allowed"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Registered email address cannot be changed.</span>
                      </div>

                      {isEditing && (
                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
                          >
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setName(user?.name || '');
                              setPhone(user?.phone || '');
                            }}
                            className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                )}

                {/* Tab: Saved Listings */}
                {activeTab === 'bookmarks' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-xl font-bold text-slate-900">Saved Listings</h3>
                      <p className="text-xs text-slate-400">Quickly access your bookmarked businesses and services</p>
                    </div>

                    {bookmarkedBusinesses.length === 0 ? (
                      <div className="text-center py-16 space-y-4">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto">
                          <Heart size={28} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-700">No Saved Listings</h4>
                          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Browse directory listings and click the heart icon to save them here.</p>
                        </div>
                        <Link to="/search" className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors">
                          Browse Directory
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {bookmarkedBusinesses.map(biz => (
                          <div key={biz.id} className="relative">
                            <BusinessCard business={biz} featured={biz.featured} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: My Application */}
                {activeTab === 'My Applications' && (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">

                    {applications.length === 0 ? (

                      <div className="bg-white rounded-xl p-6 text-center">
                        No applications submitted yet.
                      </div>

                    ) : (

                      applications.map(app => (
                       
                       <div
                        key={app._id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                      >
                         
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-slate-900">
                              {app.businessName}
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                              {app.categoryName} • {app.subcategoryName}
                            </p>

                            <p className="text-xs text-slate-400 mt-2">
                              Submitted {new Date(app.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              app.status === "APPROVED"
                                ? "bg-green-100 text-green-700"
                                : app.status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>

                        {app.status === "REJECTED" && app.rejectReason && (
                          <details className="mt-4 group">
                            <summary className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-700 list-none flex items-center gap-2">
                              <span>Why was this rejected?</span>
                              <span className="transition-transform group-open:rotate-180">
                                ▼
                              </span>
                            </summary>

                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                              <p className="text-sm text-red-700">
                                {app.rejectReason}
                              </p>
                            </div>
                          </details>
                        )}
                      </div>
    
                      ))

                    )}

                  </div>
                )}

                {activeTab === "My Businesses" && (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">

                    {myBusinesses.length === 0 ? (

                      <div className="bg-white rounded-xl p-6 text-center">
                        No approved businesses yet.
                      </div>

                    ) : (

                      myBusinesses.map(business => (

                        <div
                          key={business._id}
                          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                        >

                          <div className="flex items-start justify-between">

                            <div>

                              <h3 className="font-bold text-slate-900">
                                {business.businessName}
                              </h3>

                              <p className="text-sm text-slate-500 mt-1">
                                {business.categoryName} • {business.subcategoryName}
                              </p>

                              <p className="text-xs text-slate-400 mt-2">
                                Approved
                              </p>

                            </div>

                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                              APPROVED
                            </span>

                          </div>

                          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-3">

                            <Link
                              to={`/business/${business._id}`}
                              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
                            >
                              👁 View Listing
                            </Link>

                            <Link
                              to={`/dashboard/edit-business/${business._id}`}
                              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                            >
                              ✏ Edit Business
                            </Link>

                          </div>

                        </div>

                      ))

                    )}

                  </div>
                )}
                
                {/* Tab: Recived leads */}
                {activeTab === 'receivedLeads' && (

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">

                    {receivedLeads.length === 0 ? (

                      <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
                        <h3 className="font-bold text-slate-800 mb-1">
                          No Leads Yet
                        </h3>
                        <p className="text-sm text-slate-500">
                          Customer enquiries will appear here.
                        </p>
                      </div>

                    ) : (

                      receivedLeads.map(
                        lead => (

                          <div
                            key={lead._id}
                            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                          >

                            <div className="flex items-start justify-between mb-4">

                              <div>
                                <h3 className="font-bold text-slate-900 text-lg">
                                  {lead.customerName}
                                </h3>

                                <p className="text-xs text-slate-500 mt-1">
                                  Interested in
                                  <span className="ml-1 font-semibold text-blue-600">
                                    {lead.serviceRequired}
                                  </span>
                                </p>
                              </div>

                              <span className="text-xs text-slate-400">
                                {new Date(
                                  lead.createdAt
                                ).toLocaleDateString()}
                              </span>

                            </div>

                            <div className="grid md:grid-cols-2 gap-3 mb-4">

                              <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-xs text-slate-500 mb-1">
                                  Email
                                </p>

                                <p className="font-medium text-slate-800 break-all">
                                  {lead.email}
                                </p>
                              </div>

                              <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-xs text-slate-500 mb-1">
                                  Phone
                                </p>

                                <p className="font-medium text-slate-800">
                                  {lead.phone}
                                </p>
                              </div>

                            </div>

                            {lead.message && (

                              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">

                                <p className="text-xs font-semibold text-blue-600 mb-1">
                                  Customer Message
                                </p>

                                <p className="text-sm text-slate-700 leading-relaxed">
                                  {lead.message}
                                </p>

                              </div>

                            )}

                            <div className="flex gap-2">

                              <a
                                href={`mailto:${lead.email}`}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-xl text-sm font-semibold transition-colors"
                              >
                                Email Customer
                              </a>

                              <a
                                href={`tel:${lead.phone}`}
                                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                              >
                                Call
                              </a>

                            </div>

                          </div>

                        )
                      )

                    )}

                  </div>

                )}

                {/* Tab: Quote Requests */}
                {activeTab === 'leads' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 pb-4">
                      <h3 className="text-xl font-bold text-slate-900">Quote Requests History</h3>
                      <p className="text-xs text-slate-400">Track inquiries you have sent to directory businesses</p>
                    </div>

                    {myLeads.length === 0 ? (
                      <div className="text-center py-16 space-y-4">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto">
                          <Send size={28} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-700">No Inquiries Found</h4>
                          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Request a quote from any business detail page to track your requests here.</p>
                        </div>
                        <Link to="/search" className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors">
                          Find a Service
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myLeads.map(lead => (
                          <div key={lead._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <Building2 size={16} className="text-blue-500" />
                                  {lead.businessName}
                                </h4>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                    Service: {lead.serviceRequired}
                                  </span>
                                  <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                    <Calendar size={9} />
                                    {new Date(lead.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Link 
                                to={`/business/${lead.businessId}`}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:shadow-sm transition-all"
                              >
                                View Listing <ExternalLink size={10} />
                              </Link>
                            </div>
                            
                            <div className="mt-3 bg-white border border-slate-100/50 rounded-xl p-3 text-xs text-slate-600">
                              <div className="font-semibold text-slate-500 mb-0.5">My Message:</div>
                              "{lead.message}"
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}


              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  export default UserDashboard;
