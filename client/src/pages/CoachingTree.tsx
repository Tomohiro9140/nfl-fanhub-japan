/**
 * Archive Atlas visual reminder: editorial data atlas; warm paper, midnight-navy ink,
 * route-map relationships; each primary view is a lineage plate with decade rails and evidence tabs.
 */
/* Archive Atlas reminder: Profile lineage choices act as compact provenance cards, directing the reader to one precise map context without duplicating nodes. */
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, TouchEvent as ReactTouchEvent, WheelEvent as ReactWheelEvent } from "react";
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  ChevronRight,
  CircleHelp,
  Filter,
  Layers3,
  Maximize2,
  Minimize2,
  RotateCcw,
  Route,
  Search,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import type { Appointment, CareerRole, Coach, LineageEdge, Role, StaffRole } from "@/data/coaches";
import { seasonStaffRecords, staffAlmanacRecords, allHcAlmanacCoaches, type SeasonStaffMember, type SeasonStaffRecord } from "@/data/lineageAtlas";
import { recordHasHeadCoach } from "@/data/allHcStaffAlmanac";
import { atlasCatalogCoaches, centralAtlasCoaches, centralAtlasEdges, centralAtlasTrees, type CentralAtlasEdge, type CentralAtlasTree } from "@/data/centralAtlas";
import { isProfileGlyphRole, loadProfileCareerHistories, profileHistoryKey } from "@/data/profileCareerData";
import { RelationEvidence } from "@/components/RelationEvidence";
import { EmbeddedAppNav } from "@/components/EmbeddedAppNav";
import { useIsMobile } from "@/hooks/useMobile";
import "@/components/coachingTreeBase.css";
import "@/components/atlasExtensions.css";
import "@/components/completeStaffAlmanac.css";
import "@/components/mapGestures.css";
import "@/components/relationRecordDeck.css";
import "@/components/profileMapControls.css";
import "@/components/relationInteraction.css";
import "@/components/mobileRelationClear.css";
import "@/components/pathfinderRefinement.css";
import "@/components/mobileAtlasRefinement.css";
import "@/components/profileDesktopFix.css";
import "@/components/expandedMapCanvas.css";
import "@/components/mobileLineageMap.css";
import "@/components/mobileStaffArchive.css";
import "@/components/directoryStatusAndPathRecords.css";
import "@/components/crossTreePathfinder.css";
import "@/components/coachingTreeRepair.css";
import "@/components/coachingTreeMobileClarity.css";

type View = "tree" | "directory" | "staff";
type MapPoint = { id: string; x: number; y: number; level: number; labelAlign: "left" | "right" };

const roleOrder: Role[] = ["HC", "OC", "DC"];
const indexRoleOrder: StaffRole[] = ["OC", "DC", "STC"];
const MAP_MIN_ZOOM = 0.3;
const MAP_MAX_ZOOM = 1.6;
const decades = ["すべて", "1980s", "1990s", "2000s", "2010s", "2020s"];
const hierarchyRelationTypes = new Set<CentralAtlasEdge["relationType"]>(["direct"]);
const splitRelationTeams = (teamValue: string) => teamValue.split("/").map((team) => team.trim()).filter(Boolean);
const teamOptions = Array.from(new Set(centralAtlasEdges.filter((edge) => hierarchyRelationTypes.has(edge.relationType)).flatMap((edge) => splitRelationTeams(edge.team)))).sort((a, b) => a.localeCompare(b));

function roleClass(role: StaffRole) {
  return `role-${role.toLowerCase()}`;
}

function roleText(roles: Role[]) {
  return roleOrder.filter((role) => roles.includes(role)).join(" / ");
}

function roleGlyph(role: StaffRole) {
  return role === "HC" ? "●" : role === "OC" ? "◆" : role === "DC" ? "■" : "✣";
}

function profileRoleClass(role: CareerRole) {
  return isProfileGlyphRole(role) ? roleClass(role) : "role-other";
}

function appointmentYearsInclude(years: string, season: number) {
  const values = (years.match(/\d{4}/g) ?? []).map(Number);
  if (!values.length) return false;
  const start = values[0];
  const end = /present|current/i.test(years) ? 9999 : values.at(-1) ?? start;
  return season >= start && season <= end;
}

function profileStatus(appointments: Appointment[]) {
  const current = appointments.filter((appointment) => {
    if (/present|current|[–-]\s*$/i.test(appointment.years)) return true;
    const years = (appointment.years.match(/\d{4}/g) ?? []).map(Number);
    return (years.at(-1) ?? 0) >= 2026;
  });
  if (current.length) {
    const appointment = current.at(-1)!;
    return { state: "current" as const, label: "現職", detail: appointment.team, appointment };
  }
  return null;
}

function matchingStaffAlmanacRecord(coachName: string, appointment: Appointment) {
  if (appointment.role !== "HC") return undefined;
  const candidates = staffAlmanacRecords.filter((record) => record.team === appointment.team && appointmentYearsInclude(appointment.years, record.season));
  return candidates.find((record) => recordHasHeadCoach(record, coachName));
}

function ProfileAppointment({ coachName, appointment, onOpenAlmanac }: { coachName: string; appointment: Appointment; onOpenAlmanac: (appointment: Appointment) => void }) {
  const almanacRecord = matchingStaffAlmanacRecord(coachName, appointment);
  const displayTitle = appointment.title ?? (appointment.role === "STC" ? "Special Teams Coordinator" : appointment.role);
  return <div className="appointment" key={`${appointment.years}-${appointment.team}-${appointment.role}-${appointment.title ?? ""}`}><time>{appointment.years}</time><span>{appointment.team}</span><div className="appointment-duty"><b className={profileRoleClass(appointment.role)}>{isProfileGlyphRole(appointment.role) && <i className={`profile-role-glyph ${roleClass(appointment.role)}`} aria-hidden="true">{roleGlyph(appointment.role)}</i>}{displayTitle}</b>{almanacRecord && <button type="button" className="appointment-almanac-link" onClick={() => onOpenAlmanac(appointment)} aria-label={`${appointment.team} ${almanacRecord.season}のスタッフ年鑑を開く`}>年鑑 <ArrowUpRight size={12} /></button>}</div></div>;
}

function TeamStaffSeasonCard({ record, roleChanges, onOpenMember }: { record: SeasonStaffRecord; roleChanges: StaffRole[]; onOpenMember: (member: SeasonStaffMember) => void }) {
  return <article className={`team-staff-season ${roleChanges.length ? "has-role-change" : ""}`} aria-label={`${record.season}年 ${record.team}のスタッフ`}><header><time>{record.season}</time><span>{record.team}</span>{roleChanges.length > 0 && <em>{roleChanges.map((role) => `${role}交代`).join(" · ")}</em>}</header><div className="team-staff-members">{record.members.map((member) => { const profileId = member.id ?? centralAtlasCoaches.find((coach) => coach.name === member.name)?.id; const profileMember = profileId ? { ...member, id: profileId } : member; const roleChanged = roleChanges.includes(member.role); return <div key={`${member.name}-${member.role}`} className={`team-staff-member ${roleClass(member.role)} ${roleChanged ? "is-role-change" : ""}`}><span className="team-staff-role-mark" aria-hidden="true">{roleGlyph(member.role)}</span><small>{member.role}</small>{profileId ? <button type="button" onClick={() => onOpenMember(profileMember)} aria-label={`${member.name}のProfileを開く`}>{member.name}<ArrowUpRight size={12} /></button> : <strong>{member.name}</strong>}</div>; })}</div></article>;
}

function firstHeadCoachYear(coach: Coach) {
  const years = coach.appointments
    .filter((appointment) => appointment.role === "HC")
    .flatMap((appointment) => appointment.years.match(/\d{4}/g) ?? [])
    .map(Number);
  return years.length ? Math.min(...years) : coach.firstYear;
}

function edgeKey(from: string, to: string) {
  return [from, to].sort().join("--");
}

function edgeMatchesEra(edge: LineageEdge, era: string) {
  if (era === "すべて") return true;
  const startOfEra = Number(era.slice(0, 4));
  const endOfEra = startOfEra + 9;
  const values = (edge.years.match(/\d{4}/g) ?? []).map(Number);
  for (let index = 0; index < values.length; index += 2) {
    const start = values[index];
    const end = values[index + 1] ?? (edge.years.trim().endsWith("–") ? 2029 : start);
    if (start <= endOfEra && end >= startOfEra) return true;
  }
  return false;
}

function shortestPath(startId: string, endId: string, edges: LineageEdge[]) {
  if (!startId || !endId) return null;
  if (startId === endId) return [startId];
  const graph = new Map<string, string[]>();
  edges.forEach(({ from, to }) => {
    graph.set(from, [...(graph.get(from) ?? []), to]);
    graph.set(to, [...(graph.get(to) ?? []), from]);
  });
  const queue: string[][] = [[startId]];
  const visited = new Set([startId]);
  while (queue.length) {
    const current = queue.shift();
    if (!current) break;
    const last = current[current.length - 1];
    for (const neighbor of graph.get(last) ?? []) {
      if (visited.has(neighbor)) continue;
      const candidate = [...current, neighbor];
      if (neighbor === endId) return candidate;
      visited.add(neighbor);
      queue.push(candidate);
    }
  }
  return null;
}

function shortestEdgePath(startId: string, endId: string, edges: CentralAtlasEdge[]) {
  if (!startId || !endId) return null;
  if (startId === endId) return [];
  const graph = new Map<string, Array<{ id: string; edge: CentralAtlasEdge }>>();
  edges.forEach((edge) => {
    graph.set(edge.from, [...(graph.get(edge.from) ?? []), { id: edge.to, edge }]);
    graph.set(edge.to, [...(graph.get(edge.to) ?? []), { id: edge.from, edge }]);
  });
  const queue: Array<{ id: string; path: CentralAtlasEdge[] }> = [{ id: startId, path: [] }];
  const visited = new Set([startId]);
  while (queue.length) {
    const current = queue.shift();
    if (!current) break;
    for (const next of graph.get(current.id) ?? []) {
      if (visited.has(next.id)) continue;
      const path = [...current.path, next.edge];
      if (next.id === endId) return path;
      visited.add(next.id);
      queue.push({ id: next.id, path });
    }
  }
  return null;
}

function descendantTree(startId: string, edges: Array<LineageEdge & { id: string }>) {
  const ids = new Set<string>([startId]);
  const relationIds = new Set<string>();
  const queue = [startId];
  while (queue.length) {
    const current = queue.shift();
    if (!current) break;
    for (const edge of edges.filter((item) => item.from === current)) {
      relationIds.add(edge.id);
      if (!ids.has(edge.to)) { ids.add(edge.to); queue.push(edge.to); }
    }
  }
  return { ids, relationIds };
}

