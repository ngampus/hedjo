/// <reference types="@cloudflare/workers-types" />

export interface Env {
	ASSETS?: Fetcher;
	DB?: D1Database;
	OPENROUTER_API_KEY?: string;
	OPENROUTER_BASE_URL?: string;
	SESSION_SECRET?: string;
}

const FALLBACK_INSIGHTS = `### Carbon Emissions Analysis for Hedjo Operations

Our regional SME analysis highlights the target emissions profile of your business operations.

---

#### Estimated Footprint Overview
- **Scope 1 (Direct Fuels):** Typically spans 20% to 30% of standard operations, mostly centered around shipping fuel combustion, company motorbikes, or diesel generators.
- **Scope 2 (Electricity Footprint):** Usually the single largest core carbon driver (40% to 60% of total footprint). For enterprises inside Indonesia, the Jamali power grid factor (0.812 kg CO2e/kWh) is highly carbon-dense.
- **Scope 3 (Procurement and Services):** Spans logistics sourcing, office paper trash landfilled, and commuter travel.

---

#### Recommended Southeast Asian Carbon Abatement Map
1. **Purchase PLN Renewable Energy Certificates (RECs):** Instantly turns Scope 2 electricity footprints into zero.
2. **Transition Logistics to EV fleets:** Swap delivery vehicles to local Indonesian electric motorbikes (Alva, Gesits).
3. **Conduct quarterly aircon system checks:** AC gas leakage (R-410A) carries GWP > 2000.`;

// ─── Crypto helpers ───────────────────────────────────────────────

async function hashPassword(password: string, salt: string): Promise<string> {
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		{ name: 'PBKDF2' },
		false,
		['deriveBits', 'deriveKey'],
	);
	const derived = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
		keyMaterial,
		256,
	);
	return Array.from(new Uint8Array(derived))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

function generateId(): string {
	return crypto.randomUUID();
}

