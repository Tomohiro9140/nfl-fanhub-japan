import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";
import type { OfficialStanding } from "@db/schema";
import { getTeamByCode } from "../lib/teams";

interface OfficialLeagueDashboardProps {
  favorite: {
    code: string;
    name: string;
    conference: string;
    division: string;
    brand: {
      primary: string;
      accent: string;
      onPrimary?: string;
    };
  };
  results: Array<{
    id: number;
    weekLabel: string | null;
    awayTeamCode: string;
    homeTeamCode: string;
    awayScore: number | null;
    homeScore: number | null;
    gameState: string;
    gameDate: string | null;
    kickoffAt: Date | null;
    venue: string | null;
    gameUrl: string;
    nflHighlightUrl: string | null;
    daznUrl: string | null;
    sourceUrl: string;
    fetchedAt: Date;
  }>;
  standings: OfficialStanding[];
  dashboard: {
    favorite: {
      teamCode: string;
      teamName: string;
      conference: string;
      division: string;
    };
    calendar: Array<{
      id: number;
      teamCode: string;
      opponentCode: string;
      homeAway: "home" | "away";
      seasonPhase: "preseason" | "regular" | "postseason";
      weekLabel: string | null;
      kickoffAt: Date;
      broadcast: string | null;
      sourceUrl: string;
      daznUrl: string | null;
      gameState: string | null;
      awayScore: number | null;
      homeScore: number | null;
      liveScoreboardFallback?: boolean;
    }>;
    lastUpdatedAt?: Date | string | null;
  } | null;
  loading?: boolean;
  calendarLoading?: boolean;
}

function sourceTime(value?: Date) {
  return value
    ? new Intl.DateTimeFormat("ja-JP", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Tokyo",
      }).format(new Date(value))
    : "-";
}

function calendarDate(value: Date) {
  const d = new Date(value);
  const dateStr = new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Tokyo",
  }).format(d);

  // 秒が 59 の場合は時間未定（TBD）として扱う
  if (d.getSeconds() === 59) {
    return `${dateStr} TBD`;
  }

  const timeStr = new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(d);
  return `${dateStr} ${timeStr} JST`;
}

function calendarDayKey(value: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}

function calendarDayLabel(value: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}

export function jstResultDate(value: Date | null, officialDate?: string | null) {
  const date = value ?? (officialDate ? new Date(`${officialDate}T12:00:00.000Z`) : null);
  if (!date || Number.isNaN(new Date(date).getTime())) return null;
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Tokyo",
  }).format(new Date(date));
}

function abbreviatedMatchup(game: { homeAway: "home" | "away"; teamCode: string; opponentCode: string }) {
  return game.homeAway === "away"
    ? `@ ${game.opponentCode}`
    : `vs ${game.opponentCode}`;
}

function seasonWeekLabel(game: { weekLabel: string | null; seasonPhase: string }) {
  if (game.weekLabel) return game.weekLabel;
  if (game.seasonPhase === "preseason") return "PRESEASON";
  if (game.seasonPhase === "postseason") return "POSTSEASON";
  return "REGULAR SEASON";
}

