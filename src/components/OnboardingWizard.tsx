/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Leaf, Info, Building2, Calendar, CheckSquare, ArrowLeft, ArrowRight } from 'lucide-react';
import { Organization, ReportingPeriod } from '../types';

interface OnboardingWizardProps {
  userId: string;
  onOnboardingComplete: (org: Organization, period: ReportingPeriod) => void;
  onBackToLogin: () => void;
}

export default function OnboardingWizard({ userId, onOnboardingComplete, onBackToLogin }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  
  // Form State
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Indonesia');
  const [industry, setIndustry] = useState('Technology & SaaS');
  const [baseCurrency, setBaseCurrency] = useState('IDR');
  const [baselineYear, setBaselineYear] = useState(2025);
  
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [estimatedRating, setEstimatedRating] = useState<string | undefined>(undefined);
  const [estimatedFootprintRange, setEstimatedFootprintRange] = useState<string | undefined>(undefined);
  const [estimationReason, setEstimationReason] = useState<string | undefined>(undefined);
  const [estimating, setEstimating] = useState(false);

  const [reportingYear, setReportingYear] = useState(2025);

  const handleEstimateFootprint = async () => {
    if (!name.trim()) {
      alert("Please enter a company or organization name first.");
      return;
    }
    if (!websiteUrl.trim()) {
      alert("Please enter a website URL first.");
      return;
    }
    setEstimating(true);
    try {
      const response = await fetch('/api/analysis/estimate-rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          websiteUrl: websiteUrl.trim(),
          industry,
          country
        })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch rating estimation response.');
      }
      const data = await response.json();
      setEstimatedRating(data.rating);
      setEstimatedFootprintRange(data.footprintRange);
      setEstimationReason(data.explanation);
    } catch (err: any) {
      console.warn('Network or routing request failed, computing dynamic local fallback calculation:', err);
      
      // Compute high-fidelity local sector calculation as direct fallback
      let rating = 'B';
      let footprintRange = '10 - 25 tCO2e/yr';
      let explanation = 'Assigned moderate baseline average. Industry profile indicates office operations grids and low directly owned combustion fleets.';

      const lowerIndustry = (industry || '').toLowerCase();
      if (lowerIndustry.includes('tech') || lowerIndustry.includes('saas') || lowerIndustry.includes('professional')) {
        rating = 'A-';
        footprintRange = '8 - 20 tCO2e/yr';
        explanation = 'Evaluated as low directly combusted fuel profile. Major footprint lies in remote-first digital server operations, Scope 2 digital workspaces, and value chain SaaS tools.';
      } else if (lowerIndustry.includes('logistics') || lowerIndustry.includes('freight')) {
        rating = 'D';
        footprintRange = '500 - 1500 tCO2e/yr';
        explanation = 'Categorized as heavy energy-intensive operations. Large fleet transport requirements, diesel combustion profiles, and Scope 3 supplier logistics trigger low-efficiency footprint indicators.';
      } else if (lowerIndustry.includes('manufacturing') || lowerIndustry.includes('apparel')) {
        rating = 'C-';
        footprintRange = '250 - 750 tCO2e/yr';
        explanation = 'Evaluated with substantial process heating obligations. Steam purchases (Scope 2) and industrial electricity dependencies create localized carbon-intensive zones requiring heavy abatement.';
      } else if (lowerIndustry.includes('hospitality') || lowerIndustry.includes('food')) {
        rating = 'C+';
        footprintRange = '45 - 120 tCO2e/yr';
        explanation = 'Significant Scope 1 fugitive air conditioning refrigerant pressures and food supply chain logistics (Scope 3) characterize hospitality profiles.';
      }

      setEstimatedRating(rating);
      setEstimatedFootprintRange(footprintRange);
      setEstimationReason(`${explanation} (Calculated via Local Sector Fallback Index)`);
    } finally {
      setEstimating(false);
    }
  };
  
  const [trackScope1, setTrackScope1] = useState(true);
  const [trackScope2, setTrackScope2] = useState(true);
  const [trackScope3, setTrackScope3] = useState(true);

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      alert("Please enter your organization's legal name.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    const orgId = 'org_' + Math.random().toString(36).substring(4, 9);
    
    const newOrg: Organization = {
      id: orgId,
      name: name.trim(),
      country,
      industry,
      baseCurrency,
      baselineYear: Number(baselineYear),
      ownerUserId: userId,
      createdAt: new Date().toISOString(),
      websiteUrl: websiteUrl.trim() || undefined,
      estimatedRating: estimatedRating || undefined,
      estimatedFootprintRange: estimatedFootprintRange || undefined,
      estimationReason: estimationReason || undefined
    };

    const newPeriod: ReportingPeriod = {
      id: `${orgId}_${reportingYear}`,
      orgId: orgId,
      year: Number(reportingYear),
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    onOnboardingComplete(newOrg, newPeriod);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6" id="onboarding-wizard">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col gap-6 relative overflow-hidden">
        
        {/* Absolute header bar indicating active step */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
          <div 
            className="h-full bg-emerald-800 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {/* Wizard Header logo */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-800 text-white p-1.5 rounded-lg">
              <Leaf className="w-4 h-4 text-emerald-300" />
            </div>
            <span className="font-sans text-sm font-bold text-emerald-950">Hedjo Workspace</span>
          </div>
          <span className="text-xs font-semibold font-mono text-slate-400">Step {step} of 3</span>
        </div>

        {/* STEP 1: ORGANIZATION FORM */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-fadeIn">
            <div className="flex items-start gap-3">
              <Building2 className="w-6 h-6 text-emerald-800 mt-1" />
              <div>
                <h2 className="text-xl font-bold font-sans text-slate-900">Set Up Your Climate Profile</h2>
                <p className="text-xs text-slate-500">Configure your administrative boundary details for emissions calculations.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Company / Organization Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nusantara Green Logistics Co."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-sm px-4 py-3 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Country of Incorporation</label>
                  <select 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-sm px-4 py-3 rounded-xl focus:outline-none"
                  >
                    <option value="Indonesia">Indonesia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Vietnam">Vietnam</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Administrative Currency</label>
                  <select 
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-sm px-4 py-3 rounded-xl focus:outline-none"
                  >
                    <option value="IDR">Rupiah (IDR)</option>
                    <option value="SGD">Singapore Dollar (SGD)</option>
                    <option value="MYR">Malaysian Ringgit (MYR)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Operational Industry Sector</label>
                <select 
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-sm px-4 py-3 rounded-xl focus:outline-none"
                >
                  <option value="Technology & SaaS">Technology &amp; SaaS</option>
                  <option value="Logistics & Freight">Logistics &amp; Freight Transport</option>
                  <option value="Manufacturing & Apparel">Manufacturing &amp; Apparel</option>
                  <option value="Hospitality & F&B">Hospitality &amp; Food Services</option>
                  <option value="Corporate Professional Services">Corporate Office Services</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-4 mt-1">
                <label className="text-xs font-bold text-slate-600">Company Website URL &amp; Live Climate Assessment</label>
                <p className="text-[10px] text-slate-400">Add your web domain to enable AI and sector-specific estimation of your carbon efficiency range and baseline carbon rating.</p>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="e.g. https://www.nusantaragreenlogistics.co.id"
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-sm px-4 py-3 rounded-xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleEstimateFootprint}
                    disabled={estimating || !websiteUrl.trim()}
                    className="bg-emerald-950 hover:bg-emerald-900 disabled:bg-slate-150 disabled:text-slate-400 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                  >
                    {estimating ? 'Analyzing...' : '⚡ Estimate Rating'}
                  </button>
                </div>
              </div>

              {/* Dynamic Carbon Rating Card */}
              {estimatedRating && (
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex gap-4 animate-fadeIn" id="wizard-estimated-rating-card">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex flex-col items-center justify-center shadow-md shrink-0 border border-emerald-900/10">
                    <span className="text-[8px] uppercase font-bold tracking-wider text-emerald-300">RATING</span>
                    <span className="text-xl font-black font-mono leading-none">{estimatedRating}</span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-xs font-bold text-slate-800">Assessed Footprint range:</span>
                      <span className="text-[10px] font-black font-sans uppercase text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">{estimatedFootprintRange}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{estimationReason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: YEARS CONFIGURATION */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-fadeIn">
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 text-emerald-800 mt-1" />
              <div>
                <h2 className="text-xl font-bold font-sans text-slate-900">Define Baseline Years</h2>
                <p className="text-xs text-slate-500">Pick baseline guidelines to evaluate yearly reduction targets.</p>
              </div>
            </div>

            <div className="flex flex-col gap-5 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Historical Baseline Year</label>
                <input 
                  type="number" 
                  value={baselineYear}
                  onChange={(e) => setBaselineYear(Number(e.target.value))}
                  min={2018}
                  max={2026}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-sm px-4 py-3 rounded-xl focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">GHG baseline frame used for historic offset comparisons. Default is 2025.</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Current GHG Reporting Period Year</label>
                <input 
                  type="number" 
                  value={reportingYear}
                  onChange={(e) => {
                    setReportingYear(Number(e.target.value));
                    setBaselineYear(Number(e.target.value)); // default synchronous
                  }}
                  min={2020}
                  max={2030}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-sm px-4 py-3 rounded-xl focus:outline-none"
                />
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3 mt-1">
                <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed font-sans">
                  The GHG Protocol mandates setting a typical, verifiable target baseline. You will log emissions indicators for this reporting year.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EMISSION SCOPES CONFIG */}
        {step === 3 && (
          <div className="flex flex-col gap-5 animate-fadeIn">
            <div className="flex items-start gap-3">
              <CheckSquare className="w-6 h-6 text-emerald-800 mt-1" />
              <div>
                <h2 className="text-xl font-bold font-sans text-slate-900">Enrolled Boundary Scopes</h2>
                <p className="text-xs text-slate-500">Pick which corporate emissions boundaries you are logging indicators for.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              {/* Scope 1 Selection */}
              <label className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200 select-none cursor-pointer hover:bg-slate-100/50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={trackScope1}
                  onChange={(e) => setTrackScope1(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-800 border-slate-300 rounded focus:ring-emerald-700 accent-emerald-800"
                />
                <div>
                  <div className="text-sm font-bold text-slate-800">Scope 1: Direct Greenhouse Leaks &amp; Fuel</div>
                  <div className="text-xs text-slate-500 leading-relaxed mt-0.5">
                    Fossil fuels combusted locally (generator diesel, courier gasoline) + commercial building split aircon top-up gases.
                  </div>
                </div>
              </label>

              {/* Scope 2 Selection */}
              <label className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200 select-none cursor-pointer hover:bg-slate-100/50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={trackScope2}
                  onChange={(e) => setTrackScope2(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-800 border-slate-300 rounded focus:ring-emerald-700 accent-emerald-800"
                />
                <div>
                  <div className="text-sm font-bold text-slate-800">Scope 2: Purchased Electrical Grids</div>
                  <div className="text-xs text-slate-500 leading-relaxed mt-0.5">
                    Indirect greenhouse gases from grid consumption. Uses MEMR ESDM regional grid carbon indices.
                  </div>
                </div>
              </label>

              {/* Scope 3 Selection */}
              <label className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200 select-none cursor-pointer hover:bg-slate-100/50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={trackScope3}
                  onChange={(e) => setTrackScope3(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-800 border-slate-300 rounded focus:ring-emerald-700 accent-emerald-800"
                />
                <div>
                  <div className="text-sm font-bold text-slate-800">Scope 3: Sourced Sourcing &amp; Travels</div>
                  <div className="text-xs text-slate-500 leading-relaxed mt-0.5">
                    Supply chain, municipal waste landfilled, business flight passenger-kilometers, and daily office commuting.
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Wizard Footer Nav Buttons */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-4">
          {step > 1 ? (
            <button 
              onClick={handleBack}
              className="border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer bg-white"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          ) : (
            <button 
              onClick={onBackToLogin}
              className="border border-slate-300 hover:border-slate-400 text-slate-500 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer bg-white"
            >
              Back to Login
            </button>
          )}

          {step < 3 ? (
            <button 
              onClick={handleNext}
              className="bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all hover:shadow-md flex items-center gap-1 cursor-pointer"
            >
              Generate Green Workspace <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