function buildMapPoints(tree: Pick<CentralAtlasTree, "rootId" | "nodeIds">, edges: LineageEdge[], mobileLayout = false) {
  const graph = new Map<string, string[]>();
  edges.forEach(({ from, to }) => {
    graph.set(from, [...(graph.get(from) ?? []), to]);
  });
  const levels = new Map<string, number>([[tree.rootId, 0]]);
  const queue = [tree.rootId];
  while (queue.length) {
    const current = queue.shift();
    if (!current) break;
    for (const next of graph.get(current) ?? []) {
      if (levels.has(next)) continue;
      levels.set(next, (levels.get(current) ?? 0) + 1);
      queue.push(next);
    }
  }
  tree.nodeIds.forEach((id) => {
    if (!levels.has(id)) levels.set(id, 2);
  });
  const maxLevel = Math.max(...Array.from(levels.values()), 1);
  const byLevel = new Map<number, string[]>();
  tree.nodeIds.forEach((id) => {
    const level = levels.get(id) ?? 2;
    byLevel.set(level, [...(byLevel.get(level) ?? []), id]);
  });
  const points: MapPoint[] = [];
  byLevel.forEach((ids, level) => {
    const laneCount = mobileLayout ? 1 : Math.max(1, Math.ceil(ids.length / 12));
    const rowsPerLane = Math.ceil(ids.length / laneCount);
    ids.forEach((id, index) => {
      const lane = Math.floor(index / rowsPerLane);
      const row = index % rowsPerLane;
      const baseX = level === 0 ? 6 : 12 + ((level / Math.max(maxLevel, 2)) * 78);
      const laneOffset = laneCount === 1 ? 0 : (lane - ((laneCount - 1) / 2)) * 5.5;
      const laneVerticalOffset = laneCount === 1 ? 0 : (lane - ((laneCount - 1) / 2)) * 3.2;
      const x = Math.max(6, Math.min(94, baseX + laneOffset));
      const baseY = mobileLayout
        ? (level === 0 ? 50 : 12 + ((row + 1) * (80 / (rowsPerLane + 1))))
        : (rowsPerLane === 1 ? 50 : 8 + ((row + 1) * (84 / (rowsPerLane + 1))));
      const y = Math.max(6, Math.min(94, baseY + laneVerticalOffset));
      points.push({ id, x, y, level, labelAlign: x > 78 ? "left" : "right" });
    });
  });
  return points;
}

function mapCurve(from: MapPoint, to: MapPoint) {
  const fx = from.x * 10;
  const fy = from.y * 10;
  const tx = to.x * 10;
  const ty = to.y * 10;
  const bend = Math.max(80, (tx - fx) * 0.48);
  return `M${fx} ${fy} C${fx + bend} ${fy}, ${tx - bend} ${ty}, ${tx} ${ty}`;
}

