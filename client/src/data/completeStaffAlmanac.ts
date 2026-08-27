/* Archive Atlas data reminder: every annual entry preserves the season-specific HC, OC, DC and its year source. */
import type { Role } from "./coaches";

export type CompleteSeasonStaffRecord = {
  id: string;
  lineageId: string;
  team: string;
  season: number;
  sourceUrl: string;
  sourceLabel: string;
  note: string;
  members: Array<{
    name: string;
    japanese: string;
    role: Role;
    contemporaneousRole: string;
    note: string;
  }>;
};

const roleTitle: Record<Role, string> = {
  HC: "Head Coach",
  OC: "Offensive Coordinator",
  DC: "Defensive Coordinator",
};

function sourceUrl(teamCode: string, season: number) {
  return teamCode === "atl"
    ? `https://www.pro-football-reference.com/years/${season}/teams/atl.htm`
    : `https://www.pro-football-reference.com/teams/${teamCode}/${season}.htm`;
}

function member(name: string, role: Role) {
  return { name, japanese: "", role, contemporaneousRole: roleTitle[role], note: role };
}

function seasonRecord(lineageId: string, team: string, teamCode: string, season: number, hc: string, oc: string, dc: string, note = "年次スタッフ記録。") : CompleteSeasonStaffRecord {
  return {
    id: `almanac-${lineageId}-${teamCode}-${season}`,
    lineageId,
    team,
    season,
    sourceUrl: sourceUrl(teamCode, season),
    sourceLabel: `Pro Football Reference — ${season} ${team}`,
    note,
    members: [member(hc, "HC"), member(oc, "OC"), member(dc, "DC")],
  };
}

function range(lineageId: string, team: string, teamCode: string, start: number, end: number, hc: string, oc: string, dc: string, note?: string) {
  return Array.from({ length: end - start + 1 }, (_, offset) => seasonRecord(lineageId, team, teamCode, start + offset, hc, oc, dc, note));
}

function officialSeasonRecord(lineageId: string, team: string, teamCode: string, season: number, hc: string, oc: string, dc: string, source: string, sourceLabel: string, note: string): CompleteSeasonStaffRecord {
  return { ...seasonRecord(lineageId, team, teamCode, season, hc, oc, dc, note), sourceUrl: source, sourceLabel };
}

