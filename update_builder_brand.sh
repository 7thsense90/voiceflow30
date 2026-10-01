#!/bin/bash
sed -i '/<div className="md:col-span-2">/i \
              <div>\
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Brand (Public Directory)</label>\
                <select value={campaignBrandId || '\'''\''} onChange={(e) => setCampaignBrandId(e.target.value || undefined)} className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">\
                  <option value="">No Brand Associated</option>\
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}\
                </select>\
              </div>' src/components/AdminDashboard.tsx
