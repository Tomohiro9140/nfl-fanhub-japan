/**
 * Archive Atlas data reminder: an edge exists only when the root coach was HC
 * and the linked coach served on that same NFL staff during an overlapping season.
 */
export type DirectStaffEdge = {
  id: string;
  root: string;
  staff: string;
  team: string;
  years: string;
  note: string;
  sourceUrl: string;
};

export const directStaffLineageSpecs = [
  { id: "belichick", root: "Bill Belichick", label: "BELICHICK", japanese: "ビル・ベリチック系" },
  { id: "reid", root: "Andy Reid", label: "REID", japanese: "アンディ・リード系" },
  { id: "shanahan", root: "Mike Shanahan", label: "SHANAHAN", japanese: "マイク・シャナハン系" },
  { id: "dungy", root: "Tony Dungy", label: "DUNGY", japanese: "トニー・ダンジー系" },
  { id: "holmgren", root: "Mike Holmgren", label: "HOLMGREN", japanese: "マイク・ホルムグレン系" },
  { id: "carroll", root: "Pete Carroll", label: "CARROLL", japanese: "ピート・キャロル系" },
  { id: "cowher", root: "Bill Cowher", label: "COWHER", japanese: "ビル・カウアー系" },
  { id: "gruden", root: "Jon Gruden", label: "GRUDEN", japanese: "ジョン・グルーデン系" },
] as const;

const pfr = "https://www.pro-football-reference.com/teams/";