export function OfficialLeagueDashboard({
  favorite,
  results: _results,
  standings,
  dashboard,
  loading,
  calendarLoading,
}: OfficialLeagueDashboardProps) {
  const [calendarView, setCalendarView] = useState<"team" | "week">("team");

  const divisionStandings = standings.filter(
    (s) => s.teamCode && getTeamByCode(s.teamCode)?.division === favorite.division
  );

  const calendarGames = dashboard?.calendar ?? [];

  const groupedWeekGames = (() => {
    const groups = new Map<string, { label: string; games: typeof calendarGames }>();
    for (const game of calendarGames) {
      const key = calendarDayKey(game.kickoffAt);
      const group = groups.get(key) ?? { label: calendarDayLabel(game.kickoffAt), games: [] };
      group.games.push(game);
      groups.set(key, group);
    }
    return Array.from(groups.values());
  })();

  const calendarCard = (game: typeof calendarGames[number]) => {
    const isHomeTeamGame = game.teamCode === favorite.code && game.homeAway === "home";
    const isAwayTeamGame = game.teamCode === favorite.code && game.homeAway === "away";
    const usesFavoriteBrand = isHomeTeamGame || isAwayTeamGame;
    const usesAwayGray = isAwayTeamGame;

    const venueStyle = usesFavoriteBrand
      ? "border-l-4"
      : usesAwayGray
      ? "border-[#9ca3af] bg-[#f3f4f6]"
      : "border-[#d7d1c4] bg-[#fffdf8]";

    const brandStyle = usesFavoriteBrand
      ? {
          backgroundColor: favorite.brand.primary,
          borderLeftColor: favorite.brand.accent,
          color: favorite.brand.onPrimary ?? "#ffffff",
        }
      : undefined;

    const href = game.daznUrl || game.sourceUrl;
    const target = "_blank";

    return (
      <a
        key={game.id}
        href={href}
        target={target}
        rel="noreferrer"
        style={brandStyle}
        className={`min-w-0 border-l-2 px-2 py-2 ${venueStyle}`}
      >
        <p className="truncate font-mono text-[11px] font-bold">
          {abbreviatedMatchup(game)}
        </p>
        <p
          className={`mt-0.5 truncate text-[9px] ${
            usesFavoriteBrand ? "opacity-80" : "text-[#5b6472]"
          }`}
        >
          {game.liveScoreboardFallback
            ? "LIVE · OFFICIAL SCOREBOARD"
            : calendarDate(game.kickoffAt)}
        </p>
        <p
          className={`mt-1 truncate font-mono text-[9px] font-bold tracking-[.04em] ${
            usesFavoriteBrand ? "opacity-90" : "text-[#4b5563]"
          }`}
        >
          {seasonWeekLabel(game)}
          {game.broadcast ? ` · ${game.broadcast}` : ""}
        </p>
      </a>
    );
  };

  return (
    <section
      id="league"
      data-layout-scope="league-dashboard"
      className="scroll-mt-24 space-y-3"
    >
      <div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#64748b]">
        <span className="text-[#10213a]">04</span>
        <span>LEAGUE DESK</span>
        <span className="h-px flex-1 bg-[#d9d5cc]" />
      </div>

      {/* DIVISION STANDINGS */}
      <article className="clip-note border border-[#ded8cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[9px] font-bold tracking-[.14em] text-[#64748b]">
              NFL OFFICIAL
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-wide">
              DIVISION STANDINGS
            </h2>
            <p className="mt-1 text-[10px] text-[#687587]">
              {favorite.conference} {favorite.division.toUpperCase()} · UPDATED{" "}
              {sourceTime(dashboard?.lastUpdatedAt ? new Date(dashboard.lastUpdatedAt) : undefined)} JST
            </p>
          </div>
        </div>

        {loading ? (
          <p className="py-5 text-center font-mono text-[10px] text-[#64748b]">
            LOADING OFFICIAL STANDINGS...
          </p>
        ) : divisionStandings.length > 0 ? (
          <div className="mt-3 divide-y divide-[#eeeae1]">
            {divisionStandings.map((row, index) => {
              const team = getTeamByCode(row.teamCode);
              return (
                <div
                  key={row.teamCode}
                  className={`grid grid-cols-[18px_1fr_auto] items-center gap-2 py-2.5 ${
                    row.teamCode === favorite.code ? "bg-[#fff8ed]" : ""
                  }`}
                >
                  <span className="font-mono text-[10px] text-[#64748b]">{index + 1}</span>
                  <span className="truncate font-mono text-[12px] font-bold text-[#10213a]">
                    {team?.name ?? row.teamCode}
                  </span>
                  <span className="font-mono text-[11px] font-bold">
                    {row.wins}-{row.losses}
                    {row.ties ? `-${row.ties}` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-3 border border-dashed border-[#d7d1c4] bg-[#fffdf8] p-3 text-center font-mono text-[11px] text-[#687587]">
            NFL公式順位表の初回同期を待っています。
          </div>
        )}

        <a
          href="https://www.nfl.com/standings/league/2026/REG"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-3"
        >
          OFFICIAL STANDINGS
          <ChevronRight className="h-3 w-3" />
        </a>
      </article>

      {/* SCHEDULE DESK */}
      <article className="border border-[#ded8cc] bg-white p-3 shadow-[0_10px_30px_rgba(34,42,53,.05)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[9px] font-bold tracking-[.14em] text-[#64748b]">
              NFL OFFICIAL SCHEDULE
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-wide">
              SCHEDULE DESK
            </h2>
          </div>
        </div>

        {calendarLoading ? (
          <p className="py-5 text-center font-mono text-[10px] text-[#64748b]">
            LOADING OFFICIAL CALENDAR...
          </p>
        ) : (
          <>
            <div
              className="mt-3 grid grid-cols-2 gap-1.5"
              role="tablist"
              aria-label="Schedule view"
            >
              <button
                type="button"
                role="tab"
                aria-selected={calendarView === "team"}
                onClick={() => setCalendarView("team")}
                className={`border px-2 py-2 font-mono text-[9px] font-bold leading-3 ${
                  calendarView === "team"
                    ? "border-[#10213a] bg-[#10213a] text-white"
                    : "border-[#d7d1c4] bg-[#fffdf8] text-[#526173]"
                }`}
              >
                MY TEAM<br />FULL SCHEDULE
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={calendarView === "week"}
                onClick={() => setCalendarView("week")}
                className={`border px-2 py-2 font-mono text-[9px] font-bold leading-3 ${
                  calendarView === "week"
                    ? "border-[#10213a] bg-[#10213a] text-white"
                    : "border-[#d7d1c4] bg-[#fffdf8] text-[#526173]"
                }`}
              >
                ALL GAMES<br />NEXT 7 DAYS
              </button>
            </div>

            <p className="mt-2 font-mono text-[9px] font-bold tracking-[.1em] text-[#64748b]">
              {calendarView === "team"
                ? `${favorite.code} · ALL SCHEDULED GAMES`
                : "ALL TEAMS · ROLLING 7-DAY WINDOW"}
            </p>

            {calendarGames.length ? (
              calendarView === "week" ? (
                <div className="mt-2 space-y-3">
                  {groupedWeekGames.map((group) => (
                    <section key={group.label}>
                      <p className="mb-1 font-mono text-[9px] font-bold tracking-[.12em] text-[#526173]">
                        GAME DAY / {group.label}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        {group.games.map(calendarCard)}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-1.5 sm:gap-2">
                  {calendarGames.map(calendarCard)}
                </div>
              )
            ) : (
              <p className="mt-3 border border-dashed border-[#d7d1c4] bg-[#fffdf8] p-3 text-[11px] leading-5 text-[#687587]">
                {calendarView === "team"
                  ? `${favorite.code}の公式日程は次回同期で表示します。`
                  : "今後7日間にNFL公式日程の試合はありません。"}
              </p>
            )}
          </>
        )}

        <a
          href="https://www.nfl.com/schedules"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold underline decoration-[#e85d2a] decoration-2 underline-offset-3"
        >
          OFFICIAL SCHEDULE
          <ChevronRight className="h-3 w-3" />
        </a>
      </article>
    </section>
  );
}
