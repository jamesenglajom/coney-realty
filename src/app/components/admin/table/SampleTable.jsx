"use client"
import React, { useState } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, ArrowUpDown, 
  MoreVertical, Filter, Download, Trash2 
} from 'lucide-react';

const SampleTable = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Sample User Data
  const data = [
    { id: 1, name: "Jordan Smith", email: "j.smith@corp.com", role: "Admin", status: "Active" },
    { id: 2, name: "Sarah Connor", email: "s.connor@sky.net", role: "Editor", status: "Inactive" },
    { id: 3, name: "Marcus Wright", email: "m.wright@resistance.io", role: "User", status: "Active" },
    { id: 4, name: "Elena Fisher", email: "e.fisher@uncharted.com", role: "Admin", status: "Active" },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-xl border border-theme-gold-light dark:border-[#333] shadow-sm overflow-hidden">
      
      {/* Table Toolbar */}
      <div className="p-4 border-b border-theme-gold-light dark:border-[#333] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
          <input 
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 bg-[#fcfcfc] dark:bg-black border border-theme-gold-light dark:border-[#333] rounded-lg text-sm focus:ring-1 focus:ring-theme-gold outline-none transition-all text-txt-primary dark:text-txt-primary-dark"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary dark:text-txt-secondary-dark border border-theme-gold-light dark:border-[#333] rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <Filter size={14} /> Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-theme-blue rounded-lg hover:bg-opacity-90 transition-colors">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* The Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fcfcfc] dark:bg-black/40 border-b border-theme-gold-light dark:border-[#333]">
              <th className="p-4 w-10">
                <input type="checkbox" className="accent-theme-gold rounded" />
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">
                <button className="flex items-center gap-1 hover:text-theme-blue dark:hover:text-theme-gold">
                  User <ArrowUpDown size={12} />
                </button>
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">Role</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark">Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-txt-muted dark:text-txt-muted-dark text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-gold-light dark:divide-[#333]">
            {data.map((user) => (
              <tr key={user.id} className="hover:bg-[#fcfcfc] dark:hover:bg-white/[0.02] transition-colors group">
                <td className="p-4">
                  <input type="checkbox" className="accent-theme-gold rounded" />
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-theme-blue dark:text-white text-sm">{user.name}</span>
                    <span className="text-xs text-txt-secondary dark:text-txt-secondary-dark">{user.email}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-txt-primary dark:text-txt-primary-dark">{user.role}</span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'Active' 
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-txt-muted-dark'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-txt-muted">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-theme-gold-light dark:border-[#333] flex items-center justify-between">
        <span className="text-xs text-txt-muted dark:text-txt-muted-dark">
          Showing <span className="font-medium text-txt-primary dark:text-white">1</span> to <span className="font-medium text-txt-primary dark:text-white">4</span> of <span className="font-medium text-txt-primary dark:text-white">120</span> results
        </span>
        
        <div className="flex items-center gap-1">
          <button className="p-2 border border-theme-gold-light dark:border-[#333] rounded-md hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50">
            <ChevronLeft size={16} className="text-txt-primary dark:text-white" />
          </button>
          
          <div className="flex gap-1 mx-2">
            {[1, 2, 3].map(page => (
              <button 
                key={page}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                  page === 1 
                  ? 'bg-theme-gold text-white'
                  : 'text-txt-secondary dark:text-txt-secondary-dark hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button className="p-2 border border-theme-gold-light dark:border-[#333] rounded-md hover:bg-gray-50 dark:hover:bg-white/5">
            <ChevronRight size={16} className="text-txt-primary dark:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SampleTable;