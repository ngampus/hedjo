/// <reference types="@cloudflare/workers-types" />

export interface Env {
	ASSETS?: Fetcher;
}

async function handleApi(request: Request): Promise<Response> {
	const url = new URL(request.url);

	if (url.pathname === '/api/analysis/estimate-rating') {
		// Client-side fallback mode — return realistic local sector analysis
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
		// Fallback insights — matches server.ts FALLBACK_INSIGHTS
		const fallback = `### Carbon Emissions Analysis for Hedjo Operations

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

		return new Response(
			JSON.stringify({
				summaryText: fallback,
				modelName: 'hedjo-edge-fallback',
				createdAt: new Date().toISOString(),
				warning: 'Running in Cloudflare Workers edge mode. Configure GEMINI_API_KEY for full AI insights.',
			}),
			{ headers: { 'content-type': 'application/json' } },
		);
	}

	return new Response('Not Found', { status: 404 });
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// API routes handled at edge
		if (url.pathname.startsWith('/api/')) {
			return handleApi(request);
		}

		// Serve static assets via Cloudflare Assets binding
		if (env.ASSETS) {
			return env.ASSETS.fetch(request);
		}

		return new Response('Asset binding not configured', { status: 500 });
	},
};
