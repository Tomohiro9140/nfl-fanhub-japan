/* Archive Atlas data reminder: profile timelines keep every sourced NFL coaching post; only formal HC/OC/DC/STC roles receive a map glyph. */
import type { Appointment, CareerRole, StaffRole } from "./coaches";
import { profileCareer2026Overrides } from "./profileCareer2026Overrides";

const PROFILE_CAREER_DATA_URL = "/manus-storage/research_complete_nfl_coaching_profiles_2ca9b887.json";
const SPARSE_PROFILE_CAREER_DATA_URL = "/manus-storage/research_sparse_profile_histories_ad67c0b7.json";

type ResearchOutput = { profile_records?: string };
type ResearchRow = { input: string; output?: ResearchOutput };
type ResearchPayload = { results?: ResearchRow[] };
type SparseResearchOutput = { appointments_json?: string };
type SparseResearchRow = { input: string; output?: SparseResearchOutput };
type SparseResearchPayload = { results?: SparseResearchRow[] };

export const profileHistoryKey = (name: string) => name
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[’'`]/g, "")
  .replace(/[^a-z0-9]/gi, "")
  .toLowerCase();

export function isProfileGlyphRole(role: CareerRole): role is StaffRole {
  return role === "HC" || role === "OC" || role === "DC" || role === "STC";
}

function roleFromTitle(title: string): CareerRole {
  const normalized = title.toLowerCase();
  if (normalized.includes("head coach") && !normalized.includes("assistant head coach")) return "HC";
  if (normalized.includes("offensive coordinator") && !normalized.includes("assistant offensive coordinator")) return "OC";
  if (normalized.includes("defensive coordinator") && !normalized.includes("assistant defensive coordinator")) return "DC";
  if (normalized.includes("special teams coordinator") && !normalized.includes("assistant special teams coordinator")) return "STC";
  return "OTHER";
}

function parseCareerRecords(records?: string): Appointment[] {
  if (!records) return [];
  return records.split("\n").flatMap((line) => {
    const [years, team, title, sourceUrl] = line.split("|").map((part) => part.trim());
    if (!years || !team || !title) return [];
    return [{ years, team, role: roleFromTitle(title), title, sourceUrl }];
  });
}

function parseSparseCareerRecords(records?: string): Appointment[] {
  if (!records) return [];
  try {
    const rows = JSON.parse(records) as Array<{ years?: string; team?: string; title?: string; source_url?: string }>;
    return rows.flatMap((row) => {
      if (!row.years || !row.team || !row.title) return [];
      return [{ years: row.years, team: row.team, role: roleFromTitle(row.title), title: row.title, sourceUrl: row.source_url }];
    });
  } catch {
    return [];
  }
}

export async function loadProfileCareerHistories(): Promise<Record<string, Appointment[]>> {
  const [response, sparseResponse] = await Promise.all([fetch(PROFILE_CAREER_DATA_URL), fetch(SPARSE_PROFILE_CAREER_DATA_URL)]);
  if (!response.ok) throw new Error(`Profile career data request failed: ${response.status}`);
  if (!sparseResponse.ok) throw new Error(`Sparse profile career data request failed: ${sparseResponse.status}`);
  const [payload, sparsePayload] = await Promise.all([response.json() as Promise<ResearchPayload>, sparseResponse.json() as Promise<SparseResearchPayload>]);
  const researchedHistories = Object.fromEntries((payload.results ?? []).flatMap((row) => {
    const appointments = parseCareerRecords(row.output?.profile_records);
    return appointments.length ? [[profileHistoryKey(row.input), appointments]] : [];
  }));
  const sparseHistories = Object.fromEntries((sparsePayload.results ?? []).flatMap((row) => {
    const appointments = parseSparseCareerRecords(row.output?.appointments_json);
    return appointments.length ? [[profileHistoryKey(row.input), appointments]] : [];
  }));
  return { ...researchedHistories, ...sparseHistories, ...profileCareer2026Overrides };
}
