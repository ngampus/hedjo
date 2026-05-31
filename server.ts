/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

// Load environment variables
dotenv.config();

const PORT = 3000;

// Lazy initialization of GoogleGenAI client
let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY is not defined or is utilizing placeholders. Please add your actual key under Settings > Secrets.');
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

// Indonesian-friendly default carbon insights fallback if Gemini keys are empty
const FALLBACK_INSIGHTS = `### Carbon Emissions Analysis for Hedjo Operations

Our regional SME analysis highlights the target emissions profile of your business operations.

---

#### 📊 Estimated Footprint Overview (Mock Fallback)
*If you see this report, your Gemini API Key is not yet fully configured in your Settings > Secrets panel. We have prepared this detailed climate profile template for your review:*

- **Scope 1 (Direct Fuels):** Typically spans 20% to 30% of standard operations, mostly centered around shipping fuel combustion, company motorbikes, or diesel generators powering local data arrays.
- **Scope 2 (Electricity Footprint):** Usually the single largest core carbon driver (**40% to 60% of total footprint**). For enterprises inside Indonesia, the Jamali power grid factor (**0.812 kg CO2e/kWh**) is highly carbon-dense due to heavy coal grid configurations, compared to other ASEAN structures like Singapore (**0.408 kg CO2e/kWh**).
- **Scope 3 (Procurement and Services):** Spans logistics sourcing, office paper trash landfilled, and commuter travel. Commuting represents an easy win once electric commuter incentives are configured.

---

#### 🌿 Recommended Southeast Asian Carbon Abatement Map
1. **Purchase PLN Renewable Energy Certificates (RECs)**: State electrical company PLN provides certified renewable indexing. Sourcing RECs instantly turns Scope 2 electricity footprints into zero, erasing your largest ESG carbon liability instantly.
2. **Transition Logistics to EV fleets**: Swap delivery vehicles to local Indonesian electric motorbikes (e.g. Alva, Gesits) to leverage state purchase subsidies.
3. **Conduct quarterly aircon system checks**: AC gas leakage (such as R-410A) carries an extremely high Global Warming Potential (GWP > 2000), meaning a simple 2 kg leakage contributes over 4 metric tons of $CO_2e$ to your Scope 1 profile.
`;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route: Estimate Carbon Footprint & Rating based on Company profile & website URL
  app.post('/api/analysis/estimate-rating', async (req, res) => {
    try {
      const { name, websiteUrl, industry, country } = req.body;
      console.log(`Estimating carbon profile for website footprint: "${websiteUrl}" (${name}, ${industry}, ${country})`);

      try {
        const ai = getGenAI();
        const prompt = `
Analyze the following corporate characteristics to estimate their likely Scope 1, 2, and 3 carbon footprint intensity:
- Company Name: "${name || 'Unnamed enterprise'}"
- Website URL: "${websiteUrl || 'Not provided'}"
- Industry: "${industry || 'SME'}"
- Location: "${country || 'Southeast Asia / Global'}"

Based on industry ESG reports, typical employee sizes, office or digital logistics infrastructure of SaaS vs industrial operations, and country energy grids, predict:
1. Carbon Grade Rating: A letter grade representing carbon efficiency (A+, A, A-, B+, B, B-, C+, C, C-, D, E, F). Make it realistic: Technology & SaaS should generally be high rating (e.g. A to B+), logistics & manufacturing lower rating (C to D) because of heavy direct combustion and footprint.
2. Annual Footprint Range: A realistic estimated total annual emissions range (e.g. "5 - 15 tCO2e/yr" or "100 - 250 tCO2e/yr").
3. Explanation: A crisp, 2-3 sentence professional ESG reasoning explaining the rating choice.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                rating: {
                  type: Type.STRING,
                  description: "Letter grade rating e.g. A+, B-, C. Must be a string."
                },
                footprintRange: {
                  type: Type.STRING,
                  description: "Range estimate e.g. '12 - 35 tCO2e/yr'. Must be a string."
                },
                explanation: {
                  type: Type.STRING,
                  description: "A compact 2-3 sentence ESG reasoning paragraph explaining the rating."
                }
              },
              required: ["rating", "footprintRange", "explanation"]
            }
          }
        });

        const data = JSON.parse(response.text.trim());
        res.json({
          rating: data.rating,
          footprintRange: data.footprintRange,
          explanation: data.explanation,
          source: 'Gemini-3.5-Flash Sector Analysis'
        });

      } catch (aiError: any) {
        console.warn('Gemini Estimate Rating failed, producing realistic industry-average fallback model:', aiError.message);
        
        // Let's build a smart model-based fallback calculation
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

        res.json({
          rating,
          footprintRange,
          explanation: explanation + ` (Local Sector Analysis. Gemini connection was bypassed: ${aiError.message})`,
          source: 'Hedjo Local Sector Fallback'
        });
      }
    } catch (routeError: any) {
      console.error('Estimate rating route error:', routeError);
      res.status(500).json({ error: 'Failed to estimate carbon footprint rating', details: routeError.message });
    }
  });

  // API Route: AI Carbon Insights proxying request safely to Gemini
  app.post('/api/analysis/insights', async (req, res) => {
    try {
      const {
        orgName,
        country,
        industry,
        year,
        scope1,
        scope2,
        scope3,
        activities,
        categories
      } = req.body;

      // Log received parameters
      console.log(`Generating ESG insights for "${orgName}" in ${country} (${industry}, ${year})`);

      try {
        const ai = getGenAI();
        const prompt = `
You are the world's leading sustainability climatologist, ESG auditor, and greenhouse gas accounting expert specializing in the GHG Protocol, carbon markets, and climate actions inside Southeast Asia (especially Indonesia, Singapore, and ASEAN).

Generate a highly professional, scannable, and actionable Carbon Footprint & Decarbonization Audit Report for the following organization:

### ORGANIZATION PROFILE
- Name: "${orgName || 'Hedjo Member Corp'}"
- Location: ${country || 'Indonesia / Southeast Asia'}
- Industry Sectors: ${industry || 'Service SME'}
- Reporting Year: ${year || 2025}

### ANNUAL CARBON EMISSIONS PROFILE (in tCO2e - Metric Tons of CO2 equivalent)
- Scope 1 (Direct Emissions: Fuels, fugitive AC refrigerant leaks): ${scope1?.toFixed(3) || '0.000'} tCO2e
- Scope 2 (Indirect Grid Electricity / Steam Purchases): ${scope2?.toFixed(3) || '0.000'} tCO2e
- Scope 3 (Indirect Value Chain: Procurement, Business Flights, Waste, Commuting): ${scope3?.toFixed(3) || '0.000'} tCO2e
- Total Footprint: ${( (scope1 || 0) + (scope2 || 0) + (scope3 || 0) ).toFixed(3)} tCO2e

### CORE GREENHOUSE LOG ENTRIES
${JSON.stringify(activities || [], null, 2)}

Provide a robust audit in complete Markdown format with clear, elegant typography. Follow this structure exactly:
1. **Executive Carbon Summary**: Summarize their total emissions and call out which Scope and category are their largest carbon drivers. Include specific percentage ratios. Explain what this means in terms of environmental impact.
2. **Southeast Asian Policy, ESG Compliance, & Market Risks**: Analyze this specific footprint through the lens of local regulatory frameworks, such as the Indonesian Presidential Regulation on Carbon Economic Value (NEK - Nilai Ekonomi Karbon), MEMR electric mandates, OJK ESG disclosing criteria, and the upcoming Carbon Tax. Give actual, practical compliance advice.
3. **Actionable Mitigation & Decarbonization Blueprint (3 to 5 steps)**: Outline 3 to 5 realistic, targeted decarbonization actions for this SME or enterprise. Detail the estimated abatement potential, ROI calculations, and specific regional programs they should leverage (e.g., State Electricity Company PLN’s Renewable Energy Certificates (REC) in Indonesia, grid solar incentives, EV logistics conversion guidelines).

Write the markdown clearly, objectively, and with professional ESG composure. Do not use generic placeholders.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            temperature: 0.7,
            systemInstruction: 'You are Hedjo AI, an professional, eco-conscious carbon calculation auditor and climate-tech advisor for Southeast Asian SMEs.'
          }
        });

        const generatedText = response.text;
        res.json({
          orgId: req.body.orgId || '',
          reportingPeriodId: req.body.reportingPeriodId || '',
          summaryText: generatedText,
          modelName: 'gemini-3.5-flash',
          createdAt: new Date().toISOString()
        });

      } catch (aiError: any) {
        console.warn('Gemini API execution error, providing formatted regional fallback summary instead:', aiError.message);
        
        // Append context warning about missing secrets to our regional fallback
        const alertMessage = `\n\n> *Note from Administrator: Standard Gemini analysis is temporarily using the ASEAN carbon profile blueprint because the configured GEMINI_API_KEY environment parameter was not accessible or returned an API key validation error: ${aiError.message}*`;
        
        res.json({
          orgId: req.body.orgId || '',
          reportingPeriodId: req.body.reportingPeriodId || '',
          summaryText: FALLBACK_INSIGHTS + alertMessage,
          modelName: 'hedjo-local-intelligence',
          createdAt: new Date().toISOString(),
          warning: aiError.message
        });
      }

    } catch (routeError: any) {
      console.error('Core /api/gemini/insights route crash:', routeError);
      res.status(500).json({ error: 'Failed to aggregate and process climate insight request', details: routeError.message });
    }
  });

  // Vite Integration context
  if (process.env.NODE_ENV !== 'production') {
    console.log('Mounting Vite middleware in Express (Development Mode)');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving client-side static bundle (Production Mode)');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hedjo server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