function CoachDot({ coach, point, active, onPath, parentFocused = false, profileFocused = false, muted, onSelect, onHover = () => {}, onLeave = () => {} }: { coach: Coach; point: MapPoint; active: boolean; onPath: boolean; parentFocused?: boolean; profileFocused?: boolean; muted: boolean; onSelect: () => void; onHover?: () => void; onLeave?: () => void }) {
  const dominantRole = coach.roles.includes("HC") ? "HC" : coach.roles[0];
  const nodeClass = `${roleClass(dominantRole)} ${active ? "is-active" : ""} ${onPath ? "is-on-path" : ""} ${parentFocused ? "is-parent-focus" : ""} ${profileFocused ? "is-profile-focus" : ""} ${muted ? "is-muted" : ""}`;
  return (
    <div className={`coach-node label-${point.labelAlign} ${nodeClass}`} style={{ left: `${point.x}%`, top: `${point.y}%` }}>
      <button
        type="button"
        className={`coach-dot ${nodeClass}`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => { event.stopPropagation(); onSelect(); }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onFocus={onHover}
        onBlur={onLeave}
        aria-label={`${coach.japanese}を選択`}
      >
        <span className="coach-dot-marker"><i aria-hidden="true">{roleGlyph(dominantRole)}</i></span>
      </button>
      <span className="coach-dot-copy" aria-hidden="true"><span>{coach.name}</span></span>
    </div>
  );
}

function relationSeason(edge: LineageEdge) {
  return seasonStaffRecords.find((record) => {
    const names = new Set(record.members.map((member) => member.id).filter(Boolean));
    const samePeople = names.has(edge.from) && names.has(edge.to);
    return samePeople && edge.team.includes(record.team);
  });
}

function relationRoleLabel(edge: LineageEdge, coachId: string, member?: SeasonStaffMember) {
  if (coachId === edge.to && edge.note) return edge.note;
  if (member) return member.contemporaneousRole;
  const coach = centralAtlasCoaches.find((item) => item.id === coachId);
  if (!coach) return edge.note || "スタッフ期";
  const edgeYears = (edge.years.match(/\d{4}/g) ?? []).map(Number);
  const edgeStart = edgeYears[0] ?? 0;
  const edgeEnd = edgeYears[1] ?? edgeStart;
  const roleAtAppointment = coach.appointments.find((appointment) => {
    if (!edge.team.includes(appointment.team)) return false;
    const appointmentYears = (appointment.years.match(/\d{4}/g) ?? []).map(Number);
    const appointmentStart = appointmentYears[0] ?? 0;
    const appointmentEnd = appointmentYears[1] ?? appointmentStart;
    return appointmentStart <= edgeEnd && appointmentEnd >= edgeStart;
  });
  return roleAtAppointment?.title ?? roleAtAppointment?.role ?? roleText(coach.roles);
}

function conciseRoleFromNote(note?: string) {
  if (!note) return undefined;
  const japaneseRole = note.split("、").at(-1)?.replace(/^.*?は/, "").trim();
  const englishRole = japaneseRole?.split(/\s+on\s+/i)[0]?.trim();
  return englishRole || undefined;
}

function relationRoleOnlyLabel(edge: LineageEdge, coachId: string, member?: SeasonStaffMember, detailedAppointments?: Appointment[]) {
  if (member) return member.contemporaneousRole;
  const coach = centralAtlasCoaches.find((item) => item.id === coachId);
  if (!coach) return conciseRoleFromNote(coachId === edge.to ? edge.note : undefined) ?? "役職記録なし";
  const edgeYears = (edge.years.match(/\d{4}/g) ?? []).map(Number);
  const edgeStart = edgeYears[0] ?? 0;
  const edgeEnd = edgeYears[1] ?? edgeStart;
  const appointments = detailedAppointments?.length ? detailedAppointments : coach.appointments;
  const roleAtAppointment = appointments.find((appointment) => {
    if (!edge.team.includes(appointment.team)) return false;
    const appointmentYears = (appointment.years.match(/\d{4}/g) ?? []).map(Number);
    const appointmentStart = appointmentYears[0] ?? 0;
    const appointmentEnd = appointmentYears[1] ?? appointmentStart;
    return appointmentStart <= edgeEnd && appointmentEnd >= edgeStart;
  });
  return roleAtAppointment?.title ?? roleAtAppointment?.role ?? conciseRoleFromNote(coachId === edge.to ? edge.note : undefined) ?? roleText(coach.roles);
}

function initialAlmanacCoach() {
  const params = new URLSearchParams(window.location.search);
  return allHcAlmanacCoaches.find((coach) => coach.name === params.get("coach")) ?? allHcAlmanacCoaches.find((coach) => coach.id === "registry-bill-belichick") ?? allHcAlmanacCoaches[0];
}

export default function Home() {
  const isMobile = useIsMobile();
  const [view, setView] = useState<View>(() => new URLSearchParams(window.location.search).get("view") === "staff" ? "staff" : "tree");
  const [indexMode, setIndexMode] = useState<"directory" | "cross-tree">(() => new URLSearchParams(window.location.search).get("index") === "cross" ? "cross-tree" : "directory");
  const [query, setQuery] = useState("");
  const [activeRole, setActiveRole] = useState<StaffRole | "ALL">("ALL");
  const [activeEmployment, setActiveEmployment] = useState<"NONE" | "CURRENT_HC" | "CURRENT">("NONE");
  const [directoryEra, setDirectoryEra] = useState("すべて");
  const [routeEra, setRouteEra] = useState("すべて");
  const [routeTeam, setRouteTeam] = useState("すべて");
  const activeTeam = routeTeam;
  const setActiveTeam = setRouteTeam;
  const [activeTreeId, setActiveTreeId] = useState("walsh");
  const [selectedId, setSelectedId] = useState("tree-bill-walsh");
  const [selectedRelationKey, setSelectedRelationKey] = useState("");
  const [mapRelationKey, setMapRelationKey] = useState("");
  const [hoveredRelationId, setHoveredRelationId] = useState("");
  const [showMethod, setShowMethod] = useState(false);
  const [pathStartId, setPathStartId] = useState("");
  const [pathEndId, setPathEndId] = useState("");
  const [isMapSearchOpen, setIsMapSearchOpen] = useState(() => new URLSearchParams(window.location.search).get("mapSearch") === "open");
  const [crossPathStartId, setCrossPathStartId] = useState("");
  const [crossPathEndId, setCrossPathEndId] = useState("");
  const [crossCoachQuery, setCrossCoachQuery] = useState("");
  const [staffCoachId, setStaffCoachId] = useState(() => initialAlmanacCoach().id);
  const [staffRecordId, setStaffRecordId] = useState(() => initialAlmanacCoach().records[0]?.id ?? "");
  const [profileCareerHistories, setProfileCareerHistories] = useState<Record<string, Appointment[]>>({});
  const [highlightRootId, setHighlightRootId] = useState("");
  const [profileMapFocusId, setProfileMapFocusId] = useState("");
  const [hoveredCoachId, setHoveredCoachId] = useState("");
  const [dismissedRootOfferId, setDismissedRootOfferId] = useState("");
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [showPathHighlight, setShowPathHighlight] = useState(true);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [isMapDragging, setIsMapDragging] = useState(false);
  const mapStageRef = useRef<HTMLDivElement>(null);
  const mapViewportRef = useRef<HTMLDivElement>(null);
  const pinchStartRef = useRef<{ distance: number; zoom: number; pan: { x: number; y: number }; focal: { x: number; y: number } } | null>(null);
  const isPinchingRef = useRef(false);
  const mapDragRef = useRef<{ pointerId: number; x: number; y: number; panX: number; panY: number; moved: boolean; pendingRelation?: CentralAtlasEdge } | null>(null);
  const suppressRelationClickRef = useRef(false);
  const mapPanRef = useRef({ x: 0, y: 0 });
  const mapZoomRef = useRef(1);
  const selectedRelationKeyRef = useRef("");
  const handledTouchRelationRef = useRef("");

  const activeTree = centralAtlasTrees.find((tree) => tree.id === activeTreeId) ?? centralAtlasTrees[0];
  const lineagePlateTrees = useMemo(() => [...centralAtlasTrees].sort((left, right) => {
    const leftCoach = centralAtlasCoaches.find((coach) => coach.id === left.rootId);
    const rightCoach = centralAtlasCoaches.find((coach) => coach.id === right.rootId);
    if (left.id === "walsh") return -1;
    if (right.id === "walsh") return 1;
    return (leftCoach ? firstHeadCoachYear(leftCoach) : Number.MAX_SAFE_INTEGER) - (rightCoach ? firstHeadCoachYear(rightCoach) : Number.MAX_SAFE_INTEGER) || left.label.localeCompare(right.label, "en");
  }), []);
  const mapScale = activeTree.nodeIds.length <= 10 ? "compact" : activeTree.nodeIds.length <= 26 ? "medium" : activeTree.nodeIds.length <= 55 ? "large" : "xlarge";
  const activeTreeCoaches = useMemo(() => centralAtlasCoaches.filter((coach) => activeTree.nodeIds.includes(coach.id)).sort((a, b) => a.name.localeCompare(b.name, "en")), [activeTree.nodeIds]);
  const activeTreeEdges = useMemo(() => centralAtlasEdges.filter((edge) => hierarchyRelationTypes.has(edge.relationType) && activeTree.nodeIds.includes(edge.from) && activeTree.nodeIds.includes(edge.to)), [activeTree]);
  const useMobileSpaciousMap = isMobile && activeTree.nodeIds.length > 10;
  const relationTeams = useMemo(() => Array.from(new Set(activeTreeEdges.flatMap((edge) => splitRelationTeams(edge.team)))).sort((a, b) => a.localeCompare(b)), [activeTreeEdges]);
  const mapInteractionEdges = useMemo(() => [...activeTreeEdges].sort((a, b) => Number(a.id === selectedRelationKey) - Number(b.id === selectedRelationKey)), [activeTreeEdges, selectedRelationKey]);
  const mapPoints = useMemo(() => buildMapPoints(activeTree, activeTreeEdges, useMobileSpaciousMap), [activeTree, activeTreeEdges, useMobileSpaciousMap]);
  const getMapCanvasSize = () => {
    if (isMobile) {
      if (mapScale === "compact") return { width: 1100, height: 1050 };
      if (mapScale === "medium") return { width: 1500, height: 1650 };
      if (mapScale === "large") return { width: 1900, height: 2050 };
      return { width: 2200, height: 2300 };
    }
    if (mapScale === "compact") return { width: 900, height: 620 };
    if (mapScale === "medium") return { width: 1240, height: 840 };
    if (mapScale === "large") return { width: 1520, height: 1080 };
    return { width: 1720, height: 1260 };
  };
  const getFittedMapZoom = () => {
    const viewport = mapViewportRef.current;
    if (!viewport) return 1;
    const { height } = getMapCanvasSize();
    return Math.min(MAP_MAX_ZOOM, Math.max(MAP_MIN_ZOOM, Number((viewport.clientHeight / height).toFixed(2))));
  };
  const fitMapToViewport = (immediate = false) => {
    const zoom = getFittedMapZoom();
    applyMapZoom(zoom, immediate);
    applyMapPan({ x: 0, y: 0 }, immediate);
  };
  const getRootCenteredPan = (zoom = mapZoom) => {
    const viewport = mapViewportRef.current;
    const root = mapPoints.find((point) => point.id === activeTree.rootId);
    if (!viewport || !root) return { x: 0, y: 0 };
    const { width, height } = getMapCanvasSize();
    const rootX = width * (root.x / 100);
    const rootY = height * (root.y / 100);
    return {
      x: Math.round((viewport.clientWidth / 2) - (width / 2) - (zoom * (rootX - (width / 2)))),
      y: Math.round((viewport.clientHeight / 2) - (height / 2) - (zoom * (rootY - (height / 2)))),
    };
  };
  const getPositionPreservingPan = (nextZoom: number, currentZoom: number) => {
    const viewport = mapViewportRef.current;
    if (!viewport || currentZoom <= 0) return mapPanRef.current;
    const { width, height } = getMapCanvasSize();
    const originX = 0;
    const originY = 0;
    const focusX = (viewport.clientWidth / 2) - mapPanRef.current.x - originX;
    const focusY = (viewport.clientHeight / 2) - mapPanRef.current.y - originY;
    return {
      x: Math.round((viewport.clientWidth / 2) - originX - ((focusX * nextZoom) / currentZoom)),
      y: Math.round((viewport.clientHeight / 2) - originY - ((focusY * nextZoom) / currentZoom)),
    };
  };
  function applyMapPan(nextPan: { x: number; y: number }, immediate = false) {
    mapPanRef.current = nextPan;
    const viewport = mapViewportRef.current;
    viewport?.style.setProperty("--map-pan-x", `${nextPan.x}px`);
    viewport?.style.setProperty("--map-pan-y", `${nextPan.y}px`);
    if (immediate) setMapPan(nextPan);
  }
  function applyMapZoom(nextZoom: number, immediate = false) {
    mapZoomRef.current = nextZoom;
    mapViewportRef.current?.style.setProperty("--map-zoom", String(nextZoom));
    if (immediate) setMapZoom(nextZoom);
  }
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const viewport = mapViewportRef.current;
      if (viewport) {
        viewport.scrollLeft = 0;
        viewport.scrollTop = 0;
      }
      fitMapToViewport(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeTree.id, isMobile]);
  const parentLineages = useMemo(() => {
    const incoming = centralAtlasEdges
      .filter((edge) => edge.to === activeTree.rootId)
      .sort((a, b) => a.years.localeCompare(b.years));
    const candidates = incoming.flatMap((edge) => centralAtlasTrees
      .filter((tree) => tree.id !== activeTree.id && tree.nodeIds.includes(edge.from))
      .flatMap((tree) => {
        const coach = centralAtlasCoaches.find((candidate) => candidate.id === tree.rootId);
        return coach ? [{ tree, coach, relationType: edge.relationType }] : [];
      }));
    return candidates.filter((candidate, index) => candidates.findIndex((item) => item.tree.id === candidate.tree.id) === index);
  }, [activeTree.id, activeTree.rootId]);
  const lineageParentTreeIdByTreeId = useMemo(() => {
    const parents = new Map<string, string>();
    centralAtlasTrees.forEach((tree) => {
      const parent = centralAtlasEdges
        .filter((edge) => hierarchyRelationTypes.has(edge.relationType) && edge.to === tree.rootId)
        .flatMap((edge) => centralAtlasTrees.filter((candidate) => candidate.id !== tree.id && candidate.nodeIds.includes(edge.from)))
        .sort((left, right) => left.years.localeCompare(right.years) || left.nodeIds.length - right.nodeIds.length)[0];
      if (parent) parents.set(tree.id, parent.id);
    });
    return parents;
  }, []);
  const lineageDepthByTreeId = useMemo(() => {
    const depths = new Map<string, number>();
    centralAtlasTrees.forEach((tree) => {
      let depth = 0;
      let currentId = tree.id;
      const visited = new Set<string>([currentId]);
      while (lineageParentTreeIdByTreeId.has(currentId)) {
        const parentId = lineageParentTreeIdByTreeId.get(currentId)!;
        if (visited.has(parentId)) break;
        visited.add(parentId);
        depth += 1;
        currentId = parentId;
      }
      depths.set(tree.id, depth);
    });
    return depths;
  }, [lineageParentTreeIdByTreeId]);
  const profileLineageLocations = useMemo(() => {
    return centralAtlasTrees
      .filter((tree) => tree.nodeIds.includes(selectedId))
      .map((tree) => {
        const edge = centralAtlasEdges
          .filter((candidate) => hierarchyRelationTypes.has(candidate.relationType) && tree.nodeIds.includes(candidate.from) && tree.nodeIds.includes(candidate.to) && (candidate.from === selectedId || candidate.to === selectedId))
          .sort((a, b) => a.years.localeCompare(b.years))[0];
        const rootCoach = centralAtlasCoaches.find((coach) => coach.id === tree.rootId);
        return { tree, edge, rootName: rootCoach?.name ?? tree.label, depth: lineageDepthByTreeId.get(tree.id) ?? 0 };
      })
      .sort((a, b) => a.depth - b.depth || a.tree.years.localeCompare(b.tree.years) || a.tree.nodeIds.length - b.tree.nodeIds.length);
  }, [lineageDepthByTreeId, selectedId]);
  const activeRootPoint = mapPoints.find((point) => point.id === activeTree.rootId);
  const filteredEdges = useMemo(() => activeTreeEdges.filter((edge) => (routeTeam === "すべて" || splitRelationTeams(edge.team).includes(routeTeam)) && edgeMatchesEra(edge, routeEra)), [activeTreeEdges, routeEra, routeTeam]);
  const isRelationFilterActive = routeTeam !== "すべて" || routeEra !== "すべて";
  const filteredRelationIds = useMemo(() => new Set(filteredEdges.map((edge) => edge.id)), [filteredEdges]);
  const relationFilterCaption = [routeTeam !== "すべて" ? routeTeam : "", routeEra !== "すべて" ? routeEra : ""].filter(Boolean).join(" · ");
  const hasPathSelection = Boolean(pathStartId && pathEndId);
  const activePath = useMemo(() => hasPathSelection ? shortestPath(pathStartId, pathEndId, filteredEdges) : null, [filteredEdges, hasPathSelection, pathEndId, pathStartId]);
  const activePathIds = new Set(activePath ?? []);
  const activePathEdges = new Set((activePath ?? []).slice(1).map((id, index) => edgeKey(activePath?.[index] ?? "", id)));
  const pathRelationEdges = useMemo(() => {
    if (!activePath) return [];
    return activePath.slice(1).flatMap((to, index) => {
      const from = activePath[index];
      return filteredEdges.filter((edge) => edgeKey(edge.from, edge.to) === edgeKey(from, to));
    });
  }, [activePath, filteredEdges]);
  const selectedRelation = activeTreeEdges.find((edge) => edge.id === selectedRelationKey);
  const mapSelectedRelation = activeTreeEdges.find((edge) => edge.id === mapRelationKey);
  const relationRecordEntries = useMemo(() => {
    const records = pathRelationEdges.map((edge, index) => ({ edge, origin: mapRelationKey === edge.id ? `MAP TAP · HOP ${index + 1}` : `PATHFINDER · HOP ${index + 1}` }));
    if (mapSelectedRelation && !records.some((record) => record.edge.id === mapSelectedRelation.id)) records.push({ edge: mapSelectedRelation, origin: "MAP TAP" });
    return records;
  }, [mapRelationKey, mapSelectedRelation, pathRelationEdges]);
  const selectedRelationSeason = selectedRelation ? relationSeason(selectedRelation) : undefined;
  const selectedBase = centralAtlasCoaches.find((coach) => coach.id === selectedId) ?? atlasCatalogCoaches.find((coach) => coach.id === selectedId) ?? activeTreeCoaches[0] ?? centralAtlasCoaches[0];
  const selectedCareer = profileCareerHistories[profileHistoryKey(selectedBase.name)];
  const selected = selectedCareer?.length ? { ...selectedBase, appointments: selectedCareer } : selectedBase;
  const selectedStatus = profileStatus(selected.appointments);
  const visibleIds = new Set(activeTreeCoaches.map((coach) => coach.id));
  const activeHighlightId = hoveredCoachId || highlightRootId;
  const descendantFocus = useMemo(() => activeHighlightId && activeTree.nodeIds.includes(activeHighlightId) ? descendantTree(activeHighlightId, activeTreeEdges) : { ids: new Set<string>(), relationIds: new Set<string>() }, [activeHighlightId, activeTree.nodeIds, activeTreeEdges]);
  const immediateParentFocus = useMemo(() => {
    if (!activeHighlightId || !activeTree.nodeIds.includes(activeHighlightId)) return { ids: new Set<string>(), relationIds: new Set<string>() };
    const parentEdge = activeTreeEdges.find((edge) => edge.to === activeHighlightId);
    return parentEdge ? { ids: new Set([parentEdge.from]), relationIds: new Set([parentEdge.id]) } : { ids: new Set<string>(), relationIds: new Set<string>() };
  }, [activeHighlightId, activeTree.nodeIds, activeTreeEdges]);
  const lineageFocusIds = useMemo(() => new Set([...Array.from(descendantFocus.ids), ...Array.from(immediateParentFocus.ids)]), [descendantFocus.ids, immediateParentFocus.ids]);
  const lineageFocusRelationIds = useMemo(() => new Set([...Array.from(descendantFocus.relationIds), ...Array.from(immediateParentFocus.relationIds)]), [descendantFocus.relationIds, immediateParentFocus.relationIds]);
  const isLineageFocus = Boolean(activeHighlightId && lineageFocusIds.size);
  const selectedRootLineage = useMemo(() => centralAtlasTrees.find((tree) => tree.rootId === selectedId && tree.id !== activeTree.id && activeTree.nodeIds.includes(selectedId)), [activeTree.id, activeTree.nodeIds, selectedId]);
  const visibleMapPoints = mapPoints;
  const visibleMapIds = new Set(visibleMapPoints.map((point) => point.id));
  const hcCount = centralAtlasCoaches.filter((coach) => coach.roles.includes("HC")).length;
  const coordinatorCount = centralAtlasCoaches.filter((coach) => coach.roles.includes("OC") || coach.roles.includes("DC")).length;
  const filteredCoaches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return atlasCatalogCoaches.filter((coach) => {
      const matchQuery = !normalized || coach.name.toLowerCase().includes(normalized);
      const matchRole = activeRole === "ALL" || coach.appointments.some((appointment) => appointment.role === activeRole);
      const matchEra = directoryEra === "すべて" || `${Math.floor(firstHeadCoachYear(coach) / 10) * 10}s` === directoryEra;
      const career = profileCareerHistories[profileHistoryKey(coach.name)] ?? coach.appointments;
      const currentAppointment = profileStatus(career)?.appointment;
      const matchEmployment = activeEmployment === "NONE"
        || (activeEmployment === "CURRENT_HC" && currentAppointment?.role === "HC")
        || (activeEmployment === "CURRENT" && Boolean(currentAppointment));
      return matchQuery && matchRole && matchEra && matchEmployment;
    }).sort((a, b) => a.name.localeCompare(b.name, "en"));
  }, [activeEmployment, activeRole, directoryEra, profileCareerHistories, query]);
  const hasCrossTreeSearch = Boolean(crossPathStartId && crossPathEndId);
  const crossTreePath = useMemo(
    () => hasCrossTreeSearch ? shortestEdgePath(crossPathStartId, crossPathEndId, centralAtlasEdges) : null,
    [crossPathEndId, crossPathStartId, hasCrossTreeSearch],
  );
  const crossTreePathCoachIds = useMemo(() => {
    if (!crossTreePath) return [];
    return crossTreePath.reduce<string[]>((ids, edge) => [...ids, edge.from === ids.at(-1) ? edge.to : edge.from], [crossPathStartId]);
  }, [crossPathStartId, crossTreePath]);
  const crossTreeCoaches = useMemo(() => atlasCatalogCoaches.filter((coach) => {
    const matchEra = directoryEra === "すべて" || `${Math.floor(firstHeadCoachYear(coach) / 10) * 10}s` === directoryEra;
    const career = profileCareerHistories[profileHistoryKey(coach.name)] ?? coach.appointments;
    const currentAppointment = profileStatus(career)?.appointment;
    const matchEmployment = activeEmployment === "NONE"
      || (activeEmployment === "CURRENT_HC" && currentAppointment?.role === "HC")
      || (activeEmployment === "CURRENT" && Boolean(currentAppointment));
    return matchEra && matchEmployment;
  }).sort((a, b) => a.name.localeCompare(b.name, "en")), [activeEmployment, directoryEra, profileCareerHistories]);
  const crossTreeSearchedCoaches = useMemo(() => {
    const normalized = crossCoachQuery.trim().toLowerCase();
    return normalized ? crossTreeCoaches.filter((coach) => coach.name.toLowerCase().includes(normalized)) : crossTreeCoaches;
  }, [crossCoachQuery, crossTreeCoaches]);

  useEffect(() => {
    const eligibleIds = new Set(crossTreeCoaches.map((coach) => coach.id));
    if (crossPathStartId && !eligibleIds.has(crossPathStartId)) setCrossPathStartId("");
    if (crossPathEndId && !eligibleIds.has(crossPathEndId)) setCrossPathEndId("");
  }, [crossPathEndId, crossPathStartId, crossTreeCoaches]);
  const activeStaffCoach = allHcAlmanacCoaches.find((coach) => coach.id === staffCoachId) ?? allHcAlmanacCoaches[0];
  const staffRecordsForCoach = activeStaffCoach?.records ?? [];
  const activeStaffRecord = staffRecordsForCoach.find((record) => record.id === staffRecordId) ?? staffRecordsForCoach[0];
  const seasonTeamOptions = Array.from(new Set(staffRecordsForCoach.map((record) => record.team)));
  const staffRecordsForSelectedTeam = useMemo(() => staffRecordsForCoach.filter((record) => record.team === activeStaffRecord?.team).sort((a, b) => a.season - b.season), [activeStaffRecord?.team, staffRecordsForCoach]);
  const staffRoleChangesByRecordId = useMemo(() => {
    const changes = new Map<string, StaffRole[]>();
    staffRecordsForSelectedTeam.forEach((record, index) => {
      const previous = staffRecordsForSelectedTeam[index - 1];
      if (!previous) return;
      const changedRoles = (["OC", "DC"] as StaffRole[]).filter((role) => previous.members.find((member) => member.role === role)?.name !== record.members.find((member) => member.role === role)?.name);
      if (changedRoles.length) changes.set(record.id, changedRoles);
    });
    return changes;
  }, [staffRecordsForSelectedTeam]);
  const mapRange = (activeTree.years.match(/\d{4}/g) ?? []).map(Number);
  const mapStartYear = mapRange[0] ?? 1990;
  const mapEndYear = mapRange.at(-1) ?? 2026;
  const mapYearMarks = [0, 1 / 3, 2 / 3, 1].map((position) => ({ position, year: Math.round(mapStartYear + ((mapEndYear - mapStartYear) * position)) }));

  useEffect(() => {
    const syncFullscreen = () => setIsMapFullscreen(document.fullscreenElement === mapStageRef.current);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    selectedRelationKeyRef.current = selectedRelationKey;
  }, [selectedRelationKey]);

  useEffect(() => {
    let cancelled = false;
    loadProfileCareerHistories().then((histories) => {
      if (!cancelled) setProfileCareerHistories(histories);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  function chooseCoach(id: string, stayInCurrentTree = false) {
    const featured = atlasCatalogCoaches.find((coach) => coach.id === id);
    const atlasMatch = featured ? centralAtlasCoaches.find((coach) => coach.name === featured.name) : undefined;
    const nextId = atlasMatch?.id ?? id;
    const selectedCoach = centralAtlasCoaches.find((coach) => coach.id === nextId) ?? atlasCatalogCoaches.find((coach) => coach.id === id);
    const matchingAlmanacCoach = allHcAlmanacCoaches.find((coach) => coach.name === selectedCoach?.name);
    // Archive Atlas selection rule: an explicit coach selection owns the next almanac view;
    // stale map-edge state must never replace that coach with a prior relation's head coach.
    selectedRelationKeyRef.current = "";
    setSelectedRelationKey("");
    setMapRelationKey("");
    setProfileMapFocusId("");
    if (highlightRootId === nextId) {
      setHighlightRootId("");
      setHoveredCoachId("");
      setDismissedRootOfferId("");
      return;
    }
    const containingTree = centralAtlasTrees.filter((tree) => tree.nodeIds.includes(nextId)).sort((a, b) => a.nodeIds.length - b.nodeIds.length)[0];
    if (!stayInCurrentTree && containingTree && containingTree.id !== activeTree.id) selectTree(containingTree.id, nextId);
    setSelectedId(nextId);
    if (matchingAlmanacCoach) {
      setStaffCoachId(matchingAlmanacCoach.id);
      setStaffRecordId(matchingAlmanacCoach.records[0]?.id ?? "");
    }
    setHighlightRootId(nextId);
    setDismissedRootOfferId("");
    if (view === "directory") setView("tree");
  }

  function openSelectedRootLineage() {
    if (!selectedRootLineage) return;
    selectTree(selectedRootLineage.id, selectedId);
    setHighlightRootId(selectedId);
    setHoveredCoachId("");
    clearSelectedRelation();
    setDismissedRootOfferId("");
    setView("tree");
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => mapStageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })));
  }

  function openProfileLineage(location: typeof profileLineageLocations[number]) {
    selectTree(location.tree.id, selectedId);
    // プロフィールの位置カードは、その場所に対応する1本の関係線だけを示す。
    // 世代全体の黄色強調は、別の関係線まで関連しているように見せてしまうため解除する。
    setHighlightRootId("");
    setProfileMapFocusId(selectedId);
    setHoveredCoachId("");
    if (location.edge) {
      selectedRelationKeyRef.current = location.edge.id;
      setSelectedRelationKey(location.edge.id);
      setMapRelationKey(location.edge.id);
    } else {
      clearSelectedRelation();
    }
    setView("tree");
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => mapStageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })));
  }

  function selectTree(treeId: string, selectedCoachId?: string) {
    const tree = centralAtlasTrees.find((item) => item.id === treeId) ?? centralAtlasTrees[0];
    const firstEdge = centralAtlasEdges.find((edge) => edge.from === tree.rootId && tree.nodeIds.includes(edge.to)) ?? centralAtlasEdges.find((edge) => tree.nodeIds.includes(edge.from) && tree.nodeIds.includes(edge.to));
    const firstChild = firstEdge?.to ?? tree.nodeIds.find((id) => id !== tree.rootId) ?? tree.rootId;
    setActiveTreeId(tree.id);
    const preferredCoachId = selectedCoachId && tree.nodeIds.includes(selectedCoachId) ? selectedCoachId : tree.rootId;
    const preferredCoach = centralAtlasCoaches.find((coach) => coach.id === preferredCoachId);
    const preferredAlmanac = allHcAlmanacCoaches.find((coach) => coach.name === preferredCoach?.name);
    if (preferredAlmanac) {
      setStaffCoachId(preferredAlmanac.id);
      setStaffRecordId(preferredAlmanac.records[0]?.id ?? "");
    }
    setSelectedId(preferredCoachId);
    setPathStartId("");
    setPathEndId("");
    // 系譜プレートを開いた直後は、任意の先頭関係線を選択状態にしない。
    setSelectedRelationKey("");
    setMapRelationKey("");
    setProfileMapFocusId("");
    setHighlightRootId("");
    setHoveredCoachId("");
  }

  function selectStaffRecord(record?: SeasonStaffRecord) {
    if (!record) return;
    const owner = allHcAlmanacCoaches.find((coach) => coach.records.some((candidate) => candidate.id === record.id));
    if (owner) setStaffCoachId(owner.id);
    setStaffRecordId(record.id);
  }

  function openAppointmentInAlmanac(appointment: Appointment) {
    const record = matchingStaffAlmanacRecord(selected.name, appointment);
    if (!record) return;
    selectStaffRecord(record);
    setView("staff");
    window.requestAnimationFrame(() => document.getElementById("staff-rooms")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function staffRecordForMapRelation(relation: CentralAtlasEdge) {
    const years = (relation.years.match(/\d{4}/g) ?? []).map(Number);
    const start = years[0] ?? 0;
    const end = years[1] ?? start;
    const fromName = centralAtlasCoaches.find((coach) => coach.id === relation.from)?.name;
    const toName = centralAtlasCoaches.find((coach) => coach.id === relation.to)?.name;
    const candidates = staffAlmanacRecords.filter((record) => relation.team.includes(record.team) && record.season >= start && record.season <= end);
    // 系譜の矢印元を親として優先する。Cross Treeの関係を年鑑で開く時は、
    // 子コーチの所属先ではなく、その関係が成立した親HCのスタッフ表を表示する。
    return candidates.find((candidate) => fromName && recordHasHeadCoach(candidate, fromName))
      ?? candidates.find((candidate) => toName && recordHasHeadCoach(candidate, toName))
      ?? candidates[0];
  }

  function syncStaffAlmanacToMapRelation(relation?: CentralAtlasEdge) {
    const selectedAlmanac = allHcAlmanacCoaches.find((coach) => coach.name === selected.name);
    const record = relation ? staffRecordForMapRelation(relation) : selectedAlmanac?.records[0];
    selectStaffRecord(record);
  }

  function openSelectedMapRelationInAlmanac() {
    const explicitRelation = mapSelectedRelation ?? (hasPathSelection ? selectedRelation : undefined);
    syncStaffAlmanacToMapRelation(explicitRelation);
    setView("staff");
  }

  function openCrossTreeHop(edge: CentralAtlasEdge, targetId: string) {
    const relationTree = centralAtlasTrees
      .filter((tree) => tree.nodeIds.includes(edge.from) && tree.nodeIds.includes(edge.to))
      .sort((a, b) => a.nodeIds.length - b.nodeIds.length)[0];
    const targetTree = centralAtlasTrees
      .filter((tree) => tree.nodeIds.includes(targetId))
      .sort((a, b) => a.nodeIds.length - b.nodeIds.length)[0];
    const destinationTree = relationTree ?? targetTree;
    if (destinationTree) setActiveTreeId(destinationTree.id);
    setSelectedId(targetId);
    setProfileMapFocusId("");
    // Cross Treeのホップは、地図上に描ける当該関係線だけを青で示す。
    // targetId起点の黄色い系譜文脈は、クリックした接続と無関係な線まで強調するため使わない。
    setHighlightRootId("");
    setHoveredCoachId("");
    const canShowRelationOnMap = Boolean(relationTree && hierarchyRelationTypes.has(edge.relationType));
    selectedRelationKeyRef.current = canShowRelationOnMap ? edge.id : "";
    setSelectedRelationKey(canShowRelationOnMap ? edge.id : "");
    setMapRelationKey(canShowRelationOnMap ? edge.id : "");
    // 地図上の関係線を開いた時点で、スタッフ年鑑も同じ関係の親HCへ準備する。
    syncStaffAlmanacToMapRelation(edge);
    setView("tree");
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => mapStageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })));
  }

  function clearPathfinderFilters() {
    setPathStartId("");
    setPathEndId("");
    setRouteTeam("すべて");
    setRouteEra("すべて");
    setShowPathHighlight(false);
    setSelectedRelationKey("");
    setMapRelationKey("");
  }

  function chooseRelation(edge: CentralAtlasEdge, origin: "map" | "path" = "map") {
    if (origin === "map" && selectedRelationKeyRef.current === edge.id) {
      selectedRelationKeyRef.current = "";
      setSelectedRelationKey("");
      setMapRelationKey("");
      return;
    }
    selectedRelationKeyRef.current = edge.id;
    setSelectedRelationKey(edge.id);
    setProfileMapFocusId("");
    if (origin === "map") setMapRelationKey(edge.id);
    syncStaffAlmanacToMapRelation(edge);
    setSelectedId(edge.to);
  }

  function setRelationHover(relationId: string) {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setHoveredRelationId(relationId);
  }

  function clearSelectedRelation() {
    selectedRelationKeyRef.current = "";
    setSelectedRelationKey("");
    setMapRelationKey("");
  }

  function updateMapZoom(delta: number) {
    const currentZoom = mapZoomRef.current;
    const nextZoom = Math.min(MAP_MAX_ZOOM, Math.max(MAP_MIN_ZOOM, Number((currentZoom + delta).toFixed(2))));
    applyMapPan(getPositionPreservingPan(nextZoom, currentZoom), true);
    applyMapZoom(nextZoom, true);
  }

  function resetMapView() {
    fitMapToViewport(true);
    setHighlightRootId("");
    setProfileMapFocusId("");
    setHoveredCoachId("");
    setSelectedRelationKey("");
    setMapRelationKey("");
    setShowPathHighlight(false);
  }

  function setBoundedMapZoom(nextZoom: number) {
    const currentZoom = mapZoomRef.current;
    const boundedZoom = Math.min(MAP_MAX_ZOOM, Math.max(MAP_MIN_ZOOM, Number(nextZoom.toFixed(2))));
    applyMapPan(getPositionPreservingPan(boundedZoom, currentZoom), true);
    applyMapZoom(boundedZoom, true);
  }

  function handleMapWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (event.deltaY === 0) return;
    event.preventDefault();
    updateMapZoom(event.deltaY < 0 ? 0.08 : -0.08);
  }

  function endMapDrag() {
    setMapPan(mapPanRef.current);
    mapDragRef.current = null;
    setIsMapDragging(false);
  }

  function handleMapPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.pointerType === "touch" && !event.isPrimary) return;
    if (isPinchingRef.current || (event.target as HTMLElement).closest("button, a, input, select")) return;
    if (!mapViewportRef.current) return;
    if (event.pointerType === "touch") event.preventDefault();
    const pendingRelation = (event.target as SVGElement).closest?.(".tree-relation-hit-area")?.getAttribute("data-relation-id");
    mapDragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, panX: mapPanRef.current.x, panY: mapPanRef.current.y, moved: false, pendingRelation: pendingRelation ? activeTreeEdges.find((edge) => edge.id === pendingRelation) : undefined };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleMapPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = mapDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || isPinchingRef.current) return;
    const deltaX = event.clientX - drag.x;
    const deltaY = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(deltaX, deltaY) < 10) return;
    if (!drag.moved) {
      drag.moved = true;
      drag.pendingRelation = undefined;
      setIsMapDragging(true);
    }
    event.preventDefault();
    applyMapPan({ x: drag.panX + deltaX, y: drag.panY + deltaY });
  }

  function handleMapPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = mapDragRef.current;
    if (drag?.pointerId === event.pointerId) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      endMapDrag();
      if (drag.moved || drag.pendingRelation) {
        suppressRelationClickRef.current = true;
        window.setTimeout(() => { suppressRelationClickRef.current = false; }, 80);
      }
      if (!drag.moved && drag.pendingRelation) chooseRelation(drag.pendingRelation);
    }
  }

  function touchDistance(event: ReactTouchEvent<HTMLDivElement>) {
    const first = event.touches.item(0);
    const second = event.touches.item(1);
    if (!first || !second) return null;
    return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
  }

  function touchFocalPoint(event: ReactTouchEvent<HTMLDivElement>) {
    const first = event.touches.item(0);
    const second = event.touches.item(1);
    const viewport = mapViewportRef.current;
    if (!first || !second || !viewport) return null;
    const bounds = viewport.getBoundingClientRect();
    return { x: ((first.clientX + second.clientX) / 2) - bounds.left, y: ((first.clientY + second.clientY) / 2) - bounds.top };
  }

  function handleMapTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
    const distance = touchDistance(event);
    const focal = touchFocalPoint(event);
    if (!distance || !focal) {
      isPinchingRef.current = false;
      return;
    }
    isPinchingRef.current = true;
    endMapDrag();
    pinchStartRef.current = { distance, zoom: mapZoomRef.current, pan: mapPanRef.current, focal };
  }

  function handleMapTouchMove(event: ReactTouchEvent<HTMLDivElement>) {
    const distance = touchDistance(event);
    const focal = touchFocalPoint(event);
    const pinchStart = pinchStartRef.current;
    if (!distance || !focal || !pinchStart) return;
    event.preventDefault();
    const nextZoom = Math.min(MAP_MAX_ZOOM, Math.max(MAP_MIN_ZOOM, Number((pinchStart.zoom * (distance / pinchStart.distance)).toFixed(2))));
    const { width, height } = getMapCanvasSize();
    const originX = 0;
    const originY = 0;
    const localFocal = { x: (pinchStart.focal.x - pinchStart.pan.x - originX) / pinchStart.zoom, y: (pinchStart.focal.y - pinchStart.pan.y - originY) / pinchStart.zoom };
    applyMapPan({ x: Math.round(focal.x - originX - (localFocal.x * nextZoom)), y: Math.round(focal.y - originY - (localFocal.y * nextZoom)) });
    applyMapZoom(nextZoom);
  }

  function resetPinchGesture() {
    pinchStartRef.current = null;
    isPinchingRef.current = false;
    setMapZoom(mapZoomRef.current);
    setMapPan(mapPanRef.current);
  }

  function toggleMapFullscreen() {
    const stage = mapStageRef.current;
    if (!stage) return;
    if (document.fullscreenElement === stage) document.exitFullscreen().catch(() => undefined);
    else stage.requestFullscreen().catch(() => undefined);
  }

  function chooseStaffRecord(record: SeasonStaffRecord) {
    setStaffRecordId(record.id);
    const tree = centralAtlasTrees.find((item) => item.id === record.lineageId);
    if (tree && tree.id !== activeTreeId) selectTree(tree.id);
  }

  function openStaffMember(member: SeasonStaffMember) {
    if (!member.id) return;
    chooseCoach(member.id);
    const relation = activeTreeEdges.find((edge) => edge.from === member.id || edge.to === member.id);
    if (relation) setSelectedRelationKey(relation.id);
  }

  const relationMember = (id: string) => selectedRelationSeason?.members.find((member) => member.id === id);
  const relationFrom = selectedRelation ? centralAtlasCoaches.find((coach) => coach.id === selectedRelation.from) : undefined;
  const relationTo = selectedRelation ? centralAtlasCoaches.find((coach) => coach.id === selectedRelation.to) : undefined;

  return (
    <div className="atlas-app">
      <EmbeddedAppNav current="COACHING TREE" />
      <header className="topbar">
        <a className="brand" href="#top" aria-label="NFL Coaching Tree Atlasの先頭へ">
          <span className="brand-title relative block font-serif text-[22px] font-bold leading-none tracking-[-0.065em] after:absolute after:-bottom-3 after:left-0 after:h-px after:w-14 after:bg-[#d3a62e]">NFL Coaching Tree Atlas</span>
        </a>
      </header>

      <main id="top">
        <section className="atlas-shell" id="atlas" aria-label="コーチングツリー探索">
          <aside className="index-rail" id="people" aria-label="人物と条件の索引">
            <div className="rail-head"><div><p className="overline">01 / INDEX</p><h2>人物を探す</h2></div>{indexMode === "directory" && <span className="result-count">{filteredCoaches.length}<small>名</small></span>}</div>
            <div className="index-mode-switch" role="tablist" aria-label="人物索引の検索モード"><button type="button" role="tab" aria-selected={indexMode === "directory"} className={indexMode === "directory" ? "is-active" : ""} onClick={() => setIndexMode("directory")}>Search</button><button type="button" role="tab" aria-selected={indexMode === "cross-tree"} className={indexMode === "cross-tree" ? "is-active" : ""} onClick={() => setIndexMode("cross-tree")}><Route size={12} /> Pathfinder</button></div>
            <div className={`directory-index-content ${indexMode === "cross-tree" ? "is-hidden" : ""}`}>
            <label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="名前で検索" />{query && <button type="button" onClick={() => setQuery("")} aria-label="検索語をクリア"><X size={14} /></button>}</label>
            <div className="filter-block"><p><Filter size={13} /> 役職経験で絞る</p><div className="role-switches"><button className={activeRole === "ALL" ? "is-selected" : ""} onClick={() => setActiveRole("ALL")}>すべて</button>{indexRoleOrder.map((role) => <button key={role} className={`${roleClass(role)} ${activeRole === role ? "is-selected" : ""}`} onClick={() => setActiveRole(role)}>{role}</button>)}</div></div>
            <div className="filter-block employment-filter"><p><span className="employment-status-dot" /> 在職状態</p><div className="employment-switches"><button className={activeEmployment === "NONE" ? "is-selected" : ""} onClick={() => setActiveEmployment("NONE")}>関係なし</button><button className={activeEmployment === "CURRENT_HC" ? "is-selected" : ""} onClick={() => setActiveEmployment("CURRENT_HC")}>現職HC</button><button className={activeEmployment === "CURRENT" ? "is-selected" : ""} onClick={() => setActiveEmployment("CURRENT")}>現職のみ</button></div></div>
            <div className="filter-block era-filter"><p><span className="era-tick" /> 初回HC年</p><div className="era-list">{decades.map((era) => <button key={era} className={directoryEra === era ? "is-selected" : ""} onClick={() => setDirectoryEra(era)}>{era === "すべて" ? era : era.replace("s", "年代")}</button>)}</div></div>
            <div className="index-list">{filteredCoaches.map((coach) => <button key={coach.id} className={`index-row ${coach.id === selected.id ? "is-selected" : ""}`} onClick={() => chooseCoach(coach.id)}><span className={`mini-marker ${roleClass(coach.roles.includes("HC") ? "HC" : coach.roles[0])}`} /><span className="index-name"><strong>{coach.name}</strong></span><ChevronRight size={15} /></button>)}{!filteredCoaches.length && <p className="empty-index">条件に合う人物がありません。</p>}</div>
            </div>
            {indexMode === "cross-tree" && (
              <section className="cross-tree-finder" aria-label="全系列横断の最短経路検索">
                <div className="cross-tree-finder__head"><span><Route size={16} /><b>CROSS-TREE PATHFINDER</b></span><small>全確認済み関係を横断 · {crossTreeCoaches.length}名</small></div>
                <div className="cross-tree-finder__filters"><div className="cross-tree-filter"><p><span className="employment-status-dot" /> 在職状態</p><div className="employment-switches"><button className={activeEmployment === "NONE" ? "is-selected" : ""} onClick={() => setActiveEmployment("NONE")}>関係なし</button><button className={activeEmployment === "CURRENT_HC" ? "is-selected" : ""} onClick={() => setActiveEmployment("CURRENT_HC")}>現職HC</button><button className={activeEmployment === "CURRENT" ? "is-selected" : ""} onClick={() => setActiveEmployment("CURRENT")}>現職のみ</button></div></div><div className="cross-tree-filter"><p><span className="era-tick" /> 初回HC年</p><div className="era-list">{decades.map((era) => <button key={era} className={directoryEra === era ? "is-selected" : ""} onClick={() => setDirectoryEra(era)}>{era === "すべて" ? era : era.replace("s", "年代")}</button>)}</div></div></div>
                <label className="cross-tree-search"><Search size={15} /><input type="search" value={crossCoachQuery} onChange={(event) => setCrossCoachQuery(event.target.value)} placeholder="候補名を絞り込む" aria-label="横断経路の候補名を検索" />{crossCoachQuery && <button type="button" onClick={() => setCrossCoachQuery("")} aria-label="候補名検索をクリア"><X size={13} /></button>}</label>
                <div className="cross-tree-finder__controls"><label><i>FROM</i><select value={crossPathStartId} onChange={(event) => setCrossPathStartId(event.target.value)} aria-label="横断経路の出発コーチ"><option value="">From whom</option>{crossTreeSearchedCoaches.map((coach) => <option key={coach.id} value={coach.id}>{coach.name}</option>)}</select></label><button type="button" className="cross-tree-finder__swap" onClick={() => { setCrossPathStartId(crossPathEndId); setCrossPathEndId(crossPathStartId); }} disabled={!hasCrossTreeSearch} aria-label="出発コーチと到着コーチを入れ替える"><ArrowLeftRight size={15} /></button><label><i>TO</i><select value={crossPathEndId} onChange={(event) => setCrossPathEndId(event.target.value)} aria-label="横断経路の到着コーチ"><option value="">To whom</option>{crossTreeSearchedCoaches.map((coach) => <option key={coach.id} value={coach.id}>{coach.name}</option>)}</select></label></div>
                {crossTreePath ? <div className="cross-tree-route"><div className="cross-tree-route__head"><span>SHORTEST ROUTE</span><strong>{crossTreePath.length} HOPS</strong></div><ol>{crossTreePath.map((edge, index) => { const fromId = crossTreePathCoachIds[index]; const toId = crossTreePathCoachIds[index + 1]; const fromCoach = atlasCatalogCoaches.find((item) => item.id === fromId); const toCoach = atlasCatalogCoaches.find((item) => item.id === toId); const season = relationSeason(edge); const fromMember = season?.members.find((member) => member.id === fromId); const toMember = season?.members.find((member) => member.id === toId); const fromRole = relationRoleOnlyLabel(edge, fromId, fromMember, fromCoach ? profileCareerHistories[profileHistoryKey(fromCoach.name)] : undefined); const toRole = relationRoleOnlyLabel(edge, toId, toMember, toCoach ? profileCareerHistories[profileHistoryKey(toCoach.name)] : undefined); return <li key={edge.id}><button type="button" className="cross-tree-route__coach" onClick={() => chooseCoach(fromId)}><span>{fromCoach?.name}</span></button><button type="button" className="cross-tree-route__edge" onClick={() => openCrossTreeHop(edge, toId)} aria-label={`${edge.team} ${edge.years}の関係を地図で開く`}><span>━</span><div className="cross-tree-route__meta"><strong>{edge.team}</strong><small>{edge.years}</small></div><div className="cross-tree-route__roles"><small><b>{fromCoach?.name}</b>{fromRole}</small><small><b>{toCoach?.name}</b>{toRole}</small></div></button>{index === crossTreePath.length - 1 && <button type="button" className="cross-tree-route__coach" onClick={() => chooseCoach(toId)}><span>{toCoach?.name}</span></button>}</li>; })}</ol></div> : hasCrossTreeSearch ? <p className="cross-tree-empty">この2人を結ぶ確認済みの横断経路はありません。</p> : <p className="cross-tree-empty">二人を選ぶと、全系列を横断する最短ルートを表示します。</p>}
                <button type="button" className="cross-tree-clear" onClick={() => { setCrossPathStartId(""); setCrossPathEndId(""); setCrossCoachQuery(""); }} disabled={!crossPathStartId && !crossPathEndId && !crossCoachQuery}>Clear route</button>
              </section>
            )}
          </aside>

          <section className="atlas-main">
            <div className="atlas-toolbar"><div className="view-tabs" role="tablist" aria-label="閲覧モード"><button role="tab" aria-selected={view === "tree"} className={view === "tree" ? "is-active" : ""} onClick={() => setView("tree")}>系譜地図</button><button role="tab" aria-selected={view === "staff"} className={view === "staff" ? "is-active" : ""} onClick={openSelectedMapRelationInAlmanac}>スタッフ年鑑</button></div><p className="map-key"><i className="role-symbol role-hc">●</i> HC <i className="role-symbol role-oc">◆</i> OC <i className="role-symbol role-dc">■</i> DC</p></div>

            {view === "tree" && <div className="tree-view">
              <div className="tree-heading"><div><p className="overline">02 / LINEAGE MAP</p><h2>{activeTree.japanese}</h2></div><p>{activeTree.years} · {activeTree.nodeIds.length} NODES · {activeTreeEdges.length} RELATIONS</p></div>
              <section className="tree-switcher" aria-label="主要系譜を切り替える"><div className="tree-switcher-title"><Layers3 size={16} /><span><b>LINEAGE PLATES</b><small>初回HC年順に系譜を選び、記録を辿る</small></span></div><div className="tree-switches">{lineagePlateTrees.map((tree) => <button key={tree.id} onClick={() => selectTree(tree.id)} className={tree.id === activeTree.id ? "is-active" : ""}><span>{tree.label}</span><small>{tree.nodeIds.length} NODES · {tree.years}</small></button>)}</div></section>
              <section className={`path-finder map-search ${isMapSearchOpen ? "is-open" : ""}`} aria-label="この系列内の経路検索"><div className="path-finder-title map-search__trigger"><Route size={17} /><span><b>MAP SEARCH</b><small>{activeTree.label}内で二人を指定して地図上の経路を探す</small></span><button type="button" onClick={() => setIsMapSearchOpen((open) => !open)} aria-expanded={isMapSearchOpen} aria-controls="map-search-workspace"><span>{isMapSearchOpen ? "Close" : "Open"}</span><ChevronRight size={15} /></button></div>{isMapSearchOpen && <div id="map-search-workspace" className="map-search__body"><div className="map-search__row"><div className="map-search__row-title"><span className="map-search__row-label"><b>ROUTE SELECTOR</b><small>二人の経路を地図上で確認</small></span></div><div className="path-controls"><select value={pathStartId} title={activeTreeCoaches.find((coach) => coach.id === pathStartId)?.name ?? "From"} onChange={(event) => { const next = event.target.value; setPathStartId(next); setShowPathHighlight(Boolean(next && pathEndId)); }} aria-label="出発コーチ"><option value="">From</option>{activeTreeCoaches.map((coach) => <option key={coach.id} value={coach.id}>{coach.name}</option>)}</select><button className="swap-path" type="button" onClick={() => { setPathStartId(pathEndId); setPathEndId(pathStartId); setShowPathHighlight(Boolean(pathStartId && pathEndId)); }} aria-label="出発コーチと到着コーチを入れ替える" disabled={!hasPathSelection}><ArrowLeftRight size={15} /></button><select value={pathEndId} title={activeTreeCoaches.find((coach) => coach.id === pathEndId)?.name ?? "To"} onChange={(event) => { const next = event.target.value; setPathEndId(next); setShowPathHighlight(Boolean(pathStartId && next)); }} aria-label="到着コーチ"><option value="">To</option>{activeTreeCoaches.map((coach) => <option key={coach.id} value={coach.id}>{coach.name}</option>)}</select></div></div><div className="map-search__row"><div className="map-search__row-title"><span className="map-search__row-label"><b>RELATION FILTERS</b><small>関係線をチームと年代で絞り込み</small></span><details className="relation-filter-help" open={new URLSearchParams(window.location.search).get("mapHelp") === "open"}><summary aria-label="Relation Filtersの使い方"><CircleHelp size={14} /></summary><p><b>TEAM</b>は在籍チーム、<b>ERA</b>は関係が成立した年代で候補線を絞ります。両方指定すると、条件を同時に満たす関係だけをMap Searchに使います。</p></details></div><div className="path-filters"><label><i>TEAM</i><select value={routeTeam} onChange={(event) => { setRouteTeam(event.target.value); setShowPathHighlight(hasPathSelection); }}><option value="すべて">すべて</option>{relationTeams.map((team) => <option key={team} value={team}>{team}</option>)}</select></label><label><i>ERA</i><select value={routeEra} onChange={(event) => { setRouteEra(event.target.value); setShowPathHighlight(hasPathSelection); }}>{decades.map((era) => <option key={era} value={era}>{era}</option>)}</select></label><button className="clear-pathfinder-filters" type="button" onClick={clearPathfinderFilters} disabled={!pathStartId && !pathEndId && !isRelationFilterActive} aria-label="Map SearchとRelation Filtersを解除">Clear filters</button></div></div>{activePath ? <div className="path-result"><strong>{activePath.length - 1} HOPS</strong><div>{activePath.map((id, index) => <span key={id}>{index > 0 && <i>→</i>}{centralAtlasCoaches.find((coach) => coach.id === id)?.name}</span>)}</div><button type="button" onClick={() => chooseCoach(pathEndId)}>終点を開く <ArrowUpRight size={14} /></button></div> : hasPathSelection ? <div className="no-path">このTeam・ERA条件では、選択した2人を結ぶ確認済みの接続がありません。</div> : null}</div>}{relationRecordEntries.length > 0 && <div className="path-relation-records" aria-label="Map Searchと地図の関係記録"><div className="relation-record-deck__head"><b>RELATION RECORDS</b><span>Map Searchの経路と地図で選んだ線</span></div><div className="relation-record-deck__list">{relationRecordEntries.map(({ edge, origin }) => { const season = relationSeason(edge); const from = centralAtlasCoaches.find((coach) => coach.id === edge.from); const to = centralAtlasCoaches.find((coach) => coach.id === edge.to); const fromMember = season?.members.find((member) => member.id === edge.from); const toMember = season?.members.find((member) => member.id === edge.to); return <button key={edge.id} type="button" className={`relation-record-deck__item ${selectedRelationKey === edge.id ? "is-current" : ""}`} onClick={() => chooseRelation(edge, "path")}><div className="relation-record-deck__meta"><span className="relation-record-deck__origin">{origin}</span></div><RelationEvidence compact edge={edge} fromName={from?.name} toName={to?.name} fromRole={relationRoleLabel(edge, edge.from, fromMember)} toRole={relationRoleLabel(edge, edge.to, toMember)} onOpenCoach={chooseCoach} /></button>; })}</div></div>}</section>
              <div ref={mapStageRef} className={`map-stage ${isMapFullscreen ? "is-fullscreen" : ""}`}>
                <div className="map-stage-controls" aria-label="地図表示の操作">
                  <span>ATLAS PLATE</span>
                  <button type="button" className="map-reset-trigger" onClick={resetMapView} disabled={mapZoom === 1 && mapPan.x === 0 && mapPan.y === 0 && !highlightRootId && !hoveredCoachId && !selectedRelationKey && !mapRelationKey && !showPathHighlight} aria-label="地図をニュートラル状態へリセット"><RotateCcw size={13} /><span>リセット</span></button>
                  <button type="button" className="fullscreen-trigger" onClick={toggleMapFullscreen} aria-label={isMapFullscreen ? "全画面を終了" : "全画面で開く"}>{isMapFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}<span>{isMapFullscreen ? "終了" : "全画面"}</span></button>
                </div>
                {selectedRootLineage && dismissedRootOfferId !== selectedId && <div className="map-root-offer" role="group" aria-label={`${selected.name}を起点とする系列への移動`}><small>ROOT PLATE AVAILABLE</small><strong>{selected.name}系を開きますか？</strong><span><button type="button" onClick={openSelectedRootLineage}>系譜を開く</button><button type="button" onClick={() => setDismissedRootOfferId(selectedId)}>この地図に留まる</button></span></div>}
                <div className="map-evidence-ledger" aria-label="選択中の系譜の航路記録"><span>ROUTE RECORD</span><strong>{activeTree.label}</strong><i>{activeTree.teams[0]}</i><i>{activeTree.years}</i><em className="role-hc">● HC</em><em className="role-oc">◆ OC</em><em className="role-dc">■ DC</em></div>
                <div
                  ref={mapViewportRef}
                  className={`map-viewport ${isMapDragging ? "is-dragging" : ""}`}
                  style={{ "--map-zoom": mapZoom, "--map-pan-x": `${mapPan.x}px`, "--map-pan-y": `${mapPan.y}px` } as CSSProperties}
                  aria-label="系譜地図。ドラッグで移動し、マウスホイールまたは二本指ピンチで拡大縮小できます。"
                  onWheel={handleMapWheel}
                  onPointerDown={handleMapPointerDown}
                  onPointerMove={handleMapPointerMove}
                  onPointerUp={handleMapPointerEnd}
                  onPointerCancel={handleMapPointerEnd}
                  onTouchStart={handleMapTouchStart}
                  onTouchMove={handleMapTouchMove}
                  onTouchEnd={resetPinchGesture}
                  onTouchCancel={resetPinchGesture}
                >
              <div className={`tree-canvas map-scale-${mapScale} ${activeTree.nodeIds.length > 18 ? "is-dense" : ""} ${useMobileSpaciousMap ? "is-mobile-spacious" : ""} ${selectedRelationKey ? "has-selected-relation" : ""} ${isRelationFilterActive ? "has-relation-filter" : ""}`} style={{ backgroundImage: "linear-gradient(rgba(248,244,232,.78),rgba(248,244,232,.78)), url('/manus-storage/nfl-atlas-map-texture_0954d4f7.jpg')" }}>
                {selectedRelationKey && <button type="button" className="mobile-relation-clear-capture" aria-label="選択中の関係線を解除" onPointerDown={(event) => { event.stopPropagation(); clearSelectedRelation(); }} />}
                <div className="map-plate-stamp"><b>{activeTree.label} / PLATE</b><span>{activeTree.years} · STAFF RECORDS</span></div>{isRelationFilterActive && <div className="filter-map-status" aria-live="polite"><span><Filter size={12} /> FILTER LENS</span><strong>{filteredEdges.length} <small>/ {activeTreeEdges.length} RELATIONS</small></strong><em>{relationFilterCaption}</em></div>}
                <div className="map-era-bands" aria-hidden="true">{mapYearMarks.map((mark) => <span key={mark.position} style={{ left: `${mark.position * 100}%` }}>{mark.year}</span>)}</div>
                <svg className="tree-lines" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-label={`${activeTree.japanese}の関係線`}><g className="decade-rails"><path d="M330 0V1000" /><path d="M660 0V1000" /></g>{mapInteractionEdges.map((edge) => {
                  const pairKey = edgeKey(edge.from, edge.to);
                  const from = mapPoints.find((point) => point.id === edge.from);
                  const to = mapPoints.find((point) => point.id === edge.to);
                  if (!from || !to || !visibleMapIds.has(edge.from) || !visibleMapIds.has(edge.to)) return null;
                  const muted = isLineageFocus && !lineageFocusRelationIds.has(edge.id);
                  const matchesRelationFilter = !isRelationFilterActive || filteredRelationIds.has(edge.id);
                  const path = mapCurve(from, to);
                  const isRelationSelected = selectedRelationKey === edge.id;
                  const isRelationHovered = hoveredRelationId === edge.id;
                  const relationClass = `tree-relation ${showPathHighlight && activePathEdges.has(pairKey) ? "is-on-path" : ""} ${isRelationSelected ? "is-selected-relation" : ""} ${isRelationHovered ? "is-hovered-relation" : ""} ${lineageFocusRelationIds.has(edge.id) ? "is-lineage-focus" : ""} ${muted ? "is-muted" : ""} ${matchesRelationFilter ? "is-filter-match" : "is-filter-muted"}`;
                  const relationStyle = isRelationSelected ? { stroke: "#294b5b", strokeWidth: 4, strokeDasharray: "none", opacity: 1 } : isRelationHovered ? { stroke: "var(--gold)", strokeWidth: 3.4, strokeDasharray: "none", opacity: 1 } : undefined;
                  const activateRelation = () => chooseRelation(edge);
                  return <g key={edge.id} className="tree-relation-group">
                    <path d={path} data-relation-id={edge.id} className="tree-relation-hit-area" aria-hidden="true" onMouseEnter={() => setRelationHover(edge.id)} onMouseLeave={() => setRelationHover("")} onClick={(event) => { event.stopPropagation(); if (suppressRelationClickRef.current) { suppressRelationClickRef.current = false; return; } activateRelation(); }} />
                    <path d={path} data-relation-id={edge.id} tabIndex={0} role="button" className={relationClass} style={relationStyle} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activateRelation(); } }} aria-label={`${edge.team} ${edge.years}の関係を表示`} />
                  </g>;
                })}{selectedRelation && (() => {
                  const from = mapPoints.find((point) => point.id === selectedRelation.from);
                  const to = mapPoints.find((point) => point.id === selectedRelation.to);
                  if (!from || !to) return null;
                  return <path d={mapCurve(from, to)} data-relation-id={selectedRelation.id} className="tree-relation-selected-hit-area" aria-hidden="true" onClick={(event) => { event.stopPropagation(); if (suppressRelationClickRef.current) { suppressRelationClickRef.current = false; return; } chooseRelation(selectedRelation); }} />;
                })()}</svg>
                {parentLineages.length === 1 && activeRootPoint && <button type="button" className="lineage-parent-node" style={{ left: `${Math.max(2, activeRootPoint.x - 14)}%`, top: `${activeRootPoint.y}%` }} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); selectTree(parentLineages[0].tree.id); }} aria-label={`${parentLineages[0].coach.name}の系列を開く`}><span aria-hidden="true">←</span><span><small>PARENT PLATE</small><strong>{parentLineages[0].coach.name}</strong><em>系列を開く</em></span></button>}
                {parentLineages.length > 1 && activeRootPoint && <div className="lineage-parent-menu" style={{ left: `${Math.max(2, activeRootPoint.x - 15)}%`, top: `${activeRootPoint.y}%` }} onPointerDown={(event) => event.stopPropagation()} role="group" aria-label="親系列の戻り先を選択"><span className="lineage-parent-menu__head"><i aria-hidden="true">←</i><small>PARENT PLATES</small></span>{parentLineages.map(({ tree, coach }) => <button key={tree.id} type="button" onClick={(event) => { event.stopPropagation(); selectTree(tree.id); }} aria-label={`${coach.name}の系列を開く`}><strong>{coach.name}</strong><small>{tree.label}</small></button>)}</div>}
                <span className="era-caption era-one">{activeTree.teams[0]}<br />{activeTree.years}</span><span className="era-caption era-three">{activeTree.label}<br />ACTIVE</span>
                {visibleMapPoints.map((point) => { const coach = centralAtlasCoaches.find((item) => item.id === point.id); const muted = !visibleIds.has(point.id) || (isLineageFocus && !lineageFocusIds.has(point.id)); return coach ? <CoachDot key={point.id} coach={coach} point={point} active={coach.id === selected.id} onPath={activePathIds.has(coach.id)} parentFocused={immediateParentFocus.ids.has(coach.id)} profileFocused={coach.id === profileMapFocusId} muted={muted} onSelect={() => chooseCoach(coach.id, true)} onHover={() => setHoveredCoachId(coach.id)} onLeave={() => setHoveredCoachId("")} /> : null; })}
              </div>
                </div>
              </div>
            </div>}

            {view === "directory" && <div className="directory-view" id="directory"><div className="tree-heading"><div><p className="overline">02 / DIRECTORY</p><h2>HC・OC・DC経験者の索引</h2></div><p>人物カードから、根拠となる主要な役職履歴を確認できます。</p></div><div className="directory-grid">{filteredCoaches.map((coach) => <button key={coach.id} className={`directory-card ${coach.id === selected.id ? "is-selected" : ""}`} onClick={() => chooseCoach(coach.id)}><span className={`directory-symbol ${roleClass(coach.roles.includes("HC") ? "HC" : coach.roles[0])}`}><i>{roleGlyph(coach.roles.includes("HC") ? "HC" : coach.roles[0])}</i>{roleText(coach.roles)}</span><span><strong>{coach.name}</strong><small>{coach.japanese} · {coach.firstYear}–</small><em>{coach.origin}</em></span><ArrowUpRight size={17} /></button>)}</div></div>}

            {view === "staff" && <div className="staff-view" id="staff-rooms"><div className="tree-heading"><div><p className="overline">02 / STAFF ALMANAC</p><h2>HC在任期間のスタッフ年鑑</h2></div></div><section className="staff-catalog"><div className="staff-catalog-head"><UsersRound size={18} /><div><b>SEASON STAFF ALMANAC</b></div></div><div className="staff-selectors staff-selectors--team-mode"><label>HEAD COACH<select value={activeStaffCoach?.id ?? ""} onChange={(event) => { const next = allHcAlmanacCoaches.find((coach) => coach.id === event.target.value); if (next) { setStaffCoachId(next.id); setStaffRecordId(next.records[0]?.id ?? ""); } }}>{allHcAlmanacCoaches.map((coach) => <option key={coach.id} value={coach.id}>{coach.name}</option>)}</select></label><label>TEAM<select value={activeStaffRecord?.team ?? ""} onChange={(event) => { const next = staffRecordsForCoach.find((record) => record.team === event.target.value); if (next) setStaffRecordId(next.id); }}>{seasonTeamOptions.map((team) => <option key={team} value={team}>{team}</option>)}</select></label></div></section>{activeStaffRecord ? <section className="team-staff-ledger"><div className="team-staff-ledger-title"><p>{activeStaffRecord.team.toUpperCase()}</p><h3>{staffRecordsForSelectedTeam.length} SEASONS</h3></div><div className="team-staff-season-list">{staffRecordsForSelectedTeam.map((record) => <TeamStaffSeasonCard key={record.id} record={record} roleChanges={staffRoleChangesByRecordId.get(record.id) ?? []} onOpenMember={openStaffMember} />)}</div></section> : <p className="empty-index">年鑑記録がありません。</p>}</div>}
          </section>

          <aside className="annotation-panel" aria-label="選択中コーチと関係詳細">
            <div className="annotation-head"><p className="overline">03 / PROFILE</p><span className={`profile-insignia ${roleClass(selected.roles.includes("HC") ? "HC" : selected.roles[0])}`}><i className={`profile-role-glyph ${roleClass(selected.roles.includes("HC") ? "HC" : selected.roles[0])}`}>{roleGlyph(selected.roles.includes("HC") ? "HC" : selected.roles[0])}</i>{roleText(selected.roles)}</span></div>
            <div className="profile-title"><h2>{selected.name}</h2><div className="profile-role-line">{selected.roles.map((role) => <span key={role} className={roleClass(role)}>{roleGlyph(role)} {role}</span>)}</div>{selectedStatus && <div className={`profile-status is-${selectedStatus.state}`}><i aria-hidden="true" /><span><b>{selectedStatus.label}</b><small>{selectedStatus.detail}</small></span></div>}{profileLineageLocations.length > 1 && <section className="profile-lineage-locations" aria-label={`${selected.name}の系譜地図での位置`}><div className="profile-lineage-locations__head"><b>系譜地図での位置</b><span>{profileLineageLocations.length}系列に表示</span></div><div className="profile-lineage-locations__list">{profileLineageLocations.map((location) => <button key={location.tree.id} type="button" data-lineage-depth={location.depth} style={{ "--lineage-depth": location.depth } as CSSProperties} onClick={() => openProfileLineage(location)}><strong>{location.rootName}系</strong><small>{location.edge ? `${location.edge.team} · ${location.edge.years}` : "系列起点"}</small><ArrowUpRight size={13} aria-hidden="true" /></button>)}</div></section>}</div>
            <div className="appointment-list"><div className="section-label"><span>NFL COACHING HISTORY</span><small>HC · OC · DC · STC</small></div>{selected.appointments.map((appointment: Appointment) => <ProfileAppointment key={`${appointment.years}-${appointment.team}-${appointment.role}-${appointment.title ?? ""}`} coachName={selected.name} appointment={appointment} onOpenAlmanac={openAppointmentInAlmanac} />)}</div>
          </aside>
        </section>

      </main>
      {showMethod && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowMethod(false)}><section className="method-modal" role="dialog" aria-modal="true" aria-labelledby="method-title" onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" type="button" onClick={() => setShowMethod(false)} aria-label="閉じる"><X size={18} /></button><p className="overline">EDITORIAL POLICY</p><h2 id="method-title">収録・表記ルール</h2><p>人物は1980年代以降にNFLで<strong>HC、OC、DCのいずれか</strong>を経験し、主要系譜へ確認済みの接続を持つ者に限定します。</p><div className="method-rules"><div><b>関係詳細</b><span>選択した線についてチーム・年・当時の役職を表示</span></div><div><b>シーズン年鑑</b><span>確認済みの代表年におけるHC・OC・DC担当者を表示</span></div><div><b>役職色</b><span>ネイビー＝HC、オーカー＝OC、バーガンディ＝DC</span></div></div><button className="modal-action" type="button" onClick={() => setShowMethod(false)}>アトラスに戻る <ArrowDownRight size={16} /></button></section></div>}
    </div>
  );
}
