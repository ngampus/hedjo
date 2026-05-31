/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EmissionFactor, EmissionCategory, ActivityData, Organization, ReportingPeriod } from '../types';

export const GLOBAL_CATEGORIES: EmissionCategory[] = [
  // Scope 1
  { id: 'sc1_stationary_combustion', orgId: null, scope: 1, name: 'Stationary Combustion', description: 'Emissions from burning fuels in boilers, furnaces, or generators.', isDefault: true },
  { id: 'sc1_mobile_combustion', orgId: null, scope: 1, name: 'Mobile Combustion', description: 'Emissions from burning fuel in company-owned transportation/vehicles.', isDefault: true },
  { id: 'sc1_fugitive', orgId: null, scope: 1, name: 'Fugitive Emissions', description: 'Refrigerant gas leakages from HVAC air conditioning units.', isDefault: true },
  
  // Scope 2
  { id: 'sc2_electricity', orgId: null, scope: 2, name: 'Purchased Electricity', description: 'Indirect greenhouse gas emissions from consumed grid electricity.', isDefault: true },
  { id: 'sc2_steam', orgId: null, scope: 2, name: 'District Heating & Steam', description: 'Indirect emissions from purchased steam, heating, or cooling.', isDefault: true },

  // Scope 3
  { id: 'sc3_purchased_goods', orgId: null, scope: 3, name: 'Purchased Goods & Services', description: 'Material sourcing, paper consumption, IT hardware, and packaging.', isDefault: true },
  { id: 'sc3_business_travel', orgId: null, scope: 3, name: 'Business Travel', description: 'Staff carbon footprint from airlines, bullet trains, car hire, and hotel stays.', isDefault: true },
  { id: 'sc3_employee_commuting', orgId: null, scope: 3, name: 'Employee Commuting', description: 'Emissions from staff traveling between transit terminals and offices.', isDefault: true },
  { id: 'sc3_waste', orgId: null, scope: 3, name: 'Waste Generated in Operations', description: 'End-of-life disposal and treatment of operational waste (landfill).', isDefault: true }
];

