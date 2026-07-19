/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  BarChart3, 
  LeafyGreen, 
  Database, 
  Cpu, 
  ArrowLeftRight, 
  Lock, 
  Unlock, 
  User, 
  LogOut, 
  Menu, 
  Globe2, 
  Building2, 
  HelpCircle,
  FolderLock
} from 'lucide-react';

import { Organization, ReportingPeriod, ActivityData } from './types';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import OnboardingWizard from './components/OnboardingWizard';
import DashboardView from './components/DashboardView';
import DataEntryView from './components/DataEntryView';
import FactorsView from './components/FactorsView';
import InsightsView from './components/InsightsView';

import { 
  SEED_DEMO_ORG, 
  SEED_DEMO_PERIOD, 
  SEED_DEMO_ACTIVITIES 
} from './utils/carbonEngine';

import { 
  isFirebaseEnabled, 
  saveOrganizationToFirestore, 
  updateOrganizationInFirestore,
  saveReportingPeriodToFirestore, 
  getOrganizationsForUser, 
  getReportingPeriodsForOrg, 
  getActivitiesForPeriod, 
  addActivityToFirestore, 
  updateActivityInFirestore, 
  deleteActivityFromFirestore 
} from './utils/firebaseService';
import { testConnection, isD1Mode } from './firebase';