export const directStaffEdges: DirectStaffEdge[] = [
  { id: "belichick-saban-cle-1991", root: "Bill Belichick", staff: "Nick Saban", team: "Cleveland Browns", years: "1991–1994", note: "Belichick HC、Saban DC", sourceUrl: "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history" },
  { id: "belichick-venturi-cle-1995", root: "Bill Belichick", staff: "Rick Venturi", team: "Cleveland Browns", years: "1995", note: "Belichick HC、Venturi DC", sourceUrl: "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history" },
  { id: "belichick-crosby-cle-1994", root: "Bill Belichick", staff: "Steve Crosby", team: "Cleveland Browns", years: "1994–1995", note: "Belichick HC、Crosby OC", sourceUrl: "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history" },
  { id: "belichick-crennel-nwe-2001", root: "Bill Belichick", staff: "Romeo Crennel", team: "New England Patriots", years: "2001–2004", note: "Belichick HC、Crennel DC", sourceUrl: `${pfr}nwe/coaches.htm` },
  { id: "belichick-mangini-nwe-2005", root: "Bill Belichick", staff: "Eric Mangini", team: "New England Patriots", years: "2005", note: "Belichick HC、Mangini DC", sourceUrl: `${pfr}nwe/coaches.htm` },
  { id: "belichick-mcdaniels-nwe-2006", root: "Bill Belichick", staff: "Josh McDaniels", team: "New England Patriots", years: "2006–2008 / 2012–2021", note: "Belichick HC、McDaniels OC", sourceUrl: "https://www.patriots.com/team/coaches-roster/josh-mcdaniels" },
  { id: "belichick-daboll-nwe-2000", root: "Bill Belichick", staff: "Brian Daboll", team: "New England Patriots", years: "2000–2006", note: "Belichick HC、Dabollは攻撃スタッフ", sourceUrl: "https://www.espn.com/blog/boston/new-england-patriots/post/_/id/4738534/patriots-add-daboll-to-coaching-staff" },
  { id: "belichick-obrien-nwe-2011", root: "Bill Belichick", staff: "Bill O’Brien", team: "New England Patriots", years: "2011 / 2023", note: "Belichick HC、O’Brien OC", sourceUrl: `${pfr}nwe/coaches.htm` },
  { id: "belichick-patricia-nwe-2012", root: "Bill Belichick", staff: "Matt Patricia", team: "New England Patriots", years: "2012–2017", note: "Belichick HC、Patricia DC", sourceUrl: `${pfr}nwe/coaches.htm` },
  { id: "belichick-flores-nwe-2019", root: "Bill Belichick", staff: "Brian Flores", team: "New England Patriots", years: "2019", note: "Belichick HC、Floresは守備スタッフ", sourceUrl: `${pfr}nwe/coaches.htm` },
  { id: "belichick-judge-nwe-2015", root: "Bill Belichick", staff: "Joe Judge", team: "New England Patriots", years: "2015–2019", note: "Belichick HC、JudgeはSTC／攻撃スタッフ", sourceUrl: "https://www.giants.com/news/joe-judge-head-coach-5-things-to-know-patriots-special-teams-coordinator" },
  { id: "belichick-mayo-nwe-2019", root: "Bill Belichick", staff: "Jerod Mayo", team: "New England Patriots", years: "2019–2023", note: "Belichick HC、MayoはLBコーチ", sourceUrl: `${pfr}nwe/coaches.htm` },

  { id: "reid-harbaugh-phi-1999", root: "Andy Reid", staff: "John Harbaugh", team: "Philadelphia Eagles", years: "1999–2007", note: "Reid HC、HarbaughはSTC", sourceUrl: "https://www.baltimoreravens.com/news/john-harbaugh-bio-7748188" },
  { id: "reid-mcdermott-phi-2001", root: "Andy Reid", staff: "Sean McDermott", team: "Philadelphia Eagles", years: "2001–2010", note: "Reid HC、McDermottは守備スタッフ／DC", sourceUrl: "https://pro-football-history.com/franchpos/114/8/philadelphia-eagles-defensive-coordinator-history" },
  { id: "reid-pederson-phi-2009", root: "Andy Reid", staff: "Doug Pederson", team: "Philadelphia Eagles", years: "2009–2012", note: "Reid HC、PedersonはQBコーチ", sourceUrl: "https://www.philadelphiaeagles.com/news/eagles-name-doug-pederson-head-coach-16709050" },
  { id: "reid-pederson-kan-2013", root: "Andy Reid", staff: "Doug Pederson", team: "Kansas City Chiefs", years: "2013–2015", note: "Reid HC、Pederson OC", sourceUrl: "https://www.chiefs.com/team/coaches-roster/" },
  { id: "reid-rivera-phi-1999", root: "Andy Reid", staff: "Ron Rivera", team: "Philadelphia Eagles", years: "1999–2003", note: "Reid HC、RiveraはLBコーチ", sourceUrl: "https://calbears.com/sports/football/roster/staff/ron-rivera/1102" },
  { id: "reid-childress-phi-1999", root: "Andy Reid", staff: "Brad Childress", team: "Philadelphia Eagles", years: "1999–2005", note: "Reid HC、ChildressはQBコーチ／OC", sourceUrl: "https://www.chiefs.com/news/five-things-to-know-about-brad-childress-16734114" },
  { id: "reid-spagnuolo-phi-1999", root: "Andy Reid", staff: "Steve Spagnuolo", team: "Philadelphia Eagles", years: "1999–2006", note: "Reid HC、Spagnuoloは守備スタッフ", sourceUrl: "https://www.giants.com/news/10-things-you-need-to-know-about-steve-spagnuolo-14789642" },
  { id: "reid-spagnuolo-kan-2019", root: "Andy Reid", staff: "Steve Spagnuolo", team: "Kansas City Chiefs", years: "2019–2026", note: "Reid HC、Spagnuolo DC", sourceUrl: "https://www.chiefs.com/team/coaches-roster/steve-spagnuolo" },

  { id: "shanahan-kubiak-den-1995", root: "Mike Shanahan", staff: "Gary Kubiak", team: "Denver Broncos", years: "1995–2005", note: "Shanahan HC、Kubiak OC", sourceUrl: "https://www.denverbroncos.com/news/super-bowl-winning-broncos-head-coach-gary-kubiak-retires-from-nfl" },
  { id: "shanahan-kyle-was-2010", root: "Mike Shanahan", staff: "Kyle Shanahan", team: "Washington", years: "2010–2013", note: "Shanahan HC、Kyle Shanahan OC", sourceUrl: "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history" },
  { id: "shanahan-mcvay-was-2010", root: "Mike Shanahan", staff: "Sean McVay", team: "Washington", years: "2010–2013", note: "Shanahan HC、McVayはTEコーチ", sourceUrl: "https://www.commanders.com/news/los-angeles-rams-hire-sean-mcvay-as-head-coach-18434587" },
  { id: "shanahan-lafleur-was-2010", root: "Mike Shanahan", staff: "Matt LaFleur", team: "Washington", years: "2010–2013", note: "Shanahan HC、LaFleurはQBコーチ", sourceUrl: "https://www.atlantafalcons.com/news/five-things-about-new-qb-coach-matt-lafleur-14979945" },
  { id: "shanahan-mcdaniel-was-2011", root: "Mike Shanahan", staff: "Mike McDaniel", team: "Washington", years: "2011–2013", note: "Shanahan HC、McDanielは攻撃スタッフ", sourceUrl: "https://www.miamidolphins.com/news/five-facts-miami-dolphins-head-coach-mike-mcdaniel" },
  { id: "shanahan-morris-was-2012", root: "Mike Shanahan", staff: "Raheem Morris", team: "Washington", years: "2012–2013", note: "Shanahan HC、Morrisはセカンダリーコーチ", sourceUrl: "https://www.commanders.com/news/redskins-add-morris-to-coaching-staff-6853256" },
  { id: "shanahan-haslett-was-2010", root: "Mike Shanahan", staff: "Jim Haslett", team: "Washington", years: "2010–2013", note: "Shanahan HC、Haslett DC", sourceUrl: "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history" },

  { id: "dungy-kiffin-tb-1996", root: "Tony Dungy", staff: "Monte Kiffin", team: "Tampa Bay Buccaneers", years: "1996–2001", note: "Dungy HC、Kiffin DC", sourceUrl: "https://www.buccaneers.com/news/branching-out-2173546" },
  { id: "dungy-smith-tb-1996", root: "Tony Dungy", staff: "Lovie Smith", team: "Tampa Bay Buccaneers", years: "1996–2000", note: "Dungy HC、SmithはLBコーチ", sourceUrl: "https://www.houstontexans.com/news/lovie-smith-s-biography-houston-texans-head-coach" },
  { id: "dungy-edwards-tb-1996", root: "Tony Dungy", staff: "Herm Edwards", team: "Tampa Bay Buccaneers", years: "1996–2000", note: "Dungy HC、EdwardsはDBコーチ", sourceUrl: "https://espnpressroom.com/bio/herm-edwards/" },
  { id: "dungy-marinelli-tb-1996", root: "Tony Dungy", staff: "Rod Marinelli", team: "Tampa Bay Buccaneers", years: "1996–2000", note: "Dungy HC、MarinelliはDLコーチ", sourceUrl: "https://www.raiders.com/news/las-vegas-raiders-announce-hiring-of-rod-marinelli-and-austin-king" },
  { id: "dungy-caldwell-tb-2001", root: "Tony Dungy", staff: "Jim Caldwell", team: "Tampa Bay Buccaneers", years: "2001", note: "Dungy HC、CaldwellはQBコーチ", sourceUrl: "https://www.panthers.com/news/five-things-to-know-about-jim-caldwell" },
  { id: "dungy-tomlin-tb-2001", root: "Tony Dungy", staff: "Mike Tomlin", team: "Tampa Bay Buccaneers", years: "2001", note: "Dungy HC、TomlinはDBコーチ", sourceUrl: "https://www.steelers.com/news/labriola-on-tomlin-coach-of-the-year" },

  { id: "holmgren-reid-gb-1992", root: "Mike Holmgren", staff: "Andy Reid", team: "Green Bay Packers", years: "1992–1998", note: "Holmgren HC、Reidは攻撃スタッフ", sourceUrl: "https://www.packers.com/news/dope-sheet-packers-and-chiefs-meet-in-kansas-city" },
  { id: "holmgren-gruden-gb-1992", root: "Mike Holmgren", staff: "Jon Gruden", team: "Green Bay Packers", years: "1992–1994", note: "Holmgren HC、GrudenはWRコーチ", sourceUrl: "https://www.raiders.com/news/jon-gruden-biography-20210171" },
  { id: "holmgren-mariucci-gb-1992", root: "Mike Holmgren", staff: "Steve Mariucci", team: "Green Bay Packers", years: "1992–1995", note: "Holmgren HC、MariucciはQBコーチ", sourceUrl: "https://newsarchive.berkeley.edu/news/berkeleyan/1996/0911/mariucci.html" },
  { id: "holmgren-sherman-gb-1992", root: "Mike Holmgren", staff: "Mike Sherman", team: "Green Bay Packers", years: "1992–1998", note: "Holmgren HC、ShermanはTEコーチ", sourceUrl: "https://www.packers.com/history/" },

  { id: "carroll-quinn-sea-2010", root: "Pete Carroll", staff: "Dan Quinn", team: "Seattle Seahawks", years: "2010–2014", note: "Carroll HC、QuinnはDLコーチ／DC", sourceUrl: "https://www.seahawks.com/news/pete-carroll-s-coaching-tree-continues-to-grow-in-nfl-183261" },
  { id: "carroll-bradley-sea-2010", root: "Pete Carroll", staff: "Gus Bradley", team: "Seattle Seahawks", years: "2010–2012", note: "Carroll HC、Bradley DC", sourceUrl: "https://www.tennesseetitans.com/team/coaches-roster/gus-bradley" },
  { id: "carroll-saleh-sea-2011", root: "Pete Carroll", staff: "Robert Saleh", team: "Seattle Seahawks", years: "2011–2013", note: "Carroll HC、Salehは守備QC", sourceUrl: "https://www.seahawks.com/news/pete-carroll-s-coaching-tree-continues-to-grow-in-nfl-183261" },
  { id: "carroll-canales-sea-2010", root: "Pete Carroll", staff: "Dave Canales", team: "Seattle Seahawks", years: "2010–2022", note: "Carroll HC、Canalesは攻撃スタッフ", sourceUrl: "https://www.panthers.com/team/coaches-roster/" },

  { id: "cowher-whisenhunt-pit-2001", root: "Bill Cowher", staff: "Ken Whisenhunt", team: "Pittsburgh Steelers", years: "2001–2006", note: "Cowher HC、WhisenhuntはTEコーチ／OC", sourceUrl: "https://www.tennesseetitans.com/news/titans-name-ken-whisenhunt-head-coach-12427515" },
  { id: "cowher-mularkey-pit-1996", root: "Bill Cowher", staff: "Mike Mularkey", team: "Pittsburgh Steelers", years: "1996–2003", note: "Cowher HC、MularkeyはTEコーチ／OC", sourceUrl: "https://www.tennesseetitans.com/news/mike-mularkey-hired-as-titans-tight-ends-coach-12493442" },
  { id: "cowher-lebeau-pit-1992", root: "Bill Cowher", staff: "Dick LeBeau", team: "Pittsburgh Steelers", years: "1992–1996 / 2004–2006", note: "Cowher HC、LeBeauはDBコーチ／DC", sourceUrl: "https://www.steelers.com/history/bios/lebeau_dick" },
  { id: "cowher-arians-pit-2004", root: "Bill Cowher", staff: "Bruce Arians", team: "Pittsburgh Steelers", years: "2004–2006", note: "Cowher HC、AriansはWRコーチ", sourceUrl: "https://archive.triblive.com/sports/ex-steelers-coach-bill-cowher-credit-goes-to-andy-reid-bruce-arians/" },
  { id: "cowher-tomlin-pit-2001", root: "Bill Cowher", staff: "Mike Tomlin", team: "Pittsburgh Steelers", years: "2001–2006", note: "Cowher HC、TomlinはDBコーチ", sourceUrl: "https://static.clubs.nfl.com/image/upload/steelers/upx5ojsyqxcvxkpcubcg.pdf" },
  { id: "cowher-capers-pit-1992", root: "Bill Cowher", staff: "Dom Capers", team: "Pittsburgh Steelers", years: "1992–1994", note: "Cowher HC、Capers DC", sourceUrl: "https://pro-football-history.com/coach/55/dom-capers-bio" },

  { id: "gruden-callahan-oak-1998", root: "Jon Gruden", staff: "Bill Callahan", team: "Oakland Raiders", years: "1998–2001", note: "Gruden HC、Callahan OC", sourceUrl: "https://www.atlantafalcons.com/team/coaches-roster/bill-callahan" },
  { id: "gruden-kiffin-tb-2002", root: "Jon Gruden", staff: "Monte Kiffin", team: "Tampa Bay Buccaneers", years: "2002–2008", note: "Gruden HC、Kiffin DC", sourceUrl: "https://www.buccaneers.com/news/branching-out-2173546" },
  { id: "gruden-marinelli-tb-2002", root: "Jon Gruden", staff: "Rod Marinelli", team: "Tampa Bay Buccaneers", years: "2002–2005", note: "Gruden HC、MarinelliはDLコーチ", sourceUrl: "https://www.raiders.com/news/las-vegas-raiders-announce-hiring-of-rod-marinelli-and-austin-king" },
  { id: "gruden-tomlin-tb-2002", root: "Jon Gruden", staff: "Mike Tomlin", team: "Tampa Bay Buccaneers", years: "2002–2005", note: "Gruden HC、TomlinはDBコーチ", sourceUrl: "https://www.steelers.com/news/labriola-on-tomlin-coach-of-the-year" },
  { id: "gruden-jay-tb-2002", root: "Jon Gruden", staff: "Jay Gruden", team: "Tampa Bay Buccaneers", years: "2002–2008", note: "Gruden HC、Jay Grudenは攻撃スタッフ", sourceUrl: "https://www.commanders.com/photos/coaching-history-of-jay-gruden-12397539" },
  { id: "gruden-morris-tb-2002", root: "Jon Gruden", staff: "Raheem Morris", team: "Tampa Bay Buccaneers", years: "2002", note: "Gruden HC、Morrisは守備QC", sourceUrl: "https://www.atlantafalcons.com/news/jon-gruden-i-pull-for-raheem-morris-every-week-except-this-week" },
  { id: "gruden-barry-tb-2002", root: "Jon Gruden", staff: "Joe Barry", team: "Tampa Bay Buccaneers", years: "2002", note: "Gruden HC、BarryはLBコーチ", sourceUrl: "https://www.raiders.com/news/las-vegas-raiders-announce-hiring-of-rod-marinelli-and-austin-king" },
];
