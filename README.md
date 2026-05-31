# Hedjo – Carbon Accounting SaaS 🌿

> **Hedjo** (sundanesisch für *„grün“* / Basa Sunda) ist eine klimafreundliche Full-Stack-Software-as-a-Service (SaaS) Anwendung, die Unternehmen und Beratungsstellen in Indonesien und Südostasien hilft, ihre Treibhausgasemissionen gemäß den weltweiten Standards des **GHG Protocol** zu messen, zu verwalten und zu mindern.

---

## 🌟 Key Capabilities & Features

1. **3-Scope Emission Accounting**:
   - **Scope 1 (Direct Emissions)**: Fossil fuels burned inside operations (generator diesel, courier logistics gasoline) + AC refrigerant leaks ($R\text{-}410A$).
   - **Scope 2 (Indirect Grid Electricity)**: Electricity bills computed directly using Indonesia Ministry of Energy and Mineral Resources (MEMR/ESDM Jawa-Madura-Bali) regional grid carbon indexes.
   - **Scope 3 (Supply Chain Sourcing)**: Employee commuting subways, long/short-haul business flights, corporate hardware procurement (LCA indices), and operational landfill waste footprints.
2. **Interactive Eco-Dashboard & Charts**:
   - Highlights overall annual carbon load in tons of $CO_2$ equivalent ($tCO_2e$).
   - Displays reduction tracking indicators compared to historical baseline years.
   - Beautiful custom SVG charts representing boundary allocations and major emission-driver rankings.
3. **Gemini Climate Auditor Insights**:
   - Secure server-side proxy aggregating all activities.
   - Integrates the modern `@google/genai` SDK using a **Gemini 3.5-flash** instruction layout.
   - Outputs complete audit advice, policy compliance pathways (e.g. Indonesian Nilai Ekonomi Karbon (NEK) Regulation 98/2021), and actionable local programs (like PLN's Renewable Energy Certificates REC).
4. **Resilient Dual-Mode Architecture**:
   - **Enterprise Mode**: Configures Firebase Auth and Firestore for secure persistent storage.
   - **Instant Play Mode (Judge Friendly)**: If Firebase setup is pending, the application automates a client side `localStorage` state container. It is **completely 100% functional, reactive, and interactive immediately**!
   - **One-Click Seed Demonstration**: Click the **"Access Instant Seeded Demo"** key on the registration panel to load "Hedjo Demo Corp's" pre-filled dataset instantly. Include flights, courier fleets, grid bills, and active AC top-up leakages to see live dashboards and run live AI audits without configuration blocker files.

---

## 🏗️ Technical Architecture & Key Files

- **`/server.ts`**: The full-stack Express server bootstrapping Vite middleware. Hosts our endpoint `/api/gemini/insights` protecting secrets.
- **`/src/App.tsx`**: Main application state controller and navigation manager.
- **`/src/types.ts`**: Static type shapes enforcing validation rules across carbon schemas.
- **`/src/utils/carbonEngine.ts`**: Formula converters ($L$, $kWh$, $pkm$ converted to $tCO_2e$) and standard emission coefficients mapping.
- **`/src/components/`**:
  - `LandingPage.tsx`: Minimalist clean product launch intro.
  - `AuthScreen.tsx`: Sleek authorization screen housing standard email login and the custom shortcuts for reviewers.
  - `OnboardingWizard.tsx`: Multi-step workflow defining currency, base years, and boundary scopes.
  - `DashboardView.tsx`: Core statistics display with tailored responsive SVGs.
  - `DataEntryView.tsx`: Interactive tab sheet for adding, modifying, or removing fuel, submeter, and journey transactions.
  - `FactorsView.tsx`: Visual audit citations listing coefficients and ESDM references.
  - `InsightsView.tsx`: Markdown presentation component with custom embedded CSS print page-breaks and copy utilities.

---

## ⚡ Setup & Local Execution

1. Build both targets:
   ```bash
   npm run build
   ```
2. Start the integrated Express server:
   ```bash
   npm start
   ```
3. Visit the local host to view the live app on port 3000:
   `http://localhost:3000`

---
*Created in Southeast Asia. Optimized for carbon stewardship and green transitions under Google Cloud.*