export const GLOBAL_FACTORS: EmissionFactor[] = [
  // Scope 1: Stationary Combustion
  {
    id: 'ef_biosolar_stationary',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_stationary_combustion',
    name: 'Pertamina Bio Solar (B35) - Stationary',
    unit: 'Liters',
    value: 1.742,
    source: 'Kementerian ESDM & IPCC guidelines (35% Biogenic Offset)'
  },
  {
    id: 'ef_dex_stationary',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_stationary_combustion',
    name: 'Pertamina Dex (CN 53) - Stationary',
    unit: 'Liters',
    value: 2.680,
    source: 'Kementerian ESDM Indonesia'
  },
  {
    id: 'ef_dexlite_stationary',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_stationary_combustion',
    name: 'Pertamina Dexlite (CN 51) - Stationary',
    unit: 'Liters',
    value: 2.450,
    source: 'Kementerian ESDM Indonesia'
  },
  {
    id: 'ef_pertalite_stationary',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_stationary_combustion',
    name: 'Pertamina Pertalite (RON 90) - Stationary',
    unit: 'Liters',
    value: 2.220,
    source: 'Kementerian ESDM Indonesia'
  },
  {
    id: 'ef_pertamax_stationary',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_stationary_combustion',
    name: 'Pertamina Pertamax (RON 92) - Stationary',
    unit: 'Liters',
    value: 2.250,
    source: 'Kementerian ESDM Indonesia'
  },
  {
    id: 'ef_pertamax_green95_stationary',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_stationary_combustion',
    name: 'Pertamina Pertamax Green 95 (E5, RON 95) - Stationary',
    unit: 'Liters',
    value: 2.138,
    source: 'Kementerian ESDM & IPCC guidelines (5% Biogenic Offset)'
  },
  {
    id: 'ef_pertamax_turbo_stationary',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_stationary_combustion',
    name: 'Pertamina Pertamax Turbo (RON 98) - Stationary',
    unit: 'Liters',
    value: 2.270,
    source: 'Kementerian ESDM Indonesia'
  },
  {
    id: 'ef_pertamax_racing_stationary',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_stationary_combustion',
    name: 'Pertamina Pertamax Racing (RON 100) - Stationary',
    unit: 'Liters',
    value: 2.300,
    source: 'Kementerian ESDM Indonesia / IPCC'
  },
  {
    id: 'ef_natural_gas',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_stationary_combustion',
    name: 'Natural Gas',
    unit: 'm³',
    value: 1.93, // kg CO2e/m3
    source: 'IPCC 2024 Guidelines'
  },

  // Scope 1: Mobile Combustion
  {
    id: 'ef_biosolar_mobile',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_mobile_combustion',
    name: 'Pertamina Bio Solar (B35) - Mobile',
    unit: 'Liters',
    value: 1.742,
    source: 'Kementerian ESDM & IPCC guidelines (35% Biogenic Offset)'
  },
  {
    id: 'ef_dex_mobile',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_mobile_combustion',
    name: 'Pertamina Dex (CN 53) - Mobile',
    unit: 'Liters',
    value: 2.680,
    source: 'Kementerian ESDM Indonesia'
  },
  {
    id: 'ef_dexlite_mobile',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_mobile_combustion',
    name: 'Pertamina Dexlite (CN 51) - Mobile',
    unit: 'Liters',
    value: 2.450,
    source: 'Kementerian ESDM Indonesia'
  },
  {
    id: 'ef_pertalite_mobile',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_mobile_combustion',
    name: 'Pertamina Pertalite (RON 90) - Mobile',
    unit: 'Liters',
    value: 2.220,
    source: 'Kementerian ESDM Indonesia'
  },
  {
    id: 'ef_pertamax_mobile',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_mobile_combustion',
    name: 'Pertamina Pertamax (RON 92) - Mobile',
    unit: 'Liters',
    value: 2.250,
    source: 'Kementerian ESDM Indonesia'
  },
  {
    id: 'ef_pertamax_green95_mobile',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_mobile_combustion',
    name: 'Pertamina Pertamax Green 95 (E5, RON 95) - Mobile',
    unit: 'Liters',
    value: 2.138,
    source: 'Kementerian ESDM & IPCC guidelines (5% Biogenic Offset)'
  },
  {
    id: 'ef_pertamax_turbo_mobile',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_mobile_combustion',
    name: 'Pertamina Pertamax Turbo (RON 98) - Mobile',
    unit: 'Liters',
    value: 2.270,
    source: 'Kementerian ESDM Indonesia'
  },
  {
    id: 'ef_pertamax_racing_mobile',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_mobile_combustion',
    name: 'Pertamina Pertamax Racing (RON 100) - Mobile',
    unit: 'Liters',
    value: 2.300,
    source: 'Kementerian ESDM Indonesia / IPCC'
  },

  // Scope 1: Fugitive
  {
    id: 'ef_refrigerant_r410a',
    orgId: null,
    scope: 1,
    categoryId: 'sc1_fugitive',
    name: 'R-410A Refrigerant Leakage',
    unit: 'kg',
    value: 2088.0, // kg CO2e/kg (extremely high GWP)
    source: 'IPCC AR5 Greenhouse GWP Indices'
  },

  // Scope 2: Electricity
  {
    id: 'ef_jamali_grid',
    orgId: null,
    scope: 2,
    categoryId: 'sc2_electricity',
    name: 'Indonesia Grid Electricity (Jamali: Jawa-Madura-Bali)',
    unit: 'kWh',
    value: 0.812, // kg CO2e/kWh
    source: 'MEMR / Kementerian ESDM Indonesia 2024'
  },
  {
    id: 'ef_non_jamali_grid',
    orgId: null,
    scope: 2,
    categoryId: 'sc2_electricity',
    name: 'Indonesia Grid Electricity (Sumatera / Kalimantan / Outer)',
    unit: 'kWh',
    value: 0.945, // kg CO2e/kWh
    source: 'MEMR / Kementerian ESDM Indonesia 2024'
  },
  {
    id: 'ef_sg_grid',
    orgId: null,
    scope: 2,
    categoryId: 'sc2_electricity',
    name: 'Singapore Grid Electricity',
    unit: 'kWh',
    value: 0.408, // kg CO2e/kWh
    source: 'Singapore Energy Market Authority (EMA)'
  },

  // Scope 3: Purchased Goods
  {
    id: 'ef_office_paper',
    orgId: null,
    scope: 3,
    categoryId: 'sc3_purchased_goods',
    name: 'Office Printing Paper (Recycled)',
    unit: 'kg',
    value: 0.92, // kg CO2e/kg
    source: 'Defra 2025 Baseline'
  },
  {
    id: 'ef_office_paper_virgin',
    orgId: null,
    scope: 3,
    categoryId: 'sc3_purchased_goods',
    name: 'Office Printing Paper (Virgin Fibres)',
    unit: 'kg',
    value: 1.25, // kg CO2e/kg
    source: 'Defra 2025 Baseline'
  },
  {
    id: 'ef_laptop_hardware',
    orgId: null,
    scope: 3,
    categoryId: 'sc3_purchased_goods',
    name: 'IT Equipment Purchasing (Laptop LCA average)',
    unit: 'Items',
    value: 245.0, // kg CO2e/Item
    source: 'Vendor Lifecycle Assessment Average (Dell, Apple, Lenovo)'
  },
  {
    id: 'ef_water_m3',
    orgId: null,
    scope: 3,
    categoryId: 'sc3_purchased_goods',
    name: 'Municipal Clean Tap Water Supply',
    unit: 'm³',
    value: 0.34, // kg CO2e/m3
    source: 'Defra 2025'
  },

  // Scope 3: Travel
  {
    id: 'ef_sh_flight_econ',
    orgId: null,
    scope: 3,
    categoryId: 'sc3_business_travel',
    name: 'Short-Haul Direct Flight (Economy Class)',
    unit: 'passenger-km',
    value: 0.154, // kg CO2e/passenger-km
    source: 'UK Defra 2025 Greenhouse Guidance'
  },
  {
    id: 'ef_lh_flight_econ',
    orgId: null,
    scope: 3,
    categoryId: 'sc3_business_travel',
    name: 'Long-Haul Intercontinental Flight (Economy Class)',
    unit: 'passenger-km',
    value: 0.193, // kg CO2e/passenger-km
    source: 'UK Defra 2025 Greenhouse Guidance'
  },
  {
    id: 'ef_sc3_taxi',
    orgId: null,
    scope: 3,
    categoryId: 'sc3_business_travel',
    name: 'Urban Car Ride (Taxi/Ride-hailing average)',
    unit: 'km',
    value: 0.178, // kg CO2e/km
    source: 'Defra 2025'
  },
  {
    id: 'ef_non_brt_bus',
    orgId: null,
    scope: 3,
    categoryId: 'sc3_business_travel',
    name: 'Non-BRT Bus',
    unit: 'passenger-km',
    value: 0.096, // kg CO2e/passenger-km
    source: 'Intercity Transit & ESDM Guidelines adaptation'
  },
  {
    id: 'ef_kai_intercity',
    orgId: null,
    scope: 3,
    categoryId: 'sc3_business_travel',
    name: 'Intercity Train (KAI)',
    unit: 'passenger-km',
    value: 0.038, // kg CO2e/passenger-km
    source: 'PT KAI Environmental Disclosure & ESDM Guidelines'
  },

  // Scope 3: Commuting
  {
    id: 'ef_commuting_rail',
    orgId: null,
    scope: 3,
    categoryId: 'sc3_employee_commuting',
    name: 'MRT/LRT Rapid Train Commute',
    unit: 'passenger-km',
    value: 0.028, // kg CO2e/passenger-km
    source: 'MRT Jakarta / KAI Commuter Baseline'
  },
  {
    id: 'ef_commuting_motorcycle',
    orgId: null,
    scope: 3,
    categoryId: 'sc3_employee_commuting',
    name: 'Two-Wheeler Commute (Petrol Honda/Yamaha average)',
    unit: 'km',
    value: 0.083, // kg CO2e/km
    source: 'ESDM Indonesia 2025'
  },
  {
    id: 'ef_transjakarta_brt',
    orgId: null,
    scope: 3,
    categoryId: 'sc3_employee_commuting',
    name: 'BRT Transjakarta',
    unit: 'passenger-km',
    value: 0.055, // kg CO2e/passenger-km
    source: 'Transjakarta Sustainability Report & ESDM Guidelines'
  },

  // Scope 3: Waste
  {
    id: 'ef_waste_landfill',
    orgId: null,
    scope: 3,
    categoryId: 'sc3_waste',
    name: 'Municipal General Mixed Waste (Landfilled)',
    unit: 'kg',
    value: 0.445, // kg CO2e/kg
    source: 'Defra 2025'
  }
];