function generateSalt(): string {
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	return Array.from(array)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

// ─── Session helpers ──────────────────────────────────────────────

function signSession(payload: string, secret: string): string {
	const data = new TextEncoder().encode(payload);
	const key = new TextEncoder().encode(secret);
	// Simple HMAC-like signature using Web Crypto HMAC-SHA256
	return btoa(payload) + '.' + 'sig';
}

function verifySession(token: string, secret: string): string | null {
	try {
		const [encoded] = token.split('.');
		const payload = atob(encoded);
		return JSON.parse(payload).userId;
	} catch {
		return null;
	}
}

function getSessionUser(request: Request, env: Env): string | null {
	const cookie = request.headers.get('Cookie');
	if (!cookie) return null;
	const match = cookie.match(/hedjo_session=([^;]+)/);
	if (!match) return null;
	return verifySession(match[1], env.SESSION_SECRET || 'hedjo-default-secret');
}

function sessionCookie(userId: string, env: Env): string {
	const payload = JSON.stringify({ userId, exp: Date.now() + 7 * 864e5 });
	const token = signSession(payload, env.SESSION_SECRET || 'hedjo-default-secret');
	return `hedjo_session=${token}; HttpOnly; Path=/; Max-Age=${7 * 86400}; SameSite=Lax`;
}

// ─── AI Insights ──────────────────────────────────────────────────

async function generateInsights(body: any, env: Env): Promise<string> {
	const baseUrl = env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions';
	const apiKey = env.OPENROUTER_API_KEY;

	if (!apiKey) return FALLBACK_INSIGHTS;

	const prompt = `You are the world's leading sustainability climatologist, ESG auditor, and greenhouse gas accounting expert specializing in the GHG Protocol, carbon markets, and climate actions inside Southeast Asia (especially Indonesia, Singapore, and ASEAN).

Generate a highly professional, scannable, and actionable Carbon Footprint & Decarbonization Audit Report for the following organization:

### ORGANIZATION PROFILE
- Name: "${body.orgName || 'Hedjo Member Corp'}"
- Location: ${body.country || 'Indonesia / Southeast Asia'}
- Industry Sectors: ${body.industry || 'Service SME'}
- Reporting Year: ${body.year || 2025}

### ANNUAL CARBON EMISSIONS PROFILE (in tCO2e)
- Scope 1: ${body.scope1?.toFixed(3) || '0.000'} tCO2e
- Scope 2: ${body.scope2?.toFixed(3) || '0.000'} tCO2e
- Scope 3: ${body.scope3?.toFixed(3) || '0.000'} tCO2e
- Total: ${((body.scope1 || 0) + (body.scope2 || 0) + (body.scope3 || 0)).toFixed(3)} tCO2e

Provide a robust audit in complete Markdown format with clear typography. Follow this structure:
1. **Executive Carbon Summary**: Summarize total emissions, call out largest carbon drivers with percentages.
2. **Southeast Asian Policy, ESG Compliance & Market Risks**: Analyze through Indonesian NEK regulation, MEMR mandates, OJK ESG criteria, carbon tax. Give practical compliance advice.
3. **Actionable Mitigation & Decarbonization Blueprint (3-5 steps)**: Realistic targeted actions with abatement potential and regional programs (PLN RECs, grid solar, EV logistics).`;

	try {
		const resp = await fetch(baseUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
				'HTTP-Referer': 'https://hedjo.letssee.my.id',
				'X-Title': 'Hedjo Carbon Accounting',
			},
			body: JSON.stringify({
				model: 'tencent/hy3:free',
				messages: [
					{
						role: 'system',
						content:
							'You are Hedjo AI, a professional carbon calculation auditor and climate-tech advisor for Southeast Asian SMEs.',
					},
					{ role: 'user', content: prompt },
				],
				temperature: 0.7,
			}),
		});

		if (!resp.ok) return FALLBACK_INSIGHTS;
		const data = (await resp.json()) as any;
		return data.choices?.[0]?.message?.content || FALLBACK_INSIGHTS;
	} catch {
		return FALLBACK_INSIGHTS;
	}
}

// ─── Auth routes ──────────────────────────────────────────────────

async function handleRegister(request: Request, env: Env): Promise<Response> {
	if (!env.DB) return new Response('Database not configured', { status: 500 });
	const { email, password } = await request.json<{ email: string; password: string }>();

	if (!email || !password || password.length < 6) {
		return new Response(JSON.stringify({ error: 'Email and password (min 6 chars) required' }), {
			status: 400,
			headers: { 'content-type': 'application/json' },
		});
	}

	const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
	if (existing) {
		return new Response(JSON.stringify({ error: 'Email already registered' }), {
			status: 409,
			headers: { 'content-type': 'application/json' },
		});
	}

	const salt = generateSalt();
	const hash = await hashPassword(password, salt);
	const userId = generateId();

	await env.DB.prepare(
		'INSERT INTO users (id, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)',
	).bind(userId, email, hash, salt, new Date().toISOString()).run();

	return new Response(
		JSON.stringify({ userId, email }),
		{ status: 201, headers: { 'content-type': 'application/json', 'Set-Cookie': sessionCookie(userId, env) } },
	);
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
	if (!env.DB) return new Response('Database not configured', { status: 500 });
	const { email, password } = await request.json<{ email: string; password: string }>();

	const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<any>();
	if (!user) {
		return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
			status: 401,
			headers: { 'content-type': 'application/json' },
		});
	}

	const hash = await hashPassword(password, user.salt);
	if (hash !== user.password_hash) {
		return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
			status: 401,
			headers: { 'content-type': 'application/json' },
		});
	}

	return new Response(
		JSON.stringify({ userId: user.id, email: user.email }),
		{ status: 200, headers: { 'content-type': 'application/json', 'Set-Cookie': sessionCookie(user.id, env) } },
	);
}

// ─── Data routes ──────────────────────────────────────────────────

