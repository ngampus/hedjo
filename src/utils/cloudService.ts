/**
 * Cloud service layer — talks to the Cloudflare Worker API (D1 backend).
 * Mirrors the firebaseService.ts interface so App.tsx can switch seamlessly.
 */

import { Organization, ReportingPeriod, ActivityData, AIInsight } from '../types';

const API_BASE = '';

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
	const resp = await fetch(`${API_BASE}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
		credentials: 'same-origin',
	});
	if (!resp.ok) {
		const err = await resp.json().catch(() => ({ error: resp.statusText }));
		throw new Error(err.error || `API error: ${resp.status}`);
	}
	return resp;
}

export function isD1Enabled(): boolean {
	return true;
}

export async function saveOrganizationToFirestore(org: Organization, ownerEmail: string): Promise<void> {
	await apiFetch('/api/organizations', {
		method: 'POST',
		body: JSON.stringify({ ...org, email: ownerEmail }),
	});
}

export async function updateOrganizationInFirestore(org: Organization): Promise<void> {
	// For D1, org updates go through the same endpoint (upsert by id handled server-side)
	await apiFetch('/api/organizations', {
		method: 'POST',
		body: JSON.stringify(org),
	});
}

export async function getOrganizationsForUser(_userId: string): Promise<Organization[]> {
	const resp = await apiFetch('/api/organizations');
	return resp.json();
}

export async function saveReportingPeriodToFirestore(period: ReportingPeriod): Promise<void> {
	await apiFetch(`/api/organizations/${period.orgId}/periods`, {
		method: 'POST',
		body: JSON.stringify(period),
	});
}

export async function getReportingPeriodsForOrg(orgId: string): Promise<ReportingPeriod[]> {
	const resp = await apiFetch(`/api/organizations/${orgId}/periods`);
	return resp.json();
}

export async function addActivityToFirestore(act: ActivityData): Promise<void> {
	await apiFetch('/api/activities', {
		method: 'POST',
		body: JSON.stringify(act),
	});
}

export async function updateActivityInFirestore(act: ActivityData): Promise<void> {
	await apiFetch('/api/activities', {
		method: 'POST',
		body: JSON.stringify(act),
	});
}

export async function deleteActivityFromFirestore(orgId: string, periodId: string, actId: string): Promise<void> {
	await apiFetch(`/api/activities/${actId}`, { method: 'DELETE' });
}

export async function getActivitiesForPeriod(orgId: string, periodId: string): Promise<ActivityData[]> {
	const resp = await apiFetch(`/api/activities?periodId=${periodId}`);
	return resp.json();
}

export async function saveInsightToFirestore(insight: AIInsight): Promise<void> {
	await apiFetch('/api/insights', {
		method: 'POST',
		body: JSON.stringify(insight),
	});
}

export async function getInsightsForPeriod(orgId: string, periodId: string): Promise<AIInsight[]> {
	const resp = await apiFetch(`/api/insights?periodId=${periodId}`);
	return resp.json();
}

// ─── Auth helpers ─────────────────────────────────────────────────

export async function d1Register(email: string, password: string): Promise<{ userId: string; email: string }> {
	const resp = await apiFetch('/api/auth/register', {
		method: 'POST',
		body: JSON.stringify({ email, password }),
	});
	return resp.json();
}

export async function d1Login(email: string, password: string): Promise<{ userId: string; email: string }> {
	const resp = await apiFetch('/api/auth/login', {
		method: 'POST',
		body: JSON.stringify({ email, password }),
	});
	return resp.json();
}
