/**
 * Archive Atlas data: user-supplied, independently verified lineage bridges.
 * Only verified coaching connections are used.
 */
import type { MultiGenerationRelation } from "./multiGenerationLineages";

export const userVerifiedLineageRelations: MultiGenerationRelation[] = [
  { id: "verified-walsh-coslet", parent: "Bill Walsh", child: "Bruce Coslet", kind: "direct", team: "San Francisco 49ers", years: "1980", role: "Assistant coach", sourceUrl: "https://pacifictigers.com/honors/hall-of-fame/bruce-coslet/239" },
  { id: "verified-coslet-carroll", parent: "Bruce Coslet", child: "Pete Carroll", kind: "direct", team: "New York Jets", years: "1990–1993", role: "DC", sourceUrl: "https://www.newyorkjets.com/history/coaching-history/" },
  { id: "verified-seifert-carroll", parent: "George Seifert", child: "Pete Carroll", kind: "direct", team: "San Francisco 49ers", years: "1995–1996", role: "DC", sourceUrl: "https://www.49ers.com/news/every-49ers-defensive-coordinator-since-george-seifert-16780235" },
  { id: "verified-ditka-buddy-ryan", parent: "Mike Ditka", child: "Buddy Ryan", kind: "direct", team: "Chicago Bears", years: "1982–1985", role: "DC", sourceUrl: "https://www.pro-football-reference.com/teams/chi/1985.htm" },
  { id: "verified-green-billick", parent: "Dennis Green", child: "Brian Billick", kind: "direct", team: "Minnesota Vikings", years: "1992–1998", role: "TE Coach / OC", sourceUrl: "https://www.pro-football-reference.com/teams/min/1994.htm" },
  { id: "verified-walsh-fassel", parent: "Bill Walsh", child: "Jim Fassel", kind: "direct", team: "Stanford", years: "1992", role: "OC / QB Coach", sourceUrl: "https://www.pro-football-reference.com/coaches/FassJi0.htm" },
  { id: "verified-wade-phillips-fassel", parent: "Wade Phillips", child: "Jim Fassel", kind: "direct", team: "Denver Broncos", years: "1993–1994", role: "OC", sourceUrl: "https://www.denverbroncos.com/news/former-broncos-oc-jim-fassel-passes-away" },
  { id: "verified-jimmy-johnson-turner", parent: "Jimmy Johnson", child: "Norv Turner", kind: "direct", team: "Dallas Cowboys", years: "1991–1993", role: "OC", sourceUrl: "https://www.pro-football-reference.com/teams/dal/1991.htm" },
  { id: "verified-ditka-tobin", parent: "Mike Ditka", child: "Vince Tobin", kind: "direct", team: "Chicago Bears", years: "1986–1992", role: "DC", sourceUrl: "https://www.pro-football-reference.com/teams/chi/1986.htm" },
  { id: "verified-ditka-mcginnis", parent: "Mike Ditka", child: "Dave McGinnis", kind: "direct", team: "Chicago Bears", years: "1986–1992", role: "LB Coach", sourceUrl: "https://www.chicagobears.com/news/former-bears-assistant-coach-dave-mcginnis-passes-away" },
  { id: "verified-tobin-mcginnis", parent: "Vince Tobin", child: "Dave McGinnis", kind: "direct", team: "Arizona Cardinals", years: "1996–2000", role: "DC", sourceUrl: "https://www.azcardinals.com/news/former-cardinals-coach-dave-mcginnis-passes-away-2026" },
];