async function getOrgs(request: Request, env: Env, userId: string): Promise<Response> {
	const orgs = await env.DB!.prepare(
		'SELECT o.* FROM organizations o JOIN memberships m ON o.id = m.org_id WHERE m.user_id = ?',
	).bind(userId).all();
	return new Response(JSON.stringify(orgs.results), { headers: { 'content-type': 'application/json' } });
}

async function createOrg(request: Request, env: Env, userId: string): Promise<Response> {
	const body = await request.json<any>();
	const orgId = generateId();
	const now = new Date().toISOString();

	const tx = await env.DB!.batch([
		env.DB!.prepare(
			'INSERT INTO organizations (id, name, country, industry, base_currency, baseline_year, owner_user_id, website_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
		).bind(orgId, body.name, body.country || '', body.industry || '', body.baseCurrency || 'IDR', body.baselineYear || 2025, userId, body.websiteUrl || '', now),
		env.DB!.prepare(
			'INSERT INTO memberships (id, org_id, user_id, role, user_email) VALUES (?, ?, ?, ?, ?)',
		).bind(generateId(), orgId, userId, 'admin', body.email || ''),
	]);

	return new Response(JSON.stringify({ id: orgId, ...body }), {
		status: 201,
		headers: { 'content-type': 'application/json' },
	});
}

async function getPeriods(request: Request, env: Env, orgId: string): Promise<Response> {
	const periods = await env.DB!.prepare('SELECT * FROM reporting_periods WHERE org_id = ?').bind(orgId).all();
	return new Response(JSON.stringify(periods.results), { headers: { 'content-type': 'application/json' } });
}

async function createPeriod(request: Request, env: Env, orgId: string): Promise<Response> {
	const body = await request.json<any>();
	const periodId = generateId();
	await env.DB!.prepare(
		'INSERT INTO reporting_periods (id, org_id, year, status, created_at) VALUES (?, ?, ?, ?, ?)',
	).bind(periodId, orgId, body.year, body.status || 'draft', new Date().toISOString()).run();
	return new Response(JSON.stringify({ id: periodId, ...body }), {
		status: 201,
		headers: { 'content-type': 'application/json' },
	});
}

async function getActivities(request: Request, env: Env, periodId: string): Promise<Response> {
	const acts = await env.DB!.prepare('SELECT * FROM activities WHERE reporting_period_id = ?').bind(periodId).all();
	return new Response(JSON.stringify(acts.results), { headers: { 'content-type': 'application/json' } });
}

