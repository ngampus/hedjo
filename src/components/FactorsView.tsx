/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, BookOpen, HelpCircle, FileText, Info, Globe2, Layers, Search } from 'lucide-react';
import { GLOBAL_CATEGORIES, GLOBAL_FACTORS } from '../utils/carbonEngine';

export default function FactorsView() {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Table filtering
  const filteredFactors = GLOBAL_FACTORS
    .filter((f) => activeCategoryFilter === 'all' || f.categoryId === activeCategoryFilter)
    .filter((f) => !searchTerm || f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.source.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 animate-fadeIn" id="factors-registry">
      
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-sans text-slate-900 tracking-tight">
            Emission Factors Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard greenhouse multipliers used for calculating kilograms of $CO_2$ equivalent per unit of activity.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/50">
          <div className="flex items-center gap-1 px-3 py-1.5 text-xs text-emerald-850 font-bold font-sans">
            <Globe2 className="w-3.5 h-3.5 text-emerald-700 animate-spin" /> IPCC / ESDM 2025 Ready
          </div>
        </div>
      </div>

      {/* Advisory Callout explaining calculations */}
      <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 rounded-3xl border border-emerald-100 flex flex-col md:flex-row gap-5 items-start">
        <div className="p-3 bg-emerald-800 text-white rounded-2xl shrink-0">
          <BookOpen className="w-5 h-5 text-emerald-350" />
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <h3 className="font-bold text-slate-800 text-sm font-sans">Methodological Standards</h3>
          <p className="text-slate-600 leading-relaxed max-w-4xl font-sans">
            Hedjo carbon computations apply localized coefficients modeled from Indonesia's Ministry of Energy and Mineral Resources (Kementerian ESDM) for electricity grids, combined with UK Defra and SimaPro Life Cycle Assessments (LCA) for secondary supply chains. To secure your audits, these coefficients remain read-only for standard users and verified by climate-tech experts.
          </p>
        </div>
      </div>

      {/* Search & Categories Filter Board */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white border border-slate-150 p-4 rounded-2xl shadow-xs">
        
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search factors or citations (e.g. PLN, Defra)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none"
          />
        </div>

        {/* Categories select filter */}
        <div className="md:col-span-4 select-dropdown-wrap">
          <select 
            value={activeCategoryFilter}
            onChange={(e) => setActiveCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 text-xs p-2.5 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="all">All Category Classes</option>
            {GLOBAL_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Informative metadata bar */}
        <div className="md:col-span-3 flex items-center justify-end text-[11px] font-mono font-bold text-slate-400 select-none pb-1 md:pb-0">
          Showing {filteredFactors.length} standard indexes
        </div>
      </div>

      {/* Table displaying factor items */}
      <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Scope</th>
                <th className="px-5 py-3.5">Factor Name / Identifier</th>
                <th className="px-5 py-3.5">Category Group</th>
                <th className="px-5 py-3.5 text-right">Coefficient Rate</th>
                <th className="px-5 py-3.5">Reporting Unit</th>
                <th className="px-5 py-3.5">Official Citation / Reference Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFactors.map((fact) => {
                const categoryLabel = GLOBAL_CATEGORIES.find((c) => c.id === fact.categoryId)?.name || fact.categoryId;
                const scopeColors: { [key: number]: string } = {
                  1: 'bg-emerald-50 text-emerald-800 font-bold border-emerald-200/60',
                  2: 'bg-teal-50 text-teal-800 font-bold border-teal-200/60',
                  3: 'bg-cyan-50 text-cyan-800 font-bold border-cyan-200/60'
                };
                return (
                  <tr key={fact.id} className="hover:bg-slate-50/35 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-[10px] uppercase font-mono px-2 py-0.5 border rounded-md ${scopeColors[fact.scope]}`}>
                        Scope {fact.scope}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-extrabold text-slate-900 font-sans block">{fact.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-sans font-medium">{categoryLabel}</td>
                    <td className="px-5 py-3.5 text-right font-mono font-extrabold text-slate-900 bg-emerald-50/5">
                      {fact.value.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans font-normal">kg CO₂e</span>
                    </td>
                    <td className="px-5 py-3.5 font-sans font-semibold text-slate-500 whitespace-nowrap">per {fact.unit}</td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[10px] whitespace-normal">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-slate-300 shrink-0" />
                        <span>{fact.source}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
