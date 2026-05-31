/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch, 
  query, 
  where 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, isLocalStorageFallback } from '../firebase';
import { Organization, ReportingPeriod, ActivityData, AIInsight } from '../types';

// Guard check helper to ensure Firestore is actively initialized and not falls back to dry-run localStorage
export function isFirebaseEnabled() {
  return !isLocalStorageFallback && db !== null;
}

/**
 * Strips all `undefined` fields recursively so Firestore doesn't reject them
 */
function sanitizeForFirestore<T extends object>(obj: T): T {
  const result = { ...obj } as any;
  for (const key of Object.keys(result)) {
    if (result[key] === undefined) {
      delete result[key];
    } else if (result[key] !== null && typeof result[key] === 'object' && !result[key].toDate && !(result[key] instanceof Date)) {
      result[key] = sanitizeForFirestore(result[key]);
    }
  }
  return result;
}

/**
 * Persists a new Organization and binds its administrative owner atomically in a single relational batch write
 */
export async function saveOrganizationToFirestore(org: Organization, ownerEmail: string): Promise<void> {
  if (!isFirebaseEnabled()) return;
  const pathOrg = `organizations/${org.id}`;
  try {
    const batch = writeBatch(db);
    
    // Set Parent Tenant Organization Profile
    const orgRef = doc(db, 'organizations', org.id);
    batch.set(orgRef, sanitizeForFirestore(org));
    
    // Set Child Membership map atomically to satisfy existsAfter() security constraints
    const membershipRef = doc(db, 'organizations', org.id, 'memberships', org.ownerUserId);
    batch.set(membershipRef, sanitizeForFirestore({
      id: org.ownerUserId,
      orgId: org.id,
      userId: org.ownerUserId,
      role: 'admin',
      userEmail: ownerEmail
    }));
    
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathOrg);
  }
}

/**
 * Saves or updates an Organization profile metadata
 */
export async function updateOrganizationInFirestore(org: Organization): Promise<void> {
  if (!isFirebaseEnabled()) return;
  const path = `organizations/${org.id}`;
  try {
    await setDoc(doc(db, 'organizations', org.id), sanitizeForFirestore(org));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Loads organizations where the user is listed as the root executive owner
 */
export async function getOrganizationsForUser(userId: string): Promise<Organization[]> {
  if (!isFirebaseEnabled()) return [];
  const path = 'organizations';
  try {
    const q = query(collection(db, 'organizations'), where('ownerUserId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as Organization);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Sets up a new temporal carbon reporting FY filing period
 */
export async function saveReportingPeriodToFirestore(period: ReportingPeriod): Promise<void> {
  if (!isFirebaseEnabled()) return;
  const path = `organizations/${period.orgId}/reportingPeriods/${period.id}`;
  try {
    await setDoc(doc(db, 'organizations', period.orgId, 'reportingPeriods', period.id), sanitizeForFirestore(period));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Loads filing periods linked to the selected company profile
 */
export async function getReportingPeriodsForOrg(orgId: string): Promise<ReportingPeriod[]> {
  if (!isFirebaseEnabled()) return [];
  const path = `organizations/${orgId}/reportingPeriods`;
  try {
    const snapshot = await getDocs(collection(db, 'organizations', orgId, 'reportingPeriods'));
    return snapshot.docs.map(d => d.data() as ReportingPeriod);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Logs a standard greenhouse gas activity input under a temporal filing period
 */
export async function addActivityToFirestore(act: ActivityData): Promise<void> {
  if (!isFirebaseEnabled()) return;
  const path = `organizations/${act.orgId}/reportingPeriods/${act.reportingPeriodId}/activities/${act.id}`;
  try {
    await setDoc(doc(db, 'organizations', act.orgId, 'reportingPeriods', act.reportingPeriodId, 'activities', act.id), sanitizeForFirestore(act));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Updates a carbon activity input metrics
 */
export async function updateActivityInFirestore(act: ActivityData): Promise<void> {
  if (!isFirebaseEnabled()) return;
  const path = `organizations/${act.orgId}/reportingPeriods/${act.reportingPeriodId}/activities/${act.id}`;
  try {
    await setDoc(doc(db, 'organizations', act.orgId, 'reportingPeriods', act.reportingPeriodId, 'activities', act.id), sanitizeForFirestore(act));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes activity input from transaction logs
 */
export async function deleteActivityFromFirestore(orgId: string, periodId: string, actId: string): Promise<void> {
  if (!isFirebaseEnabled()) return;
  const path = `organizations/${orgId}/reportingPeriods/${periodId}/activities/${actId}`;
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'reportingPeriods', periodId, 'activities', actId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Fetches all locked and draft activities registered for the filing year
 */
export async function getActivitiesForPeriod(orgId: string, periodId: string): Promise<ActivityData[]> {
  if (!isFirebaseEnabled()) return [];
  const path = `organizations/${orgId}/reportingPeriods/${periodId}/activities`;
  try {
    const snapshot = await getDocs(collection(db, 'organizations', orgId, 'reportingPeriods', periodId, 'activities'));
    return snapshot.docs.map(d => d.data() as ActivityData);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Saves ESG analytics compiled by Gemini
 */
export async function saveInsightToFirestore(insight: AIInsight): Promise<void> {
  if (!isFirebaseEnabled()) return;
  const path = `organizations/${insight.orgId}/reportingPeriods/${insight.reportingPeriodId}/insights/${insight.id}`;
  try {
    await setDoc(doc(db, 'organizations', insight.orgId, 'reportingPeriods', insight.reportingPeriodId, 'insights', insight.id), sanitizeForFirestore(insight));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Loads cached climate audits to reduce Gemini API budget spends
 */
export async function getInsightsForPeriod(orgId: string, periodId: string): Promise<AIInsight[]> {
  if (!isFirebaseEnabled()) return [];
  const path = `organizations/${orgId}/reportingPeriods/${periodId}/insights`;
  try {
    const snapshot = await getDocs(collection(db, 'organizations', orgId, 'reportingPeriods', periodId, 'insights'));
    return snapshot.docs.map(d => d.data() as AIInsight);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
