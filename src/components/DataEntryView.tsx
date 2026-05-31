/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Leaf, Plus, Trash2, Edit3, Filter, X, HelpCircle, Save, Info } from 'lucide-react';
import { ActivityData, EmissionCategory, EmissionFactor, Scope } from '../types';
import { GLOBAL_CATEGORIES, GLOBAL_FACTORS, calculateCO2e } from '../utils/carbonEngine';

interface DataEntryViewProps {
  activities: ActivityData[];
  onAddActivity: (act: Partial<ActivityData>) => void;
  onUpdateActivity: (id: string, act: Partial<ActivityData>) => void;
  onDeleteActivity: (id: string) => void;
  orgId: string;
  reportingPeriodId: string;
}

export default function DataEntryView({
  activities,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  orgId,
  reportingPeriodId
}: DataEntryViewProps) {
  const [activeScopeTab, setActiveScopeTab] = useState<Scope>(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [date, setDate] = useState('2025-06');
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [factorId, setFactorId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Filtering State
  const [filterLocation, setFilterLocation] = useState('');

  // 1. Get categories corresponding to active scope
  const availableCategories = GLOBAL_CATEGORIES.filter((c) => c.scope === activeScopeTab);

  // 2. Get factors corresponding to active category
  const availableFactors = GLOBAL_FACTORS.filter((f) => f.categoryId === categoryId);

  // 3. Compute live $tCO_2e$ preview inside form
  const selectedFactor = GLOBAL_FACTORS.find((f) => f.id === factorId);
  const liveFactorValue = selectedFactor ? selectedFactor.value : 0;
  const liveCO2ePreview = calculateCO2e(amount, liveFactorValue);

  // Open clean insert form with smart defaults
  const handleOpenAdd = () => {
    setEditingId(null);
    setDate('2025-06');
    setLocation('');
    setNotes('');
    setAmount(0);
    
    // Choose first category and corresponding factor dynamically
    const firstCat = availableCategories[0]?.id || '';
    setCategoryId(firstCat);
    const relatedFactors = GLOBAL_FACTORS.filter((f) => f.categoryId === firstCat);
    setFactorId(relatedFactors[0]?.id || '');
    
    setShowAddForm(true);
  };

  // Open edit pre-populating fields
  const handleOpenEdit = (act: ActivityData) => {
    setEditingId(act.id);
    setDate(act.date || '2025-06');
    setLocation(act.location);
    setCategoryId(act.categoryId);
    setFactorId(act.emissionFactorId);
    setAmount(act.activityAmount);
    setNotes(act.notes);
    setShowAddForm(true);
  };

  // Dynamic selector response
  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId);
    const relatedFactors = GLOBAL_FACTORS.filter((f) => f.categoryId === catId);
    setFactorId(relatedFactors[0]?.id || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      alert("Please provide the specific facility or operational location.");
      return;
    }
    if (amount <= 0) {
      alert("Please enter a positive numeric quantity.");
      return;
    }
    if (!factorId) {
      alert("Please select a valid greenhouse emission factor.");
      return;
    }

    const payload: Partial<ActivityData> = {
      orgId,
      reportingPeriodId,
      scope: activeScopeTab,
      categoryId,
      location: location.trim(),
      activityAmount: Number(amount),
      activityUnit: selectedFactor?.unit || 'Units',
      emissionFactorId: factorId,
      calculatedCO2e: liveCO2ePreview,
      notes: notes.trim(),
      date,
      createdAt: new Date().toISOString()
    };

    if (editingId) {
      onUpdateActivity(editingId, payload);
    } else {
      onAddActivity(payload);
    }

    setShowAddForm(false);
    setEditingId(null);
  };

  // List filter applicability
  const filteredActivities = activities
    .filter((a) => a.scope === activeScopeTab)
    .filter((a) => !filterLocation || a.location.toLowerCase().includes(filterLocation.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 animate-fadeIn" id="data-entry-view">
      
      {/* Title Segment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-sans text-slate-900 tracking-tight">
            GHG Active Carbon Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log directly audited carbon metrics categorized across Scope 1-3.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-emerald-805 hover:bg-emerald-950 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-900/35"
        >
          <Plus className="w-4 h-4" /> Log Activity Entry
        </button>
      </div>

      {/* Scope navigation sheet tabs */}
      <div className="flex border-b border-slate-200" id="scope-tabs">
        <button
          onClick={() => { setActiveScopeTab(1); setShowAddForm(false); }}
          className={`py-3.5 px-6 font-bold text-xs uppercase tracking-wider border-b-2 font-sans transition-all cursor-pointer ${
            activeScopeTab === 1
              ? 'border-emerald-800 text-emerald-950 bg-emerald-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Scope 1: Direct Fuels
        </button>
        <button
          onClick={() => { setActiveScopeTab(2); setShowAddForm(false); }}
          className={`py-3.5 px-6 font-bold text-xs uppercase tracking-wider border-b-2 font-sans transition-all cursor-pointer ${
            activeScopeTab === 2
              ? 'border-teal-800 text-teal-950 bg-teal-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Scope 2: Purchased Grid
        </button>
        <button
          onClick={() => { setActiveScopeTab(3); setShowAddForm(false); }}
          className={`py-3.5 px-6 font-bold text-xs uppercase tracking-wider border-b-2 font-sans transition-all cursor-pointer ${
            activeScopeTab === 3
              ? 'border-cyan-805 text-cyan-950 bg-cyan-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Scope 3: Sourced Chain
        </button>
      </div>

      {/* Togglable add/edit expander panel */}
      {showAddForm && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-5 shadow-sm transition-all duration-250 animate-fadeIn" id="activity-form">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-800" />
              {editingId ? 'Edit Audited Entry' : 'Log New Carbon Footprint Entry'}
            </h3>
            <button 
              type="button" 
              onClick={() => { setShowAddForm(false); setEditingId(null); }}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Reporting Date (YYYY-MM) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Reporting Year &amp; Month</label>
              <input 
                type="month" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-xs px-3 py-2.5 rounded-lg focus:outline-none"
                required
              />
            </div>

            {/* GHG Subcategory selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">GHG Subcategory</label>
              <select 
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-xs p-2.5 rounded-lg focus:outline-none"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Facility / Facility Location</label>
              <input 
                type="text" 
                placeholder="e.g. Jakarta HQ Tower A / Medan Server array"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-xs px-3 py-2.5 rounded-lg focus:outline-none"
                required
              />
            </div>

            {/* Emission factor selector */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-600">Cooperating Emission Factor (Index)</label>
              <select 
                value={factorId}
                onChange={(e) => setFactorId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-xs p-2.5 rounded-lg focus:outline-none"
              >
                {availableFactors.map((fact) => (
                  <option key={fact.id} value={fact.id}>
                    {fact.name} ({fact.value} kg CO₂e/{fact.unit}) — Source: {fact.source}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantitative amount input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Logged Quantity ({selectedFactor?.unit || 'Units'})
              </label>
              <input 
                type="number" 
                step="any"
                min="0.0001"
                placeholder="e.g. 1500"
                value={amount === 0 ? '' : amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-xs px-3 py-2.5 rounded-lg focus:outline-none font-mono"
                required
              />
            </div>

            {/* Optional documentation notes */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-600">Notes / Audit Reference</label>
              <input 
                type="text" 
                placeholder="e.g. Sourced from PLN invoice number 0921-JKT"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-xs px-3 py-2.5 rounded-lg focus:outline-none"
              />
            </div>

            {/* Calculated Footprint Live Indicator display */}
            <div className="bg-emerald-50 text-emerald-950 p-4 rounded-xl border border-emerald-100 flex items-center justify-between col-span-3 md:col-span-1 border-dashed mt-2">
              <div>
                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Emissions Preview</span>
                <span className="font-mono text-xl font-extrabold text-emerald-950">{liveCO2ePreview.toFixed(3)} <span className="text-xs font-sans font-medium text-emerald-800">tCO₂e</span></span>
              </div>
              <div className="text-[9px] text-right max-w-[120px] text-emerald-700 leading-tight">
                {amount || 0} * {liveFactorValue} kg CO₂ / 1000 = Tons
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3.5 border-t border-slate-100 pt-4">
            <button 
              type="button" 
              onClick={() => { setShowAddForm(false); setEditingId(null); }}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold border border-slate-200 rounded-lg bg-white"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-5 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Save Audited Entry
            </button>
          </div>
        </form>
      )}

      {/* Filter Row segment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-150 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Filters:</span>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search by facility (e.g. Jakarta)..."
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="bg-slate-50/70 border border-slate-200 focus:border-emerald-600 text-xs px-3 py-2 rounded-xl focus:outline-none w-full sm:w-64"
          />
        </div>
      </div>

      {/* Ledger Table listing active scope items */}
      <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 font-bold text-slate-500 uppercase tracking-wider select-none">
                <th className="px-5 py-3.5">Month</th>
                <th className="px-5 py-3.5">Subcategory</th>
                <th className="px-5 py-3.5">Operational Facility</th>
                <th className="px-5 py-3.5 text-right">Logged Metric Amount</th>
                <th className="px-5 py-3.5 text-right">Calculated Footprint</th>
                <th className="px-5 py-3.5">Audit Trail Note</th>
                <th className="px-5 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((act) => {
                  const categoryName = GLOBAL_CATEGORIES.find((c) => c.id === act.categoryId)?.name || act.categoryId;
                  return (
                    <tr key={act.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3.5 font-mono font-semibold text-slate-700 whitespace-nowrap">{act.date || '2025-06'}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-800">{categoryName}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{act.location}</td>
                      <td className="px-5 py-3.5 text-right font-mono font-medium text-slate-650">
                        {act.activityAmount.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans font-normal">{act.activityUnit}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-extrabold text-emerald-950 whitespace-nowrap bg-emerald-50/15">
                        {act.calculatedCO2e.toFixed(3)} <span className="text-[10px] text-slate-400 font-sans font-bold">tCO₂e</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 italic max-w-xs truncate" title={act.notes}>{act.notes || 'No note added.'}</td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEdit(act)}
                            className="p-1 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit entry"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => onDeleteActivity(act.id)}
                            className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-450 bg-slate-50/10">
                    <div className="flex flex-col items-center gap-2">
                      <Plus className="w-8 h-8 text-slate-300" />
                      <span className="text-xs text-slate-400 font-medium">No ledger records matched active Scope parameters.</span>
                      <button 
                        onClick={handleOpenAdd}
                        className="text-emerald-800 font-bold hover:underline py-1 px-3 text-[11px] hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        Create entry now
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Short educational disclaimer showing GHG guidelines */}
      <div className="bg-slate-100/55 border border-slate-200/60 p-4.5 rounded-2xl flex items-start gap-3 mt-1 text-xs">
        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-slate-500 leading-relaxed">
          <strong>GHG Protocol Accounting Convention:</strong> Scope 1 relates to fuel burned inside controlled equipment. Scope 2 relates to central electricity purchases. Scope 3 maps all supply chain networks, business travel flights, and operational waste. Always review standard utility meters before declaring ESG values.
        </div>
      </div>
    </div>
  );
}