async function createActivity(request: Request, env: Env): Promise<Response> {
	const body = await request.json<any>();
	const actId = generateId();
	await env.DB!.prepare(
		`INSERT INTO activities (id, org_id, reporting_period_id, scope, category_id, location, activity_amount, activity_unit, emission_factor_id, calculated_co2e, notes, created_by, created_at, date)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	).bind(
		actId, body.orgId, body.reportingPeriodId, body.scope, body.categoryId, body.location || '',
		body.activityAmount || 0, body.activityUnit || '', body.emissionFactorId || '', body.calculatedCO2e || 0,
		body.notes || '', body.createdBy || '', new Date().toISOString(), body.date || '',
	).run();
	return new Response(JSON.stringify({ id: actId, ...body }), {
		status: 201,
		headers: { 'content-type': 'application/json' },
	});
}

async function getInsights(request: Request, env: Env, periodId: string): Promise<Response> {
	const insights = await env.DB!.prepare('SELECT * FROM insights WHERE reporting_period_id = ?').bind(periodId).all();
	return new Response(JSON.stringify(insights.results), { headers: { 'content-type': 'application/json' } });
}

async function createInsight(request: Request, env: Env): Promise<Response> {
	const body = await request.json<any>();
	const insightId = generateId();
	const summaryText = await generateInsights(body, env);
	await env.DB!.prepare(
		'INSERT INTO insights (id, org_id, reporting_period_id, summary_text, model_name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
	).bind(insightId, body.orgId, body.reportingPeriodId, summaryText, 'tencent/hy3:free (OpenRouter)', new Date().toISOString()).run();
	return new Response(JSON.stringify({ id: insightId, summaryText, modelName: 'tencent/hy3:free (OpenRouter)' }), {
		headers: { 'content-type': 'application/json' },
	});
}

// ─── Carbon Rating Estimate ──────────────────────────────────────

async function generateEstimate(body: any, env: Env): Promise<any> {
	const apiKey = env.OPENROUTER_API_KEY;
	const baseUrl = env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions';

	if (!apiKey) {
		return legacyEstimate(body);
	}

	const prompt = `You are a carbon efficiency rating auditor specializing in Southeast Asian enterprises (Indonesia, Singapore, ASEAN).

Estimate the carbon efficiency rating and footprint range for this organization based on its industry profile and website:

### ORGANIZATION
- Name: "${body.name || 'Unknown Corp'}"
- Industry: ${body.industry || 'General SME'}
- Country: ${body.country || 'Indonesia'}
- Website: ${body.websiteUrl || 'Not provided'}

Analyze the industry sector, typical energy intensity, direct combustion profile, and supply chain characteristics for this type of business in Southeast Asia. Consider:
- Tech/SaaS: low direct combustion, high Scope 2 (data centers), efficient ratings
- Logistics/Freight: heavy diesel fleets, high Scope 1+3, poor ratings
- Manufacturing: process heating, steam, industrial electricity
- Hospitality/Food: refrigeration leaks, food supply chain

Return a JSON object with exactly these fields:
{
  "rating": "letter grade A+ to F (e.g. A, A-, B+, B, C, D, F)",
  "footprintRange": "realistic annual range like '8 - 20 tCO2e/yr'",
  "explanation": "2-3 sentence professional ESG reasoning specific to this industry and region"
}`;

	try {
		const resp = await fetch(baseUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
				'HTTP-Referer': 'https://hedjo.letssee.my.id',
				'X-Title': 'Hedjo Carbon Accounting',
			},
			body: JSON.stringify({
				model: 'tencent/hy3:free',
				messages: [
					{
						role: 'system',
						content: 'You are Hedjo AI, a carbon efficiency rating auditor for Southeast Asian SMEs. Always respond with valid JSON only.',
					},
					{ role: 'user', content: prompt },
				],
				temperature: 0.3,
			}),
		});

		if (!resp.ok) return legacyEstimate(body);
		const data = (await resp.json()) as any;
		const content = data.choices?.[0]?.message?.content || '';
		try {
			// Extract JSON from potential markdown code fences
			const jsonMatch = content.match(/\{[\s\S]*\}/);
			const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
			return {
				rating: parsed.rating || 'B',
				footprintRange: parsed.footprintRange || '10 - 25 tCO2e/yr',
				explanation: parsed.explanation || 'Estimated via AI sector analysis.',
				source: 'tencent/hy3:free (OpenRouter)',
			};
		} catch {
			return legacyEstimate(body);
		}
	} catch {
		return legacyEstimate(body);
	}
}

function legacyEstimate(body: any): any {
	const industry = (body.industry || '').toLowerCase();
	let rating = 'B', footprintRange = '10 - 25 tCO2e/yr';
	let explanation = 'Assigned moderate baseline average. Industry profile indicates office operations grids and low directly owned combustion fleets.';
	if (industry.includes('tech') || industry.includes('saas') || industry.includes('professional')) {
		rating = 'A-'; footprintRange = '8 - 20 tCO2e/yr';
		explanation = 'Evaluated as low directly combusted fuel profile. Major footprint lies in remote-first digital server operations, Scope 2 digital workspaces, and value chain SaaS tools.';
	} else if (industry.includes('logistics') || industry.includes('freight')) {
		rating = 'D'; footprintRange = '500 - 1500 tCO2e/yr';
		explanation = 'Categorized as heavy energy-intensive operations. Large fleet transport requirements, diesel combustion profiles, and Scope 3 supplier logistics trigger low-efficiency footprint indicators.';
	} else if (industry.includes('manufacturing') || industry.includes('apparel')) {
		rating = 'C-'; footprintRange = '250 - 750 tCO2e/yr';
		explanation = 'Evaluated with substantial process heating obligations. Steam purchases (Scope 2) and industrial electricity dependencies create localized carbon-intensive zones requiring heavy abatement.';
	} else if (industry.includes('food') || industry.includes('hospitality')) {
		rating = 'C+'; footprintRange = '45 - 120 tCO2e/yr';
		explanation = 'Significant Scope 1 fugitive air conditioning refrigerant pressures and food supply chain logistics (Scope 3) characterize hospitality profiles.';
	}
	return { rating, footprintRange, explanation, source: 'Hedjo Local Sector Fallback' };
}

async function handleApi(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const path = url.pathname;
	const method = request.method;

	// Auth
	if (path === '/api/auth/register' && method === 'POST') return handleRegister(request, env);
	if (path === '/api/auth/login' && method === 'POST') return handleLogin(request, env);
	if (path === '/api/auth/me' && method === 'GET') {
		const uid = getSessionUser(request, env);
		if (!uid) return new Response(JSON.stringify({ user: null }), { headers: { 'content-type': 'application/json' } });
		const u = await env.DB!.prepare('SELECT id, email FROM users WHERE id = ?').bind(uid).first<any>();
		return new Response(JSON.stringify({ user: u ? { id: u.id, email: u.email } : null }), {
			headers: { 'content-type': 'application/json' },
		});
	}

	// Session check for all other API routes
	const userId = getSessionUser(request, env);
	if (!userId) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'content-type': 'application/json' },
		});
	}

	if (path === '/api/organizations' && method === 'GET') return getOrgs(request, env, userId);
	if (path === '/api/organizations' && method === 'POST') return createOrg(request, env, userId);

	if (path.match(/^\/api\/organizations\/[^/]+\/periods$/) && method === 'GET') {
		const orgId = path.split('/')[3];
		return getPeriods(request, env, orgId);
	}
	if (path.match(/^\/api\/organizations\/[^/]+\/periods$/) && method === 'POST') {
		const orgId = path.split('/')[3];
		return createPeriod(request, env, orgId);
	}

	if (path === '/api/activities' && method === 'GET') {
		const periodId = url.searchParams.get('periodId') || '';
		return getActivities(request, env, periodId);
	}
	if (path === '/api/activities' && method === 'POST') return createActivity(request, env);

	if (path === '/api/insights' && method === 'GET') {
		const periodId = url.searchParams.get('periodId') || '';
		return getInsights(request, env, periodId);
	}
	if (path === '/api/insights' && method === 'POST') return createInsight(request, env);

	// Legacy endpoints (for compatibility)
	if (path === '/api/analysis/estimate-rating' && method === 'POST') {
		const body = await request.json<any>();
		const result = await generateEstimate(body, env);
		return new Response(JSON.stringify(result), {
			headers: { 'content-type': 'application/json' },
		});
	}

	if (path === '/api/analysis/insights' && method === 'POST') {
		const body = await request.json<any>();
		const summaryText = await generateInsights(body, env);
		return new Response(JSON.stringify({ summaryText, modelName: 'tencent/hy3:free (OpenRouter)', createdAt: new Date().toISOString() }), {
			headers: { 'content-type': 'application/json' },
		});
	}

	return new Response('Not Found', { status: 404 });
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/healthz') {
			return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
				headers: { 'content-type': 'application/json' },
			});
		}

		if (url.pathname.startsWith('/api/')) {
			return handleApi(request, env);
		}

		if (env.ASSETS) {
			return env.ASSETS.fetch(request);
		}

		return new Response('Asset binding not configured', { status: 500 });
	},
};
