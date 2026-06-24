import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Tag } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  getCategories,
  getSubcategories,
  createCategory,
  deleteCategory,
  createSubcategory,
  deleteSubcategory,
  updateCategory
} from '../../services/api';
import toast from 'react-hot-toast';

const ManageCategories = () => {
  const [cats, setCats] = useState([]);
  const [subs, setSubs] = useState([]);
  const [catModal, setCatModal] = useState(null); // null | 'add' | category-object
  const [subModal, setSubModal] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', icon: '', color: 'from-blue-500 to-indigo-600' });
  const [subForm, setSubForm] = useState({ name: '', categoryId: '' });
  const [activeTab, setActiveTab] = useState('categories');

  const colorOptions = [
    'from-blue-500 to-indigo-600', 'from-violet-500 to-purple-600', 'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600', 'from-red-500 to-rose-600',
    'from-cyan-500 to-blue-600', 'from-lime-500 to-green-600',
  ];
  useEffect(() => {

  const loadData = async () => {

    try {

      const categories =
        await getCategories();

      const subcategories =
        await getSubcategories();

      setCats(categories);
      setSubs(subcategories);

    } catch (err) {

      console.error(err);

      toast.error(
        "Failed to load categories"
      );
    }
  };

  loadData();

  }, []);

  const openAddCat = () => { setCatForm({ name: '', icon: 'Building2', color: 'from-blue-500 to-indigo-600' }); setCatModal('add'); };
  const openEditCat = (cat) => { setCatForm({ ...cat }); setCatModal(cat); };
  const openAddSub = () => { setSubForm({ name: '', categoryId: '' }); setSubModal('add'); };

  const saveCat = async () => {

    if (!catForm.name) {
      toast.error(
        'Category name is required'
      );
      return;
    }

    try {

      if (catModal !== 'add') {
        // Use _id (always set) as the primary update key
        await updateCategory(
          catModal._id || catModal.id,
          {
            name: catForm.name,
            color: catForm.color
          }
        );

        toast.success(
          'Category updated'
        );

      } else {

        await createCategory({
          name: catForm.name,
          slug: catForm.name
            .toLowerCase()
            .replace(/\s+/g, '-'),
          color: catForm.color
        });

        toast.success(
          'Category added'
        );
      }

      const categories =
        await getCategories();

      setCats(categories);

      setCatModal(null);

    } catch (err) {

      console.error(err);

      toast.error(
        'Operation failed'
      );
    }
  };

  const deleteSub = async (sub) => {
    try {
      // Use _id (MongoDB string ID) as primary key, fall back to custom id
      await deleteSubcategory(sub._id || sub.id);

      const subcategories =
        await getSubcategories();

      setSubs(subcategories);

      toast.success(
        'Subcategory deleted'
      );

    } catch (err) {

      console.error(err);

      toast.error(
        'Delete failed'
      );
    }
  };

  const saveSub = async () => {

    if (
      !subForm.name ||
      !subForm.categoryId
    ) {

      toast.error(
        'Fill all fields'
      );

      return;
    }

    try {

      await createSubcategory({
        name: subForm.name,
        slug: subForm.name
          .toLowerCase()
          .replace(/\s+/g, '-'),
        categoryId:
          subForm.categoryId
      });

      const subcategories =
        await getSubcategories();

      setSubs(subcategories);

      toast.success(
        'Subcategory added'
      );

      setSubModal(null);

    } catch (err) {

      console.error(err);

      toast.error(
        'Failed to add subcategory'
      );
    }
  };

  const deleteCat = async (cat) => {

    if (!window.confirm(
        'Delete this category and all its subcategories?'
      )
    ) return;

    try {
      // Use _id (always set) as the primary delete key
      await deleteCategory(cat._id || cat.id);

      const categories =
        await getCategories();

      const subcategories =
        await getSubcategories();

      setCats(categories);
      setSubs(subcategories);

      toast.success(
        'Category deleted'
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
          <h2 className="text-xl font-black text-slate-900">Categories & Subcategories</h2>
          <p className="text-sm text-slate-500">{cats.length} categories, {subs.length} subcategories</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'categories' ? (
            <button onClick={openAddCat} className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
              <Plus size={15} /> Add Category
            </button>
          ) : (
            <button onClick={openAddSub} className="flex items-center gap-1.5 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-700 transition-colors">
              <Plus size={15} /> Add Subcategory
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-1 mb-5 w-fit">
        {['categories', 'subcategories'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Categories */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cats.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all">
              <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center mb-3`}>
                <Tag size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{cat.name}</h3>
              <p className="text-xs text-slate-400 mb-3">{subs.filter(s => s.categoryId === cat.id || s.categoryId === cat._id).length} subcategories</p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => openEditCat(cat)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 rounded-lg text-xs font-medium transition-colors"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => deleteCat(cat)}
                  className="p-1.5 border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subcategories */}
      {activeTab === 'subcategories' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Name', 'Slug', 'Parent Category', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subs.map(sub => {
                const parent = cats.find(c => c.id === sub.categoryId);
                return (
                  <tr key={sub._id || sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{sub.name}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">{sub.slug}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                        {cats.find(c => c.id === sub.categoryId || c._id === sub.categoryId)?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteSub(sub)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Modal */}
      {catModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-slate-900">{catModal === 'add' ? 'Add Category' : 'Edit Category'}</h3>
              <button onClick={() => setCatModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category Name *</label>
                <input
                  type="text"
                  value={catForm.name}
                  onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Marketing & Advertising"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Color Theme</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setCatForm(p => ({ ...p, color }))}
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} ${catForm.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''} transition-all`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={saveCat} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                <Save size={15} /> Save
              </button>
              <button onClick={() => setCatModal(null)} className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Add Modal */}
      {subModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-slate-900">Add Subcategory</h3>
              <button onClick={() => setSubModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Parent Category *</label>
                <select
                  value={subForm.categoryId}
                  onChange={e => setSubForm(p => ({ ...p, categoryId: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select Category</option>
                  {cats.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subcategory Name *</label>
                <input
                  type="text"
                  value={subForm.name}
                  onChange={e => setSubForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., SEO Services"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={saveSub} className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 flex items-center justify-center gap-2">
                <Save size={15} /> Add Subcategory
              </button>
              <button onClick={() => setSubModal(null)} className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageCategories;