export default function App() {
  // Navigation states
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core model states
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [period, setPeriod] = useState<ReportingPeriod | null>(null);
  const [activities, setActivities] = useState<ActivityData[]>([]);

  // Pre-flight validation on boot and session restoration
  useEffect(() => {
    if (isFirebaseEnabled()) {
      testConnection();
    }
    // D1 mode: check session from cookie via API
    if (isD1Mode) {
      fetch('/api/auth/me', { credentials: 'same-origin' })
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            setUser({ id: data.user.id, email: data.user.email });
            getOrganizationsForUser(data.user.id).then((orgs) => {
              if (orgs.length > 0) {
                setOrganization(orgs[0]);
                getReportingPeriodsForOrg(orgs[0].id).then((periods) => {
                  if (periods.length > 0) setPeriod(periods[0]);
                });
              }
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  // Load session from localStorage on mount & synchronize from cloud
  useEffect(() => {
    const cachedUser = localStorage.getItem('hedjo_session_user');
    const cachedOrg = localStorage.getItem('hedjo_session_org');
    const cachedPeriod = localStorage.getItem('hedjo_session_period');

    if (cachedUser) {
      const parsedUser = JSON.parse(cachedUser);
      setUser(parsedUser);
      
      if (isFirebaseEnabled() && parsedUser.id !== 'demo_user_id') {
        getOrganizationsForUser(parsedUser.id).then((orgs) => {
          if (orgs.length > 0) {
            const activeOrg = orgs[0];
            setOrganization(activeOrg);
            localStorage.setItem('hedjo_session_org', JSON.stringify(activeOrg));
            
            getReportingPeriodsForOrg(activeOrg.id).then((periods) => {
              if (periods.length > 0) {
                const activePeriod = periods[0];
                setPeriod(activePeriod);
                localStorage.setItem('hedjo_session_period', JSON.stringify(activePeriod));
              }
            });
          } else {
            if (cachedOrg) {
              const parsedOrg = JSON.parse(cachedOrg);
              setOrganization(parsedOrg);
              saveOrganizationToFirestore(parsedOrg, parsedUser.email).catch(e => {
                console.warn("Auto-syncing cached organization to Firestore failed:", e);
              });
            }
            if (cachedPeriod) {
              const parsedPeriod = JSON.parse(cachedPeriod);
              setPeriod(parsedPeriod);
              saveReportingPeriodToFirestore(parsedPeriod).catch(e => {
                console.warn("Auto-syncing cached reporting period to Firestore failed:", e);
              });
            }
          }
        }).catch(err => {
          console.warn("Restoring cloud sessions issues:", err);
          if (cachedOrg) setOrganization(JSON.parse(cachedOrg));
          if (cachedPeriod) setPeriod(JSON.parse(cachedPeriod));
        });
      } else {
        if (cachedOrg) {
          setOrganization(JSON.parse(cachedOrg));
        }
        if (cachedPeriod) {
          setPeriod(JSON.parse(cachedPeriod));
        }
      }
    }
  }, []);

  // Fetch activities dynamic responses whenever organization & period changes
  useEffect(() => {
    if (organization && period) {
      if (isD1Mode && organization.id !== 'hedjo_demo_corp') {
        getActivitiesForPeriod(organization.id, period.id).then((actList) => {
          setActivities(actList);
        }).catch(() => setActivities([]));
      } else if (isFirebaseEnabled() && organization.id !== 'hedjo_demo_corp') {
        getActivitiesForPeriod(organization.id, period.id).then((actList) => {
          setActivities(actList);
        }).catch(err => {
          console.error("Firestore activities loading error:", err);
          const storageKey = `hedjo_activities_${organization.id}_${period.year}`;
          const savedActivities = localStorage.getItem(storageKey);
          if (savedActivities) setActivities(JSON.parse(savedActivities));
        });
      } else {
        const storageKey = `hedjo_activities_${organization.id}_${period.year}`;
        const savedActivities = localStorage.getItem(storageKey);
        
        if (savedActivities) {
          setActivities(JSON.parse(savedActivities));
        } else {
          // Fallback for Demo Org to reload seed mock data automatically
          if (organization.id === 'hedjo_demo_corp') {
            localStorage.setItem(storageKey, JSON.stringify(SEED_DEMO_ACTIVITIES));
            setActivities(SEED_DEMO_ACTIVITIES);
          } else {
            setActivities([]);
          }
        }
      }
    }
  }, [organization, period]);

  // Auth response handler
  const handleAuthSuccess = (userId: string, email: string, isDemo: boolean) => {
    const sessionUser = { id: userId, email };
    setUser(sessionUser);
    localStorage.setItem('hedjo_session_user', JSON.stringify(sessionUser));

    if (isDemo) {
      // Seed Demo Organization
      setOrganization(SEED_DEMO_ORG);
      setPeriod(SEED_DEMO_PERIOD);
      localStorage.setItem('hedjo_session_org', JSON.stringify(SEED_DEMO_ORG));
      localStorage.setItem('hedjo_session_period', JSON.stringify(SEED_DEMO_PERIOD));
      
      // Auto-set seed activities
      const storageKey = `hedjo_activities_${SEED_DEMO_ORG.id}_${SEED_DEMO_PERIOD.year}`;
      localStorage.setItem(storageKey, JSON.stringify(SEED_DEMO_ACTIVITIES));
      setActivities(SEED_DEMO_ACTIVITIES);
      setActiveTab('dashboard');
    }
  };

  // Onboarding wizard completion handler
  const handleOnboardingComplete = async (newOrg: Organization, newPeriod: ReportingPeriod) => {
    if (isD1Mode && user && user.id !== 'demo_user_id') {
      try {
        await saveOrganizationToFirestore(newOrg, user.email);
        await saveReportingPeriodToFirestore(newPeriod);
      } catch (err) {
        console.error("Failed onboarding profile sync in D1 database:", err);
      }
    } else if (isFirebaseEnabled() && user && user.id !== 'demo_user_id') {
      try {
        await saveOrganizationToFirestore(newOrg, user.email);
        await saveReportingPeriodToFirestore(newPeriod);
      } catch (err) {
        console.error("Failed onboarding profile sync in Firestore database:", err);
      }
    }
    
    setOrganization(newOrg);
    setPeriod(newPeriod);
    localStorage.setItem('hedjo_session_org', JSON.stringify(newOrg));
    localStorage.setItem('hedjo_session_period', JSON.stringify(newPeriod));
    
    // Clear old activities
    setActivities([]);
    setActiveTab('dashboard');
  };

  const handleUpdateOrganization = async (updatedOrg: Organization) => {
    if (isD1Mode && user && user.id !== 'demo_user_id') {
      try {
        await updateOrganizationInFirestore(updatedOrg);
      } catch (err) {
        console.error("Failed updating organization details in D1:", err);
      }
    } else if (isFirebaseEnabled() && user && user.id !== 'demo_user_id') {
      try {
        await updateOrganizationInFirestore(updatedOrg);
      } catch (err) {
        console.error("Failed updating organization details in Firestore:", err);
      }
    }
    setOrganization(updatedOrg);
    localStorage.setItem('hedjo_session_org', JSON.stringify(updatedOrg));
  };

  // Sign out session cleaner
  const handleLogout = () => {
    setUser(null);
    setOrganization(null);
    setPeriod(null);
    setActivities([]);
    
    localStorage.removeItem('hedjo_session_user');
    localStorage.removeItem('hedjo_session_org');
    localStorage.removeItem('hedjo_session_period');
  };

  // Carbon Ledger state synchronizers
  const saveActivitiesToStorage = (updatedList: ActivityData[]) => {
    if (organization && period) {
      const storageKey = `hedjo_activities_${organization.id}_${period.year}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedList));
      setActivities(updatedList);
      
      // Forcefully clear cached insights in localStorage to get fresh Gemini audits as data changes
      const insightsKey = `hedjo_insights_${organization.name}_${period.year}`;
      localStorage.removeItem(insightsKey);
    }
  };

  const handleAddActivity = async (newAct: Partial<ActivityData>) => {
    const activityId = 'act_' + Math.random().toString(36).substring(4, 9);
    const completeActivity: ActivityData = {
      ...(newAct as ActivityData),
      id: activityId,
      createdBy: user?.id || 'anonymous'
    };

    if (isD1Mode && organization && organization.id !== 'hedjo_demo_corp') {
      try {
        await addActivityToFirestore(completeActivity);
        setActivities([completeActivity, ...activities]);
      } catch (err: any) {
        console.error("Error adding activity to D1:", err);
        alert("Failed to add activity. Please try again.");
      }
    } else if (isFirebaseEnabled() && organization && organization.id !== 'hedjo_demo_corp') {
      try {
        await addActivityToFirestore(completeActivity);
        setActivities([completeActivity, ...activities]);
      } catch (err: any) {
        console.error("Error adding activity to Firestore:", err);
        let errorMsg = "Failed to add activity. Operation was rejected.";
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error.includes("permission") || parsed.error.includes("denied")) {
            errorMsg = "Security Breach Rejected: Your role is read-only (Viewer) or this reporting period status is currently locked!";
          }
        } catch (_) {}
        alert(errorMsg);
      }
    } else {
      const newList = [completeActivity, ...activities];
      saveActivitiesToStorage(newList);
    }
  };

  const handleUpdateActivity = async (actId: string, updatedFields: Partial<ActivityData>) => {
    const existingAct = activities.find(a => a.id === actId);
    if (!existingAct) return;
    const completeUpdated: ActivityData = {
      ...existingAct,
      ...updatedFields
    };

    if (isD1Mode && organization && organization.id !== 'hedjo_demo_corp') {
      try {
        await updateActivityInFirestore(completeUpdated);
        setActivities(activities.map((act) => act.id === actId ? completeUpdated : act));
      } catch (err: any) {
        console.error("Error updating activity in D1:", err);
        alert("Failed to update activity. Please try again.");
      }
    } else if (isFirebaseEnabled() && organization && organization.id !== 'hedjo_demo_corp') {
      try {
        await updateActivityInFirestore(completeUpdated);
        setActivities(activities.map((act) => act.id === actId ? completeUpdated : act));
      } catch (err: any) {
        console.error("Error updating activity in Firestore:", err);
        let errorMsg = "Failed to update activity. Operation was rejected.";
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error.includes("permission") || parsed.error.includes("denied")) {
            errorMsg = "Security Breach Rejected: Your role lacks write clearance (Viewer) or this reporting period status is currently locked!";
          }
        } catch (_) {}
        alert(errorMsg);
      }
    } else {
      const newList = activities.map((act) => {
        if (act.id === actId) {
          return { ...act, ...updatedFields };
        }
        return act;
      });
      saveActivitiesToStorage(newList);
    }
  };

  const handleDeleteActivity = async (actId: string) => {
    if (isD1Mode && organization && organization.id !== 'hedjo_demo_corp' && period) {
      try {
        await deleteActivityFromFirestore(organization.id, period.id, actId);
        setActivities(activities.filter((act) => act.id !== actId));
      } catch (err: any) {
        console.error("Error deleting activity from D1:", err);
        alert("Failed to delete activity. Please try again.");
      }
    } else if (isFirebaseEnabled() && organization && organization.id !== 'hedjo_demo_corp' && period) {
      try {
        await deleteActivityFromFirestore(organization.id, period.id, actId);
        setActivities(activities.filter((act) => act.id !== actId));
      } catch (err: any) {
        console.error("Error deleting activity from Firestore:", err);
        let errorMsg = "Failed to delete activity. Operation was rejected.";
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error.includes("permission") || parsed.error.includes("denied")) {
            errorMsg = "Security Breach Rejected: Your role lacks write permissions or this filing period is locked!";
          }
        } catch (_) {}
        alert(errorMsg);
      }
    } else {
      const newList = activities.filter((act) => act.id !== actId);
      saveActivitiesToStorage(newList);
    }
  };

  // Lock Reporting Period status to prevent drift
  const handleToggleLockPeriod = async () => {
    if (!period || !organization) return;
    const nextStatus = period.status === 'locked' ? 'draft' : 'locked';
    const updatedPeriod: ReportingPeriod = {
      ...period,
      status: nextStatus,
      lockedAt: nextStatus === 'locked' ? new Date().toISOString() : null
    };

    if (isD1Mode && organization.id !== 'hedjo_demo_corp') {
      try {
        await saveReportingPeriodToFirestore(updatedPeriod);
        setPeriod(updatedPeriod);
        localStorage.setItem('hedjo_session_period', JSON.stringify(updatedPeriod));
      } catch (err: any) {
        console.error("Error changing filing status in D1:", err);
        alert("Failed to toggle period status. Please try again.");
      }
    } else if (isFirebaseEnabled() && organization.id !== 'hedjo_demo_corp') {
      try {
        await saveReportingPeriodToFirestore(updatedPeriod);
        setPeriod(updatedPeriod);
        localStorage.setItem('hedjo_session_period', JSON.stringify(updatedPeriod));
      } catch (err: any) {
        console.error("Error changing filing status in Firestore:", err);
        let errorMsg = "Action Denied: You do not have permissions to toggle locked/draft configurations!";
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error.includes("permission") || parsed.error.includes("denied")) {
            errorMsg = "Security Access Denied: Only administrators are authorized to toggle filing periods between draft and locked status.";
          }
        } catch (_) {}
        alert(errorMsg);
      }
    } else {
      setPeriod(updatedPeriod);
      localStorage.setItem('hedjo_session_period', JSON.stringify(updatedPeriod));
    }
  };

  // Render routing based on onboarding and sessions
  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (!organization || !period) {
    return (
      <OnboardingWizard 
        userId={user.id} 
        onOnboardingComplete={handleOnboardingComplete}
        onBackToLogin={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans" id="hedjo-app-layout">
      
      {/* Sidebar Rail navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 text-slate-200 transform md:translate-x-0 transition-transform duration-250 ease-out flex flex-col justify-between ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} id="dashboard-layout-nav">
        
        <div className="flex flex-col gap-6">
          {/* Brand header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/20">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-800 text-white p-1.5 rounded-xl shadow-lg">
                <Leaf className="w-4 h-4 text-emerald-305" />
              </div>
              <span className="font-sans text-lg font-black text-white tracking-tight">Hedjo</span>
            </div>

            {/* Mobile close menu trigger */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-450 hover:text-white p-1"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Connected Org Display */}
          <div className="px-6 pb-2">
            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl flex items-start gap-3">
              <Building2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate max-w-[150px]">{organization.name}</span>
                <span className="text-[10px] text-slate-500 truncate mt-0.5">{organization.industry}</span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1 px-4">
            <span className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Climate Management</span>
            
            <button
              onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-900/40 text-emerald-3D0 hover:bg-emerald-900/50 text-emerald-300 font-bold border-l-4 border-emerald-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <BarChart3 className="w-4.5 h-4.5" /> Emissions Summary
            </button>

            <button
              onClick={() => { setActiveTab('activities'); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'activities'
                  ? 'bg-emerald-900/40 text-emerald-3D0 hover:bg-emerald-900/50 text-emerald-300 font-bold border-l-4 border-emerald-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Database className="w-4.5 h-4.5" /> Carbon Activities Ledger
            </button>

            <button
              onClick={() => { setActiveTab('factors'); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'factors'
                  ? 'bg-emerald-900/40 text-emerald-3D0 hover:bg-emerald-900/50 text-emerald-300 font-bold border-l-4 border-emerald-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Globe2 className="w-4.5 h-4.5" /> Emission Factors Index
            </button>

            <button
              onClick={() => { setActiveTab('insights'); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'insights'
                  ? 'bg-emerald-900/40 text-emerald-3D0 hover:bg-emerald-900/50 text-emerald-300 font-bold border-l-4 border-emerald-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Cpu className="w-4.5 h-4.5" /> Gemini Climate Audit
            </button>
          </nav>
        </div>

        {/* User profile segment */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <span className="truncate max-w-[130px] font-mono">{user.email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-350 text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </aside>

      {/* Primary Frame Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        
        {/* Main top context header */}
        <header className="h-16 border-b border-slate-200 bg-white/70 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30" id="dashboard-header-rail">
          <div className="flex items-center gap-4">
            {/* Mobile burger toggle */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-1 bg-slate-50 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Reporting period status metrics */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                FY {period.year} Filing
              </span>
              <button 
                onClick={handleToggleLockPeriod}
                className={`py-1 px-3 text-[10px] uppercase font-bold tracking-wider border rounded-full transition-colors flex items-center gap-1 cursor-pointer select-none ${
                  period.status === 'locked'
                    ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100/50'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/50'
                }`}
                title={period.status === 'locked' ? 'Reporting locked. Click to modify draft.' : 'Drafting active. Click to lock period.'}
              >
                {period.status === 'locked' ? (
                  <>
                    <Lock className="w-3 h-3 text-red-650" /> Locked Period
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3 text-emerald-700" /> Active Draft
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 bg-emerald-555 bg-emerald-550 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-slate-400 font-mono text-[10px]">LOCAL REGISTRY SANDBOX ACTIVE</span>
          </div>
        </header>

        {/* Dynamic page contents */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView 
              organization={organization}
              year={period.year}
              activities={activities}
              onTabChange={setActiveTab}
              onAskGemini={() => setActiveTab('insights')}
              onUpdateOrganization={handleUpdateOrganization}
            />
          )}

          {activeTab === 'activities' && (
            <DataEntryView 
              activities={activities}
              onAddActivity={handleAddActivity}
              onUpdateActivity={handleUpdateActivity}
              onDeleteActivity={handleDeleteActivity}
              orgId={organization.id}
              reportingPeriodId={period.id}
            />
          )}

          {activeTab === 'factors' && (
            <FactorsView />
          )}

          {activeTab === 'insights' && (
            <InsightsView 
              orgId={organization.id}
              reportingPeriodId={period.id}
              orgName={organization.name}
              country={organization.country}
              industry={organization.industry}
              year={period.year}
              activities={activities}
            />
          )}
        </main>
      </div>

    </div>
  );
}