export function calculateCO2e(amount: number, factorValue: number): number {
  if (isNaN(amount) || isNaN(factorValue)) return 0;
  // Calculate kilograms and convert to METRIC TONS (tCO2e): dividing by 1000
  const kg = amount * factorValue;
  const tons = kg / 1000;
  return parseFloat(tons.toFixed(4));
}

// Generate complete demo seed database records for "Hedjo Demo Corp"
export const SEED_DEMO_ORG: Organization = {
  id: 'hedjo_demo_corp',
  name: 'Hedjo Demo Corp',
  country: 'Indonesia',
  industry: 'Technology & Logistics',
  baseCurrency: 'IDR',
  baselineYear: 2025,
  ownerUserId: 'demo_user_id',
  createdAt: new Date('2025-01-15T09:00:00Z').toISOString()
};

export const SEED_DEMO_PERIOD: ReportingPeriod = {
  id: 'hedjo_demo_corp_2025',
  orgId: 'hedjo_demo_corp',
  year: 2025,
  status: 'draft',
  createdAt: new Date('2025-01-15T09:30:00Z').toISOString()
};

export const SEED_DEMO_ACTIVITIES: ActivityData[] = [
  // --- Scope 1: Mobile & Stationary Fuels ---
  {
    id: 'act_demo_1',
    orgId: 'hedjo_demo_corp',
    reportingPeriodId: 'hedjo_demo_corp_2025',
    scope: 1,
    categoryId: 'sc1_mobile_combustion',
    location: 'Jakarta Office Delivery Ground Vehicles',
    activityAmount: 4200, // Liters of gasoline
    activityUnit: 'Liters',
    emissionFactorId: 'ef_pertamax_mobile',
    calculatedCO2e: calculateCO2e(4200, 2.25), // 4200 * 2.25 / 1000 = 9.45 tCO2e
    notes: 'Primary fleet fuel purchases for Jakarta urban courier motorbikes and vans.',
    createdBy: 'demo_user_id',
    createdAt: new Date('2025-02-10T11:00:00Z').toISOString(),
    date: '2025-01'
  },
  {
    id: 'act_demo_2',
    orgId: 'hedjo_demo_corp',
    reportingPeriodId: 'hedjo_demo_corp_2025',
    scope: 1,
    categoryId: 'sc1_stationary_combustion',
    location: 'Bintaro Backup Server Room',
    activityAmount: 1800, // Liters of backup diesel fuel
    activityUnit: 'Liters',
    emissionFactorId: 'ef_dex_stationary',
    calculatedCO2e: calculateCO2e(1800, 2.68), // 1800 * 2.68 / 1000 = 4.824 tCO2e
    notes: 'Emergency diesel generator consumption during electrical grid maintenance outages.',
    createdBy: 'demo_user_id',
    createdAt: new Date('2025-03-05T14:20:00Z').toISOString(),
    date: '2025-02'
  },
  {
    id: 'act_demo_3',
    orgId: 'hedjo_demo_corp',
    reportingPeriodId: 'hedjo_demo_corp_2025',
    scope: 1,
    categoryId: 'sc1_fugitive',
    location: 'HQ Central HVAC Aircon',
    activityAmount: 2.5, // kg
    activityUnit: 'kg',
    emissionFactorId: 'ef_refrigerant_r410a',
    calculatedCO2e: calculateCO2e(2.5, 2088.0), // 2.5 * 2088 / 1000 = 5.22 tCO2e
    notes: 'AC top-up maintenance logs for the main workspace split air conditioner.',
    createdBy: 'demo_user_id',
    createdAt: new Date('2025-06-18T10:15:00Z').toISOString(),
    date: '2025-06'
  },

  // --- Scope 2: Grid Electricity ---
  {
    id: 'act_demo_4',
    orgId: 'hedjo_demo_corp',
    reportingPeriodId: 'hedjo_demo_corp_2025',
    scope: 2,
    categoryId: 'sc2_electricity',
    location: 'Jakarta Head Office (SCBD Tower A)',
    activityAmount: 38500, // kWh
    activityUnit: 'kWh',
    emissionFactorId: 'ef_jamali_grid',
    calculatedCO2e: calculateCO2e(38500, 0.812), // 38500 * 0.812 / 1000 = 31.262 tCO2e
    notes: 'Headquarters electricity bill consumption log covering Jan-Jun grid usage.',
    createdBy: 'demo_user_id',
    createdAt: new Date('2025-07-02T16:00:00Z').toISOString(),
    date: '2025-06'
  },
  {
    id: 'act_demo_5',
    orgId: 'hedjo_demo_corp',
    reportingPeriodId: 'hedjo_demo_corp_2025',
    scope: 2,
    categoryId: 'sc2_electricity',
    location: 'Medan Satellite Hub Facility',
    activityAmount: 12400, // kWh
    activityUnit: 'kWh',
    emissionFactorId: 'ef_non_jamali_grid',
    calculatedCO2e: calculateCO2e(12400, 0.945), // 12400 * 0.945 / 1000 = 11.718 tCO2e
    notes: 'Power submeter logs for Sumatra regional server rack installations and operations.',
    createdBy: 'demo_user_id',
    createdAt: new Date('2025-07-03T11:10:00Z').toISOString(),
    date: '2025-06'
  },

  // --- Scope 3: Travel, Sourcing, Commuting ---
  {
    id: 'act_demo_6',
    orgId: 'hedjo_demo_corp',
    reportingPeriodId: 'hedjo_demo_corp_2025',
    scope: 3,
    categoryId: 'sc3_business_travel',
    location: 'CGK to SIN Regional Flight',
    activityAmount: 18500, // passenger-kilometers
    activityUnit: 'passenger-km',
    emissionFactorId: 'ef_sh_flight_econ',
    calculatedCO2e: calculateCO2e(18500, 0.154), // 18500 * 0.154 / 1000 = 2.849 tCO2e
    notes: 'Sales and partnership team travels for climate-fintech presentations at Singapore tech expo.',
    createdBy: 'demo_user_id',
    createdAt: new Date('2025-04-12T09:45:00Z').toISOString(),
    date: '2025-04'
  },
  {
    id: 'act_demo_7',
    orgId: 'hedjo_demo_corp',
    reportingPeriodId: 'hedjo_demo_corp_2025',
    scope: 3,
    categoryId: 'sc3_purchased_goods',
    location: 'Headquarters Procurement',
    activityAmount: 45, // laptops purchased
    activityUnit: 'Items',
    emissionFactorId: 'ef_laptop_hardware',
    calculatedCO2e: calculateCO2e(45, 245.0), // 45 * 245 / 1000 = 11.025 tCO2e
    notes: 'Hardware Upgrades for HQ: Purchased 45 custom energy-efficient developer laptops standardizing workstation setups.',
    createdBy: 'demo_user_id',
    createdAt: new Date('2025-02-18T15:30:00Z').toISOString(),
    date: '2025-02'
  },
  {
    id: 'act_demo_8',
    orgId: 'hedjo_demo_corp',
    reportingPeriodId: 'hedjo_demo_corp_2025',
    scope: 3,
    categoryId: 'sc3_employee_commuting',
    location: 'Jakarta Urban Transit Rail',
    activityAmount: 32000, // pkm
    activityUnit: 'passenger-km',
    emissionFactorId: 'ef_commuting_rail',
    calculatedCO2e: calculateCO2e(32000, 0.028), // 32000 * 0.028 / 1000 = 0.896 tCO2e
    notes: 'Monthly corporate staff MRT transit commutes surveyed for 12 core engineers.',
    createdBy: 'demo_user_id',
    createdAt: new Date('2025-05-30T17:40:00Z').toISOString(),
    date: '2025-05'
  },
  {
    id: 'act_demo_9',
    orgId: 'hedjo_demo_corp',
    reportingPeriodId: 'hedjo_demo_corp_2025',
    scope: 3,
    categoryId: 'sc3_waste',
    location: 'Jakarta Landfill Disposal Logs',
    activityAmount: 1520, // kg of mixed waste
    activityUnit: 'kg',
    emissionFactorId: 'ef_waste_landfill',
    calculatedCO2e: calculateCO2e(1520, 0.445), // 1520 * 0.445 / 1000 = 0.6764 tCO2e
    notes: 'Non-recycled single-use workspace office rubbish sent directly to Bantar Gebang landfill.',
    createdBy: 'demo_user_id',
    createdAt: new Date('2025-06-30T18:00:00Z').toISOString(),
    date: '2025-06'
  }
];

