import { completeStaffAlmanac, type CompleteSeasonStaffRecord } from "./completeStaffAlmanac";
import { generatedAllHcAlmanac } from "./generatedAllHcAlmanac";
import { registryCoaches } from "./coachRegistry";

/** Archive Atlas data reminder: annual staff records remain concise, source-led, and restricted to verified HC tenures. */
const allHcManualRecords: CompleteSeasonStaffRecord[] = [
  {
    id: "almanac-manual-aaron-glenn-nyj-2025",
    lineageId: "hc-aaron-glenn",
    team: "New York Jets",
    season: 2025,
    sourceUrl: "https://www.pro-football-reference.com/teams/nyj/2025.htm",
    sourceLabel: "Pro Football Reference — 2025 New York Jets",
    note: "Aaron Glennの初年度。公式OC・DCを年次記録で確認。",
    members: [
      { name: "Aaron Glenn", japanese: "", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
      { name: "Tanner Engstrand", japanese: "", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
      { name: "Steve Wilks", japanese: "", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
    ],
  },
  {
    id: "almanac-manual-aaron-glenn-nyj-2026",
    lineageId: "hc-aaron-glenn",
    team: "New York Jets",
    season: 2026,
    sourceUrl: "https://www.newyorkjets.com/team/coaches-roster/",
    sourceLabel: "New York Jets — 2026 Coaching Staff",
    note: "2026年の球団公式現行スタッフ。",
    members: [
      { name: "Aaron Glenn", japanese: "", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
      { name: "Frank Reich", japanese: "", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
      { name: "Brian Duker", japanese: "", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
    ],
  },
];

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const recordKey = (record: CompleteSeasonStaffRecord) => `${normalize(record.team)}:${record.season}`;
const roles = ["HC", "OC", "DC"] as const;

function mergeAnnualRecord(records: CompleteSeasonStaffRecord[]): CompleteSeasonStaffRecord {
  const preferred = records.find((record) => record.sourceUrl.includes("pro-football-reference.com")) ?? records[0];
  return {
    ...preferred,
    id: `almanac-all-${normalize(preferred.team)}-${preferred.season}`,
    lineageId: "all-hc",
    members: roles.map((role) => {
      const candidates = records.flatMap((record) => record.members.filter((member) => member.role === role));
      const unique = candidates.filter((member, index) => candidates.findIndex((candidate) => candidate.name === member.name) === index);
      const first = unique[0];
      return { ...first, name: unique.map((member) => member.name).join(" / ") };
    }),
    note: Array.from(new Set(records.map((record) => record.note).filter(Boolean))).join(" / "),
  };
}

const groupedByTeamSeason = new Map<string, CompleteSeasonStaffRecord[]>();
for (const record of [...completeStaffAlmanac, ...generatedAllHcAlmanac, ...allHcManualRecords]) {
  const key = recordKey(record);
  groupedByTeamSeason.set(key, [...(groupedByTeamSeason.get(key) ?? []), record]);
}

/** One normalized record per franchise-season. Interim and shared HC names remain together in the HC field. */
export const allHcStaffAlmanacRecords: CompleteSeasonStaffRecord[] = Array.from(groupedByTeamSeason.values())
  .map(mergeAnnualRecord)
  .sort((a, b) => a.season - b.season || a.team.localeCompare(b.team));

function isNamedHeadCoach(record: CompleteSeasonStaffRecord, coachName: string) {
  const headCoachText = record.members.find((member) => member.role === "HC")?.name ?? "";
  if (!coachName.includes("Jr") && new RegExp(`${coachName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+Jr`, "i").test(headCoachText)) return false;
  return new RegExp(`(^|[^A-Za-z])${coachName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^A-Za-z])`, "i").test(headCoachText);
}

export type HcAlmanacCoach = {
  id: string;
  name: string;
  records: CompleteSeasonStaffRecord[];
};

/** HC原簿を基準にし、本人がHC欄に記載された年だけを返す年鑑選択肢。 */
export const allHcAlmanacCoaches: HcAlmanacCoach[] = registryCoaches
  .map((coach) => ({
    id: coach.id,
    name: coach.name,
    records: allHcStaffAlmanacRecords.filter((record) => isNamedHeadCoach(record, coach.name)),
  }))
  .filter((coach) => coach.records.length > 0)
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

export function almanacRecordsForCoach(coachName: string) {
  return allHcAlmanacCoaches.find((coach) => coach.name === coachName)?.records ?? [];
}

export function recordHasHeadCoach(record: CompleteSeasonStaffRecord, coachName: string) {
  return isNamedHeadCoach(record, coachName);
}
