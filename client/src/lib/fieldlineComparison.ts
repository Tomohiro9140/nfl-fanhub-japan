export type FieldlineStanding = {
  teamCode: string;
  wins: number;
  losses: number;
  ties: number;
  pct: string;
  pointsFor: number | null;
  pointsAgainst: number | null;
};

export type FieldlineMetric = { label: string; leftValue: string; rightValue: string; leftRank: number; rightRank: number; higherIsBetter: boolean };

function numeric(value: number | null | undefined) { return value ?? 0; }

function rankBy(standings: FieldlineStanding[], target: FieldlineStanding, value: (standing: FieldlineStanding) => number, higherIsBetter = true) {
  const targetValue = value(target);
  return standings.filter((standing) => higherIsBetter ? value(standing) > targetValue : value(standing) < targetValue).length + 1;
}

export function buildFieldlineMetrics(standings: FieldlineStanding[], leftCode: string, rightCode: string): FieldlineMetric[] {
  const left = standings.find((standing) => standing.teamCode === leftCode);
  const right = standings.find((standing) => standing.teamCode === rightCode);
  if (!left || !right) return [];
  const definitions = [
    { label: "RECORD", value: (standing: FieldlineStanding) => standing.wins - standing.losses, display: (standing: FieldlineStanding) => `${standing.wins}-${standing.losses}${standing.ties ? `-${standing.ties}` : ""}`, higherIsBetter: true },
    { label: "WIN %", value: (standing: FieldlineStanding) => Number(standing.pct), display: (standing: FieldlineStanding) => standing.pct, higherIsBetter: true },
    { label: "POINTS FOR", value: (standing: FieldlineStanding) => numeric(standing.pointsFor), display: (standing: FieldlineStanding) => String(numeric(standing.pointsFor)), higherIsBetter: true },
    { label: "POINTS AGAINST", value: (standing: FieldlineStanding) => numeric(standing.pointsAgainst), display: (standing: FieldlineStanding) => String(numeric(standing.pointsAgainst)), higherIsBetter: false },
    { label: "POINT DIFFERENTIAL", value: (standing: FieldlineStanding) => numeric(standing.pointsFor) - numeric(standing.pointsAgainst), display: (standing: FieldlineStanding) => String(numeric(standing.pointsFor) - numeric(standing.pointsAgainst)), higherIsBetter: true },
  ];
  return definitions.map((definition) => ({
    label: definition.label,
    leftValue: definition.display(left),
    rightValue: definition.display(right),
    leftRank: rankBy(standings, left, definition.value, definition.higherIsBetter),
    rightRank: rankBy(standings, right, definition.value, definition.higherIsBetter),
    higherIsBetter: definition.higherIsBetter,
  }));
}
