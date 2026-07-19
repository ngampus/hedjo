/// <reference types="@cloudflare/workers-types" />

export interface Env {
	ASSETS?: Fetcher;
	OPENROUTER_API_KEY?: string;
	OPENROUTER_BASE_URL?: string;
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

async function generateInsights(body: any, env: Env): Promise<string> {
	const baseUrl = env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions';
	const apiKey = env.OPENROUTER_API_KEY;

	if (!apiKey) {
		return FALLBACK_INSIGHTS;
	}

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

		if (!resp.ok) {
			const errText = await resp.text();
			console.warn(`OpenRouter API error: ${resp.status} ${errText}`);
			return FALLBACK_INSIGHTS;
		}

		const data = (await resp.json()) as any;
		return data.choices?.[0]?.message?.content || FALLBACK_INSIGHTS;
	} catch (err) {
		console.warn('OpenRouter API call failed:', err instanceof Error ? err.message : String(err));
		return FALLBACK_INSIGHTS;
	}
}

async function handleApi(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);

	if (url.pathname === '/api/analysis/estimate-rating') {
		const body = await request.json().catch(() => ({}));
		const industry = (body.industry || '').toLowerCase();

		let rating = 'B';
		let footprintRange = '10 - 25 tCO2e/yr';
		let explanation =
			'Assigned moderate baseline average. Industry profile indicates office operations grids and low directly owned combustion fleets.';

		if (industry.includes('tech') || industry.includes('saas') || industry.includes('professional')) {
			rating = 'A-';
			footprintRange = '8 - 20 tCO2e/yr';
			explanation =
				'Evaluated as low directly combusted fuel profile. Major footprint lies in remote-first digital server operations, Scope 2 digital workspaces, and value chain SaaS tools.';
		} else if (industry.includes('logistics') || industry.includes('freight')) {
			rating = 'D';
			footprintRange = '500 - 1500 tCO2e/yr';
			explanation =
				'Categorized as heavy energy-intensive operations. Large fleet transport requirements, diesel combustion profiles, and Scope 3 supplier logistics trigger low-efficiency footprint indicators.';
		} else if (industry.includes('manufacturing') || industry.includes('apparel')) {
			rating = 'C-';
			footprintRange = '250 - 750 tCO2e/yr';
			explanation =
				'Evaluated with substantial process heating obligations. Steam purchases (Scope 2) and industrial electricity dependencies create localized carbon-intensive zones requiring heavy abatement.';
		} else if (industry.includes('hospitality') || industry.includes('food')) {
			rating = 'C+';
			footprintRange = '45 - 120 tCO2e/yr';
			explanation =
				'Significant Scope 1 fugitive air conditioning refrigerant pressures and food supply chain logistics (Scope 3) characterize hospitality profiles.';
		}

		return new Response(
			JSON.stringify({
				rating,
				footprintRange,
				explanation,
				source: 'Hedjo Edge Sector Analysis (Cloudflare Workers)',
			}),
			{ headers: { 'content-type': 'application/json' } },
		);
	}

	if (url.pathname === '/api/analysis/insights') {
		const body = await request.json().catch(() => ({}));
		const summaryText = await generateInsights(body, env);

		return new Response(
			JSON.stringify({
				summaryText,
				modelName: 'tencent/hy3:free (OpenRouter)',
				createdAt: new Date().toISOString(),
			}),
			{ headers: { 'content-type': 'application/json' } },
		);
	}

	return new Response('Not Found', { status: 404 });
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname.startsWith('/api/')) {
			return handleApi(request, env);
		}

		if (env.ASSETS) {
			return env.ASSETS.fetch(request);
		}

		return new Response('Asset binding not configured', { status: 500 });
	},
};