export const completeStaffAlmanac: CompleteSeasonStaffRecord[] = [
  // Belichick
  ...range("belichick", "New York Giants", "nyg", 1983, 1984, "Bill Parcells", "Ron Erhardt", "記載なし（年次資料に正式DC表記なし）", "年次資料に正式なDefensive Coordinator表記がないシーズン。"),
  ...range("belichick", "New York Giants", "nyg", 1985, 1990, "Bill Parcells", "Ron Erhardt", "Bill Belichick"),
  ...range("belichick", "New England Patriots", "nwe", 2000, 2004, "Bill Belichick", "Charlie Weis", "Romeo Crennel"),
  seasonRecord("belichick", "New England Patriots", "nwe", 2005, "Bill Belichick", "なし（公式OCなし）", "Eric Mangini", "公式に独立したOCを置かなかったシーズン。"),
  ...range("belichick", "New England Patriots", "nwe", 2006, 2008, "Bill Belichick", "Josh McDaniels", "Dean Pees"),
  seasonRecord("belichick", "New England Patriots", "nwe", 2009, "Bill Belichick", "Bill O'Brien", "Dean Pees"),
  seasonRecord("belichick", "New England Patriots", "nwe", 2010, "Bill Belichick", "なし（公式OCなし）", "なし（公式DCなし／Matt Patriciaが実質的な守備プレーコーラー）", "公式に独立したOC・DCを置かなかったシーズン。"),
  seasonRecord("belichick", "New England Patriots", "nwe", 2011, "Bill Belichick", "Bill O'Brien", "なし（公式DCなし／Matt Patriciaが実質的な守備プレーコーラー）", "公式に独立したDCを置かなかったシーズン。"),
  ...range("belichick", "New England Patriots", "nwe", 2012, 2017, "Bill Belichick", "Josh McDaniels", "Matt Patricia"),
  seasonRecord("belichick", "New England Patriots", "nwe", 2018, "Bill Belichick", "Josh McDaniels", "Brian Flores（Defensive Playcaller／Linebackers Coach）", "公式DCの肩書きではなく、守備プレーコーラーの原表記を保持。"),
  seasonRecord("belichick", "New England Patriots", "nwe", 2019, "Bill Belichick", "Josh McDaniels", "なし（公式DCなし）", "公式に独立したDCを置かなかったシーズン。"),
  seasonRecord("belichick", "New England Patriots", "nwe", 2020, "Bill Belichick", "Josh McDaniels", "なし（公式DCなし／Steve Belichickが実質的な守備プレーコーラー）", "公式に独立したDCを置かなかったシーズン。"),
  seasonRecord("belichick", "New England Patriots", "nwe", 2021, "Bill Belichick", "Josh McDaniels", "なし（公式DCなし／Steve Belichickが実質的な守備プレーコーラー）", "公式に独立したDCを置かなかったシーズン。"),
  seasonRecord("belichick", "New England Patriots", "nwe", 2022, "Bill Belichick", "なし（Matt Patriciaが攻撃プレーコーラー）", "なし（Steve Belichickが守備プレーコーラー）", "公式に独立したOC・DCを置かなかったシーズン。"),
  seasonRecord("belichick", "New England Patriots", "nwe", 2023, "Bill Belichick", "Bill O'Brien", "なし（公式DCなし／Steve Belichickが守備プレーコーラー）", "公式に独立したDCを置かなかったシーズン。"),

  // Reid
  ...range("reid", "Green Bay Packers", "gnb", 1992, 1993, "Mike Holmgren", "Sherman Lewis", "Ray Rhodes"),
  ...range("reid", "Green Bay Packers", "gnb", 1994, 1998, "Mike Holmgren", "Sherman Lewis", "Fritz Shurmur"),
  ...range("reid", "Philadelphia Eagles", "phi", 1999, 2001, "Andy Reid", "Rod Dowhower", "Jim Johnson"),
  ...range("reid", "Philadelphia Eagles", "phi", 2002, 2005, "Andy Reid", "Brad Childress", "Jim Johnson"),
  ...range("reid", "Philadelphia Eagles", "phi", 2006, 2008, "Andy Reid", "Marty Mornhinweg", "Jim Johnson"),
  ...range("reid", "Philadelphia Eagles", "phi", 2009, 2010, "Andy Reid", "Marty Mornhinweg", "Sean McDermott"),
  seasonRecord("reid", "Philadelphia Eagles", "phi", 2011, "Andy Reid", "Marty Mornhinweg", "Juan Castillo"),
  seasonRecord("reid", "Philadelphia Eagles", "phi", 2012, "Andy Reid", "Marty Mornhinweg", "Juan Castillo → Todd Bowles", "シーズン途中のDC交代を在任順に表示。"),
  ...range("reid", "Kansas City Chiefs", "kan", 2013, 2015, "Andy Reid", "Doug Pederson", "Bob Sutton"),
  seasonRecord("reid", "Kansas City Chiefs", "kan", 2016, "Andy Reid", "Brad Childress／Matt Nagy（Co-Offensive Coordinators）", "Bob Sutton", "共同OCの原表記を保持。"),
  seasonRecord("reid", "Kansas City Chiefs", "kan", 2017, "Andy Reid", "Matt Nagy", "Bob Sutton"),
  seasonRecord("reid", "Kansas City Chiefs", "kan", 2018, "Andy Reid", "Eric Bieniemy", "Bob Sutton"),
  ...range("reid", "Kansas City Chiefs", "kan", 2019, 2022, "Andy Reid", "Eric Bieniemy", "Steve Spagnuolo"),
  ...range("reid", "Kansas City Chiefs", "kan", 2023, 2025, "Andy Reid", "Matt Nagy", "Steve Spagnuolo"),

  // Shanahan
  ...range("shanahan", "Denver Broncos", "den", 1995, 2000, "Mike Shanahan", "Gary Kubiak", "Greg Robinson"),
  ...range("shanahan", "Denver Broncos", "den", 2001, 2002, "Mike Shanahan", "Gary Kubiak", "Ray Rhodes"),
  ...range("shanahan", "Denver Broncos", "den", 2003, 2005, "Mike Shanahan", "Gary Kubiak", "Larry Coyer"),
  seasonRecord("shanahan", "Denver Broncos", "den", 2006, "Mike Shanahan", "Rick Dennison", "Larry Coyer"),
  ...range("shanahan", "Denver Broncos", "den", 2007, 2008, "Mike Shanahan", "Rick Dennison", "Bob Slowik"),
  ...range("shanahan", "Washington", "was", 2010, 2013, "Mike Shanahan", "Kyle Shanahan", "Jim Haslett"),
  ...range("shanahan", "San Francisco 49ers", "sfo", 2017, 2020, "Kyle Shanahan", "なし（Kyle Shanahanが攻撃を指揮）", "Robert Saleh", "公式に独立したOCを置かなかったシーズン。"),
  seasonRecord("shanahan", "San Francisco 49ers", "sfo", 2021, "Kyle Shanahan", "Mike McDaniel", "DeMeco Ryans"),
  seasonRecord("shanahan", "San Francisco 49ers", "sfo", 2022, "Kyle Shanahan", "なし（公式OCなし／攻撃は役割分担）", "DeMeco Ryans", "公式に独立したOCを置かなかったシーズン。"),
  seasonRecord("shanahan", "San Francisco 49ers", "sfo", 2023, "Kyle Shanahan", "なし（公式OCなし／Klint KubiakはPassing Game Coordinator）", "Steve Wilks", "公式に独立したOCを置かなかったシーズン。"),
  seasonRecord("shanahan", "San Francisco 49ers", "sfo", 2024, "Kyle Shanahan", "なし（公式OCなし／Klay KubiakはPass Game Specialist）", "Nick Sorensen", "公式に独立したOCを置かなかったシーズン。"),
  seasonRecord("shanahan", "San Francisco 49ers", "sfo", 2025, "Kyle Shanahan", "Klay Kubiak", "Robert Saleh"),

  // Dungy
  ...range("dungy", "Tampa Bay Buccaneers", "tam", 1996, 1999, "Tony Dungy", "Mike Shula", "Monte Kiffin"),
  seasonRecord("dungy", "Tampa Bay Buccaneers", "tam", 2000, "Tony Dungy", "Les Steckel", "Monte Kiffin"),
  seasonRecord("dungy", "Tampa Bay Buccaneers", "tam", 2001, "Tony Dungy", "Clyde Christensen", "Monte Kiffin"),
  ...range("dungy", "Indianapolis Colts", "clt", 2002, 2008, "Tony Dungy", "Tom Moore", "Ron Meeks"),
  ...range("dungy", "Pittsburgh Steelers", "pit", 1992, 1994, "Bill Cowher", "Ron Erhardt", "Dom Capers"),
  seasonRecord("dungy", "Pittsburgh Steelers", "pit", 1995, "Bill Cowher", "Ron Erhardt", "Dick LeBeau"),

  // Holmgren
  ...range("holmgren", "Green Bay Packers", "gnb", 1992, 1993, "Mike Holmgren", "Sherman Lewis", "Ray Rhodes"),
  ...range("holmgren", "Green Bay Packers", "gnb", 1994, 1998, "Mike Holmgren", "Sherman Lewis", "Fritz Shurmur"),
  seasonRecord("holmgren", "Seattle Seahawks", "sea", 1999, "Mike Holmgren", "Mike Sherman", "Jim Lind"),
  ...range("holmgren", "Seattle Seahawks", "sea", 2000, 2002, "Mike Holmgren", "Gil Haskell", "Steve Sidwell"),
  ...range("holmgren", "Seattle Seahawks", "sea", 2003, 2004, "Mike Holmgren", "Gil Haskell", "Ray Rhodes"),
  seasonRecord("holmgren", "Seattle Seahawks", "sea", 2005, "Mike Holmgren", "Gil Haskell", "John Marshall／Ray Rhodes", "DCのシーズン途中の担当を併記。"),
  ...range("holmgren", "Seattle Seahawks", "sea", 2006, 2008, "Mike Holmgren", "Gil Haskell", "John Marshall"),
  ...range("holmgren", "Philadelphia Eagles", "phi", 1999, 2001, "Andy Reid", "Rod Dowhower", "Jim Johnson"),
  ...range("holmgren", "Philadelphia Eagles", "phi", 2002, 2005, "Andy Reid", "Brad Childress", "Jim Johnson"),
  ...range("holmgren", "Philadelphia Eagles", "phi", 2006, 2008, "Andy Reid", "Marty Mornhinweg", "Jim Johnson"),
  ...range("holmgren", "Philadelphia Eagles", "phi", 2009, 2010, "Andy Reid", "Marty Mornhinweg", "Sean McDermott"),
  seasonRecord("holmgren", "Philadelphia Eagles", "phi", 2011, "Andy Reid", "Marty Mornhinweg", "Juan Castillo"),
  seasonRecord("holmgren", "Philadelphia Eagles", "phi", 2012, "Andy Reid", "Marty Mornhinweg", "Todd Bowles／Juan Castillo", "シーズン途中のDC交代を在任順に表示。"),

  // Carroll
  seasonRecord("carroll", "Seattle Seahawks", "sea", 2010, "Pete Carroll", "Jeremy Bates", "Gus Bradley"),
  ...range("carroll", "Seattle Seahawks", "sea", 2011, 2012, "Pete Carroll", "Darrell Bevell", "Gus Bradley"),
  ...range("carroll", "Seattle Seahawks", "sea", 2013, 2014, "Pete Carroll", "Darrell Bevell", "Dan Quinn"),
  ...range("carroll", "Seattle Seahawks", "sea", 2015, 2017, "Pete Carroll", "Darrell Bevell", "Kris Richard"),
  ...range("carroll", "Seattle Seahawks", "sea", 2018, 2020, "Pete Carroll", "Brian Schottenheimer", "Ken Norton Jr."),
  seasonRecord("carroll", "Seattle Seahawks", "sea", 2021, "Pete Carroll", "Shane Waldron", "Ken Norton Jr."),
  ...range("carroll", "Seattle Seahawks", "sea", 2022, 2023, "Pete Carroll", "Shane Waldron", "Clint Hurtt"),
  ...range("carroll", "Jacksonville Jaguars", "jax", 2013, 2014, "Gus Bradley", "Jedd Fisch", "Bob Babich"),
  seasonRecord("carroll", "Jacksonville Jaguars", "jax", 2015, "Gus Bradley", "Greg Olson", "Bob Babich"),
  seasonRecord("carroll", "Jacksonville Jaguars", "jax", 2016, "Doug Marrone（暫定）／Gus Bradley", "Nathaniel Hackett（シーズン途中昇格）／Greg Olson", "Todd Wash", "シーズン途中のHC・OC交代を在任順に表示。"),
  ...range("carroll", "Atlanta Falcons", "atl", 2015, 2016, "Dan Quinn", "Kyle Shanahan", "Richard Smith"),
  ...range("carroll", "Atlanta Falcons", "atl", 2017, 2018, "Dan Quinn", "Steve Sarkisian", "Marquand Manuel"),
  seasonRecord("carroll", "Atlanta Falcons", "atl", 2019, "Dan Quinn", "Dirk Koetter", "Dan Quinn", "Dan QuinnがHCとDCを兼務。"),
  seasonRecord("carroll", "Atlanta Falcons", "atl", 2020, "Dan Quinn／Raheem Morris（interim）", "Dirk Koetter", "Raheem Morris／Jeff Ulbrich（interim）", "シーズン途中のHC・DC交代を在任順に表示。"),

  // Cowher
  ...range("cowher", "Pittsburgh Steelers", "pit", 1992, 1994, "Bill Cowher", "Ron Erhardt", "Dom Capers"),
  seasonRecord("cowher", "Pittsburgh Steelers", "pit", 1995, "Bill Cowher", "Ron Erhardt", "Dick LeBeau"),
  seasonRecord("cowher", "Pittsburgh Steelers", "pit", 1996, "Bill Cowher", "Chan Gailey", "Dick LeBeau"),
  seasonRecord("cowher", "Pittsburgh Steelers", "pit", 1997, "Bill Cowher", "Chan Gailey", "Jim Haslett"),
  ...range("cowher", "Pittsburgh Steelers", "pit", 1998, 1999, "Bill Cowher", "Ray Sherman", "Jim Haslett"),
  seasonRecord("cowher", "Pittsburgh Steelers", "pit", 2000, "Bill Cowher", "Kevin Gilbride", "Tim Lewis"),
  ...range("cowher", "Pittsburgh Steelers", "pit", 2001, 2003, "Bill Cowher", "Mike Mularkey", "Tim Lewis"),
  ...range("cowher", "Pittsburgh Steelers", "pit", 2004, 2006, "Bill Cowher", "Ken Whisenhunt", "Dick LeBeau"),

  // Gruden
  ...range("gruden", "Oakland Raiders", "rai", 1998, 1999, "Jon Gruden", "Bill Callahan", "Willie Shaw"),
  ...range("gruden", "Oakland Raiders", "rai", 2000, 2001, "Jon Gruden", "Bill Callahan", "Chuck Bresnahan"),
  ...range("gruden", "Tampa Bay Buccaneers", "tam", 2002, 2008, "Jon Gruden", "Bill Muir", "Monte Kiffin"),

  // Walsh
  ...range("walsh", "San Francisco 49ers", "sfo", 1979, 1982, "Bill Walsh", "なし（Bill Walshが攻撃を統括）", "Chuck Studley", "Bill WalshがHCと攻撃を兼務。"),
  ...range("walsh", "San Francisco 49ers", "sfo", 1983, 1988, "Bill Walsh", "なし（Bill Walshが攻撃を統括）", "George Seifert", "Bill WalshがHCと攻撃を兼務。"),

  // Parcells
  ...range("parcells", "New York Giants", "nyg", 1983, 1984, "Bill Parcells", "Ron Erhardt", "なし（正式DCの記載なし）", "年次資料に正式なDC表記がないシーズン。"),
  ...range("parcells", "New York Giants", "nyg", 1985, 1990, "Bill Parcells", "Ron Erhardt", "Bill Belichick"),
  ...range("parcells", "New England Patriots", "nwe", 1993, 1996, "Bill Parcells", "Ray Perkins", "Al Groh"),
  ...range("parcells", "New York Jets", "nyj", 1997, 1999, "Bill Parcells", "Charlie Weis", "Bill Belichick"),
  ...range("parcells", "Dallas Cowboys", "dal", 2003, 2004, "Bill Parcells", "Maurice Carthon", "Mike Zimmer"),
  ...range("parcells", "Dallas Cowboys", "dal", 2005, 2006, "Bill Parcells", "なし（正式OCの記載なし）", "Mike Zimmer", "年次資料に正式なOC表記がないシーズン。"),

  // Schottenheimer
  seasonRecord("schottenheimer", "Cleveland Browns", "cle", 1984, "Sam Rutigliano／Marty Schottenheimer", "Joe Scannella", "Marty Schottenheimer", "シーズン途中のHC交代を在任順に表示。"),
  seasonRecord("schottenheimer", "Cleveland Browns", "cle", 1985, "Marty Schottenheimer", "Joe Pendry", "Tom Bettis"),
  ...range("schottenheimer", "Cleveland Browns", "cle", 1986, 1987, "Marty Schottenheimer", "Lindy Infante", "Dave Adolph"),
  seasonRecord("schottenheimer", "Cleveland Browns", "cle", 1988, "Marty Schottenheimer", "Joe Pendry", "Dave Adolph"),
  ...range("schottenheimer", "Kansas City Chiefs", "kan", 1989, 1991, "Marty Schottenheimer", "Joe Pendry", "Bill Cowher"),
  ...range("schottenheimer", "Kansas City Chiefs", "kan", 1992, 1994, "Marty Schottenheimer", "Paul Hackett", "Dave Adolph"),
  ...range("schottenheimer", "Kansas City Chiefs", "kan", 1995, 1998, "Marty Schottenheimer", "Paul Hackett", "Gunther Cunningham"),
  seasonRecord("schottenheimer", "Washington", "was", 2001, "Marty Schottenheimer", "Jimmy Raye", "Kurt Schottenheimer"),
  ...range("schottenheimer", "San Diego Chargers", "sdg", 2002, 2003, "Marty Schottenheimer", "Cam Cameron", "Dale Lindsey"),
  ...range("schottenheimer", "San Diego Chargers", "sdg", 2004, 2006, "Marty Schottenheimer", "Cam Cameron", "Wade Phillips"),

  // Reeves
  ...range("reeves", "Denver Broncos", "den", 1981, 1982, "Dan Reeves", "Rod Dowhower", "Joe Collier"),
  seasonRecord("reeves", "Denver Broncos", "den", 1983, "Dan Reeves", "John Hadl", "Joe Collier"),
  seasonRecord("reeves", "Denver Broncos", "den", 1984, "Dan Reeves", "なし（正式OCの記載なし）", "Joe Collier", "年次資料に正式なOC表記がないシーズン。"),
  ...range("reeves", "Denver Broncos", "den", 1985, 1987, "Dan Reeves", "Mike Shanahan", "Joe Collier"),
  seasonRecord("reeves", "Denver Broncos", "den", 1988, "Dan Reeves", "George Henshaw", "Joe Collier"),
  ...range("reeves", "Denver Broncos", "den", 1989, 1990, "Dan Reeves", "George Henshaw", "Wade Phillips"),
  seasonRecord("reeves", "Denver Broncos", "den", 1991, "Dan Reeves", "Mike Shanahan", "Wade Phillips"),
  seasonRecord("reeves", "Denver Broncos", "den", 1992, "Dan Reeves", "George Henshaw", "Wade Phillips"),
  ...range("reeves", "New York Giants", "nyg", 1993, 1996, "Dan Reeves", "George Henshaw", "Mike Nolan"),
  ...range("reeves", "Atlanta Falcons", "atl", 1997, 2000, "Dan Reeves", "George Sefcik", "Rich Brooks"),
  ...range("reeves", "Atlanta Falcons", "atl", 2001, 2002, "Dan Reeves", "George Sefcik", "Don Blackmon"),
  seasonRecord("reeves", "Atlanta Falcons", "atl", 2003, "Dan Reeves／Wade Phillips", "Pete Mangurian", "Wade Phillips", "シーズン途中のHC交代を在任順に表示。"),

  // Gibbs
  ...range("gibbs", "Washington Redskins", "was", 1981, 1983, "Joe Gibbs", "Joe Bugel", "Richie Petitbon"),
  ...range("gibbs", "Washington Redskins", "was", 1984, 1990, "Joe Gibbs", "Joe Bugel", "Larry Peccatiello／Richie Petitbon"),
  seasonRecord("gibbs", "Washington Redskins", "was", 1991, "Joe Gibbs", "記載なし（Joe Gibbsが攻撃を統括）", "Larry Peccatiello／Richie Petitbon", "年次資料に正式なOC表記がないシーズン。"),
  seasonRecord("gibbs", "Washington Redskins", "was", 1992, "Joe Gibbs", "記載なし（正式OCの記載なし）", "Larry Peccatiello／Richie Petitbon", "年次資料に正式なOC表記がないシーズン。"),
  ...range("gibbs", "Washington", "was", 2004, 2005, "Joe Gibbs", "Don Breaux", "Gregg Williams"),
  ...range("gibbs", "Washington", "was", 2006, 2007, "Joe Gibbs", "Don Breaux／Al Saunders", "Gregg Williams"),

  // 2026 new head coaches — official preseason staff listings, subject to in-season change.
  officialSeasonRecord("hafley", "Miami Dolphins", "mia", 2026, "Jeff Hafley", "Bobby Slowik", "Sean Duggan", "https://www.miamidolphins.com/news/miami-dolphins-announce-2026-coaching-staff", "Miami Dolphins — 2026 coaching staff", "2026年8月時点の公式スタッフ発表。シーズン進行中のため変更の可能性あり。"),
  officialSeasonRecord("minter", "Baltimore Ravens", "rav", 2026, "Jesse Minter", "Declan Doyle", "Anthony Weaver", "https://www.baltimoreravens.com/news/ravens-full-coaching-staff-coaches-jesse-minter-offense-defense-special-teams", "Baltimore Ravens — 2026 coaching staff", "2026年2月発表の公式スタッフ。シーズン進行中のため変更の可能性あり。"),
  officialSeasonRecord("brady", "Buffalo Bills", "buf", 2026, "Joe Brady", "Pete Carmichael", "Jim Leonhard", "https://www.buffalobills.com/team/coaches-roster/", "Buffalo Bills — current coaching staff", "2026年8月時点の公式スタッフ一覧。シーズン進行中のため変更の可能性あり。"),
  officialSeasonRecord("kubiak", "Las Vegas Raiders", "rai", 2026, "Klint Kubiak", "Andrew Janocko", "Rob Leonard", "https://www.raiders.com/news/raiders-announce-2026-coaching-staff", "Las Vegas Raiders — 2026 coaching staff", "2026年3月発表の公式スタッフ。シーズン進行中のため変更の可能性あり。"),
  officialSeasonRecord("mlafleur", "Arizona Cardinals", "crd", 2026, "Mike LaFleur", "Nathaniel Hackett", "Nick Rallis", "https://www.azcardinals.com/team/coaches-roster/", "Arizona Cardinals — current coaching staff", "2026年8月時点の公式スタッフ一覧。シーズン進行中のため変更の可能性あり。"),
  officialSeasonRecord("monken", "Cleveland Browns", "cle", 2026, "Todd Monken", "Travis Switzer", "Mike Rutenberg", "https://www.clevelandbrowns.com/team/coaches-roster/", "Cleveland Browns — current coaching staff", "2026年3月時点の公式スタッフ一覧。シーズン進行中のため変更の可能性あり。"),
];
