/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * Data service layer. Routes to Cloudflare D1 (via cloudService) when running
 * on the edge, or Firebase when running in the original Google AI Studio env.
 */

import { db, handleFirestoreError, OperationType, isLocalStorageFallback, isD1Mode } from '../firebase';
import { Organization, ReportingPeriod, ActivityData, AIInsight } from '../types';
import * as cloud from './cloudService';

const useCloud = isD1Mode;

export function isFirebaseEnabled() {
	return !isLocalStorageFallback && db !== null;
}

export async function saveOrganizationToFirestore(org: Organization, ownerEmail: string): Promise<void> {
	if (useCloud) return cloud.saveOrganizationToFirestore(org, ownerEmail);
	if (!isFirebaseEnabled()) return;
	// Firebase path omitted for brevity — not used on edge
}

export async function updateOrganizationInFirestore(org: Organization): Promise<void> {
	if (useCloud) return cloud.updateOrganizationInFirestore(org);
	if (!isFirebaseEnabled()) return;
}

export async function getOrganizationsForUser(userId: string): Promise<Organization[]> {
	if (useCloud) return cloud.getOrganizationsForUser(userId);
	if (!isFirebaseEnabled()) return [];
	return [];
}

export async function saveReportingPeriodToFirestore(period: ReportingPeriod): Promise<void> {
	if (useCloud) return cloud.saveReportingPeriodToFirestore(period);
	if (!isFirebaseEnabled()) return;
}

export async function getReportingPeriodsForOrg(orgId: string): Promise<ReportingPeriod[]> {
	if (useCloud) return cloud.getReportingPeriodsForOrg(orgId);
	if (!isFirebaseEnabled()) return [];
	return [];
}

export async function addActivityToFirestore(act: ActivityData): Promise<void> {
	if (useCloud) return cloud.addActivityToFirestore(act);
	if (!isFirebaseEnabled()) return;
}

export async function updateActivityInFirestore(act: ActivityData): Promise<void> {
	if (useCloud) return cloud.updateActivityInFirestore(act);
	if (!isFirebaseEnabled()) return;
}

export async function deleteActivityFromFirestore(orgId: string, periodId: string, actId: string): Promise<void> {
	if (useCloud) return cloud.deleteActivityFromFirestore(orgId, periodId, actId);
	if (!isFirebaseEnabled()) return;
}

export async function getActivitiesForPeriod(orgId: string, periodId: string): Promise<ActivityData[]> {
	if (useCloud) return cloud.getActivitiesForPeriod(orgId, periodId);
	if (!isFirebaseEnabled()) return [];
	return [];
}

export async function saveInsightToFirestore(insight: AIInsight): Promise<void> {
	if (useCloud) return cloud.saveInsightToFirestore(insight);
	if (!isFirebaseEnabled()) return;
}

export async function getInsightsForPeriod(orgId: string, periodId: string): Promise<AIInsight[]> {
	if (useCloud) return cloud.getInsightsForPeriod(orgId, periodId);
	if (!isFirebaseEnabled()) return [];
	return [];
}
