/**
 * Archive Atlas data reminder: central maps are directed multi-generation forests.
 * Solid links are documented coaching connections used to form the directed lineage forest.
 */
import type { Appointment, Coach, LineageEdge, Role } from "./coaches";
import { coaches as featuredCoaches } from "./networkData";
import { registryCoaches, type RegistryCoach } from "./coachRegistry";
import { stcHistories } from "./stcHistories";
import { additionalConnectedCoaches, lineageRoots, multiGenerationRelations, type RelationKind } from "./multiGenerationLineages";
import { verifiedRoleHistories } from "./verifiedRoleHistories";

export type CentralAtlasTree = { id: string; rootId: string; label: string; japanese: string; years: string; teams: string[]; nodeIds: string[]; headCoachStints: { team: string; years: string }[] };
export type CentralAtlasEdge = LineageEdge & { id: string; sourceUrl: string; relationType: RelationKind; generation: number };

const normalize = (name: string) => name.toLowerCase().replace(/[.'’]/g, "").replace(/\s+/g, " ").trim();
const historyKey = (name: string) => name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[’'`]/g, "").replace(/[^a-z0-9]/gi, "").toLowerCase();
const slug = (name: string) => `tree-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
const decade = (year: number) => `${Math.floor(year / 10) * 10}s`;
const registryByName = new Map(registryCoaches.map((coach) => [normalize(coach.name), coach]));
const featuredByName = new Map(featuredCoaches.map((coach) => [normalize(coach.name), coach]));
const extraByName = new Map(additionalConnectedCoaches.map((coach) => [normalize(coach.name), coach]));
const mapExcludedCoachNames = new Set([
  "Dick MacPherson", "Jerry Burns", "John Robinson", "Ron Meyer", "Wayne Fontes", "Bobby Ross", "Dennis Erickson", "Ray Perkins", "Rich Brooks", "Jack Pardee", "Marv Levy", "Don Shula", "Jerry Glanville", "Steve Spurrier", "Tom Flores", "Urban Meyer", "Jeff Saturday", "Barry Switzer", "Chuck Knox",
  "Joe Bugel", "Dan Henning", "Richie Petitbon", "Don Breaux", "Gregg Williams", "Al Saunders",
  "Joe Gibbs", "Dick Vermeil", "Mike Martz", "Ted Marchibroda", "Darrell Bevell",
].map(normalize));

function specialty(roles: Role[]): Coach["specialty"] { return roles.includes("DC") && !roles.includes("OC") ? "Defense" : roles.includes("OC") && !roles.includes("DC") ? "Offense" : "Balanced"; }
function coreRoles(appointments: Appointment[], fallback: Role[]): Role[] {
  return Array.from(new Set([...fallback, ...appointments.map((appointment) => appointment.role).filter((role): role is Role => role === "HC" || role === "OC" || role === "DC")]));
}
function sortAppointments(appointments: Appointment[]) {
  return [...appointments].sort((a, b) => Number(a.years.match(/\d{4}/)?.[0] ?? 0) - Number(b.years.match(/\d{4}/)?.[0] ?? 0));
}
function enrichCoach(coach: Coach): Coach {
  const verified = verifiedRoleHistories[historyKey(coach.name)];
  if (!verified?.appointments.length) return coach;
  const appointments = sortAppointments(verified.appointments);
  const roles = coreRoles(appointments, coach.roles);
  return { ...coach, roles, specialty: specialty(roles), origin: appointments[0]?.team ?? coach.origin, summary: `${coach.firstYear}年以降、NFLで${roles.join("・")}を経験。`, sourceUrl: verified.sourceUrls[0] ?? coach.sourceUrl, appointments };
}
function fromRegistry(record: RegistryCoach): Coach {
  const featured = featuredByName.get(normalize(record.name));
  const verified = verifiedRoleHistories[historyKey(record.name)];
  const appointments = sortAppointments(verified?.appointments?.length ? verified.appointments : [...record.records.map((item) => ({ team: item.team, years: item.years, role: item.role, sourceUrl: item.sourceUrl })), ...(stcHistories[normalize(record.name)] ?? [])] as Appointment[]);
  const roles = coreRoles(appointments, record.roles);
  return { id: record.id, name: record.name, japanese: featured?.japanese ?? record.name, roles, specialty: specialty(roles), firstYear: record.firstYear, era: decade(record.firstYear), origin: appointments[0]?.team ?? "NFL", summary: `${record.firstYear}年以降、NFLで${roles.join("・")}を経験。`, relationship: "多世代ツリーの確認済み接続を通じて収録。", sourceUrl: verified?.sourceUrls?.[0] ?? record.records[0]?.sourceUrl ?? "https://www.pro-football-reference.com/coaches/", appointments };
}
function resolve(name: string): Coach | undefined {
  const key = normalize(name);
  if (mapExcludedCoachNames.has(key)) return undefined;
  const expanded = extraByName.get(key);
  const registry = registryByName.get(key);
  const candidate = expanded ? enrichCoach(expanded) : (registry ? fromRegistry(registry) : undefined);
  return candidate?.roles.includes("HC") ? candidate : undefined;
}

const allRelations = multiGenerationRelations.flatMap((edge) => {
  const parent = resolve(edge.parent); const child = resolve(edge.child);
  if (!parent || !child) return [];
  return [{ ...edge, from: parent.id, to: child.id }];
});
const allCoachById = new Map<string, Coach>();
for (const root of lineageRoots) {
  const coach = resolve(root.root);
  if (coach) allCoachById.set(coach.id, coach);
}
for (const edge of allRelations) { const parent = resolve(edge.parent); const child = resolve(edge.child); if (parent) allCoachById.set(parent.id, parent); if (child) allCoachById.set(child.id, child); }

const hierarchyRelationKinds = new Set<RelationKind>(["direct"]);

function descendants(rootId: string) {
  const ids = new Set<string>([rootId]); const depth = new Map<string, number>([[rootId, 0]]); const queue = [rootId];
  while (queue.length) { const current = queue.shift(); if (!current) break; for (const edge of allRelations.filter((item) => item.from === current && hierarchyRelationKinds.has(item.kind))) { if (!ids.has(edge.to)) { ids.add(edge.to); depth.set(edge.to, (depth.get(current) ?? 0) + 1); queue.push(edge.to); } } }
  return { ids, depth };
}

export const centralAtlasTrees: CentralAtlasTree[] = lineageRoots.flatMap((root) => {
  const rootCoach = resolve(root.root); if (!rootCoach) return [];
  const graph = descendants(rootCoach.id); const nodes = Array.from(graph.ids); const coaches = nodes.map((id) => allCoachById.get(id)).filter((coach): coach is Coach => Boolean(coach));
  const years = coaches.flatMap((coach) => coach.appointments.flatMap((item) => item.years.match(/\d{4}/g) ?? []).map(Number));
  const stints = rootCoach.appointments.filter((item) => item.role === "HC").map((item) => ({ team: item.team, years: item.years }));
  return [{ id: root.id, rootId: rootCoach.id, label: root.label, japanese: root.japanese, years: years.length ? `${Math.min(...years)}–${Math.max(...years)}` : String(rootCoach.firstYear), teams: Array.from(new Set(coaches.flatMap((coach) => coach.appointments.map((item) => item.team)))).slice(0, 16), nodeIds: nodes, headCoachStints: stints }];
});

const connectedIds = new Set(centralAtlasTrees.flatMap((tree) => tree.nodeIds));
export const centralAtlasCoaches = Array.from(allCoachById.values()).filter((coach) => connectedIds.has(coach.id));
export const atlasCatalogCoaches = centralAtlasCoaches;

export const centralAtlasEdges: CentralAtlasEdge[] = centralAtlasTrees.flatMap((tree) => {
  const graph = descendants(tree.rootId);
  return allRelations.filter((edge) => graph.ids.has(edge.from) && graph.ids.has(edge.to)).map((edge) => ({ id: edge.id, from: edge.from, to: edge.to, team: edge.team, years: edge.years, note: edge.role, sourceUrl: edge.sourceUrl, relationType: edge.kind, generation: graph.depth.get(edge.to) ?? 1 }));
}).filter((edge, index, edges) => edges.findIndex((candidate) => candidate.from === edge.from && candidate.to === edge.to && candidate.team === edge.team) === index);

export const centralEdgeSources = new Map(centralAtlasEdges.map((edge) => [edge.id, [edge.sourceUrl]] as const));