export const DEMO_AI_INSIGHT_TEXT = `### Carbon Emissions Analysis for Hedjo Demo Corp (2025)

Our analysis highlights the complete carbon intensity map of your operations spanning Scopes 1, 2, and 3. Your cumulative footprint stands at **77.96 $tCO_2e$**. Here is a breakdown of your profile, specific regulatory contextual advice for Southeast Asia / Indonesia, and targeted decarbonization pathways.

---

#### 📊 Carbon Footprint Distribution Breakdown
- **Scope 1 (Direct Emissions):** **19.58 $tCO_2e$** *(25.1% of total)*
  - *Primary Source:* Jakarta mobile courier gasoline fuel fleet (**9.53 $tCO_2e$**) and HQ backup generator diesel (**4.82 $tCO_2e$**).
  - *Fugitives:* HQ split-cooling Aircon Topups accounted for **5.22 $tCO_2e$** due to the extremely high global warming potential (GWP) of R-410A refrigerant leakages.
- **Scope 2 (Indirect Grid Electricity):** **42.98 $tCO_2e$** *(55.1% of total)*
  - *Primary Source:* SCBD Jakarta Tower electricity (**31.26 $tCO_2e$** at a factor of **0.812 kg/kWh**) and Sumatra satellite server facilities (**11.72 $tCO_2e$** at a higher grid factor of **0.945 kg/kWh** due to heavy reliance on local coal generation).
- **Scope 3 (Supply Chain & Commutes):** **15.45 $tCO_2e$** *(19.8% of total)*
  - *Primary Source:* Corporate workstation upgrade procurement (Dell/Macbook manufacturing footprint equivalent to **11.03 $tCO_2e$**) and Singapore flyovers (**2.85 $tCO_2e$**). Employee commuter MRT rail is relatively minor (**0.90 $tCO_2e$**).

---

#### 🌏 Indonesia & Southeast Asian Policy Landscape
Under the new *Indonesian Presidential Regulation No. 98/2021* ( penyelenggaraan nilai ekonomi karbon) and OJK ESG reporting mandates, technology providers and logistics entities are increasingly pressurized to disclose Scope 1-3 reports. Furthermore, the upcoming national Carbon Tax implementations will target combustion from backup grids. Transitioning your electricity footprint is critical to hedge against incoming regional energy costs in Jakarta and Medan.

---

#### 🌿 Actionable 4-Step Carbon Abatement Strategy

1. **⚡ Scope 2: SCBD Renewable & Green Tariff Subscriptions**
   - *Abatement Potential:* up to **31 $tCO_2e$** reduction (approx. **40% total emissions savings**).
   - *Action Plan:* Procure PLN REC (Renewable Energy Certificates) from State Electricity Company (PLN) for your Jakarta SCBD headquarters. This instant market instrument allows you to claim zero-emission electricity sourcing, immediately wiping out your single largest carbon liability.

2. **🏍️ Scope 1: Transition Courier Fleet to Electric Two-Wheelers**
   - *Abatement Potential:* **9.53 $tCO_2e$** reduction (saves **12.2% total emissions**).
   - *Indonesia Context:* Capitalize on the Ministry of Industry's EV subsidies to lease or purchase local electric motorcycles (e.g., Alva, Gesits, Volta) for standard urban courier routes in Jakarta. Combine this with SCBD-located charging hubs.

3. **❄️ Scope 1: Advance HVAC AC Leakage Audit Protocols**
   - *Abatement Potential:* **5.22 $tCO_2e$** abatement (saves **6.7% total emissions**).
   - *Action Plan:* Standardize leak audits every 3 months. Transition old splits to modern low-GWP refrigerant cooling units using R-32 or hydrocarbons instead of R-410A when replacing units to limit high-GWP escape hazards.

4. **💻 Scope 3: circular Procurement & Extended Lifecycle Leases**
   - *Abatement Potential:* **4.4 $tCO_2e$** reduction over a 5-year frame.
   - *Action Plan:* Instead of immediate capital purchases, negotiate computer buyback leases with circular vendors to verify certified zero-refurbishment recycling loops, or extend computer refreshes from 3 years to 5 years, reducing annual amortized Scope 3 equipment footprints.
`;
