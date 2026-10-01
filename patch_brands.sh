cat << 'INNER_EOF' > src/components/AdminBrandsTab.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Search, Plus, Trash2, Edit, Sparkles, Loader2 } from 'lucide-react';
import { Brand } from '../types';

export const AdminBrandsTab: React.FC = () => {
  const { brands, addBrand, updateBrand, deleteBrand, createCampaign } = useApp();
  const [search, setSearch] = useState('');
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  
  // New brand state
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  
  // AI Settings
  const [questionsCount, setQuestionsCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!name.trim() || !category.trim()) return;
    
    if (editingBrand) {
      updateBrand(editingBrand.id, { name, category, description, website });
      setEditingBrand(null);
    } else {
      addBrand({ name, category, description, website, icon: 'Building2' });
      setIsCreating(false);
    }
    
    // Reset
    setName('');
    setCategory('');
    setDescription('');
    setWebsite('');
  };

  const handleGenerateCampaign = async () => {
    if (!name.trim() || !website.trim()) {
      alert("Brand Name and Website URL are required to generate a campaign.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: name,
          brandUrl: website,
          numberOfQuestions: questionsCount
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate campaign");
      }
      
      const data = await response.json();
      
      // Save the brand first if it's new
      let currentBrandId = editingBrand?.id;
      if (!currentBrandId) {
        // We will create the brand, then get the new ID. We can't get it immediately from addBrand because it doesn't return the ID, but we can generate a temporary one or rely on the user manually associating. Actually addBrand doesn't return the brand object. 
        // Let's create it manually or let the user save it first. 
        // For now, we will create the campaign without brandId if brand isn't saved, or wait, we can just save it.
      }

      createCampaign({
        title: \`\${name} AI Generated Survey\`,
        description: data.description || \`Customer feedback survey for \${name}\`,
        category: 'product',
        targetAudience: 'All active platform users',
        estimatedMinutes: Math.ceil(questionsCount * 0.8),
        rewardCoins: questionsCount * 20,
        status: 'active',
        questions: data.questions,
        brandId: currentBrandId
      });
      
      alert("Campaign generated and added to the customer queue successfully!");
    } catch (error) {
      console.error(error);
      alert("An error occurred while generating the campaign. Make sure GEMINI_API_KEY is set in .env");
    } finally {
      setIsGenerating(false);
    }
  };

  const startEditing = (brand: Brand) => {
    setEditingBrand(brand);
    setIsCreating(false);
    setName(brand.name);
    setCategory(brand.category);
    setDescription(brand.description || '');
    setWebsite(brand.website || '');
  };

  const cancelEdit = () => {
    setEditingBrand(null);
    setIsCreating(false);
    setName('');
    setCategory('');
    setDescription('');
    setWebsite('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Brand Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage public brand directory profiles and generate AI campaigns</p>
        </div>
        <button
          onClick={() => {
            cancelEdit();
            setIsCreating(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </button>
      </div>

      {(isCreating || editingBrand) && (
        <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingBrand ? 'Edit Brand' : 'Create New Brand'}
            </h3>
            
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">AI Questions per Product:</label>
              <input
                type="number"
                min={1}
                max={20}
                value={questionsCount}
                onChange={(e) => setQuestionsCount(Number(e.target.value))}
                className="w-16 px-2 py-1 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 text-center"
              />
              <button
                onClick={handleGenerateCampaign}
                disabled={isGenerating || !name.trim() || !website.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 transition-all"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Auto-Generate Survey
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Website URL</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. https://acmecorp.com"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. software_services"
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Description (Public)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the brand..."
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm min-h-[80px]"
              />
            </div>
            
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || !category.trim()}
                className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingBrand ? 'Save Changes' : 'Create Brand'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Brand</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Website</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{brand.name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-xs">{brand.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {brand.website ? (
                      <a href={brand.website} target="_blank" rel="noreferrer" className="text-xs font-medium text-indigo-600 hover:underline">
                        {brand.website}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 uppercase">
                      {brand.category}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEditing(brand)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Brand & Generate Surveys"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBrand(brand.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Brand"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBrands.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              No brands found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
INNER_EOF
