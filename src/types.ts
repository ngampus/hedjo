/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Organization {
  id: string;
  name: string;
  country: string;
  industry: string;
  baseCurrency: string;
  baselineYear: number;
  ownerUserId: string;
  createdAt: string;
  websiteUrl?: string;
  estimatedRating?: string;
  estimatedFootprintRange?: string;
  estimationReason?: string;
}

export interface Membership {
  id: string;
  orgId: string;
  userId: string;
  role: 'admin' | 'contributor' | 'viewer';
  userEmail?: string;
}

export interface ReportingPeriod {
  id: string; // e.g. "org_id_2025" or uuid
  orgId: string;
  year: number;
  status: 'draft' | 'locked';
  createdAt: string;
  lockedAt?: string | null;
}

export type Scope = 1 | 2 | 3;

export interface EmissionCategory {
  id: string;
  orgId: string | null; // null for default global categories
  scope: Scope;
  name: string;
  description: string;
  isDefault: boolean;
}

export interface EmissionFactor {
  id: string;
  orgId: string | null; // null for global standard keys
  scope: Scope;
  categoryId: string;
  name: string;
  unit: string; // e.g., "kWh", "Litre (Gasoline)", "pkm (Shortflight)"
  value: number; // kg CO2e per unit
  source: string; // e.g., "ESDM ESD Indonesia 2025", "IPCC 2024", "Defra 2025"
}

export interface ActivityData {
  id: string;
  orgId: string;
  reportingPeriodId: string;
  scope: Scope;
  categoryId: string;
  location: string;
  activityAmount: number;
  activityUnit: string;
  emissionFactorId: string;
  calculatedCO2e: number; // in metric tons tCO2e (1 ton = 1000 kg)
  notes: string;
  createdBy: string;
  createdAt: string;
  date: string; // YYYY-MM
}

export interface AIInsight {
  id: string;
  orgId: string;
  reportingPeriodId: string;
  summaryText: string;
  createdAt: string;
  modelName: string;
}
