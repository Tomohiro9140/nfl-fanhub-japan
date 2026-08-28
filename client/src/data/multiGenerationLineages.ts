/**
 * Archive Atlas data reminder: a branch is included only when it has a sourced NFL
 * documented coaching connection to the lineage forest.
 */
import type { Coach, Role } from "./coaches";
import { auditedReintegrationRelations } from "./auditedReintegrationRelations";
import { directStaffEdges } from "./directStaffLineages";
import { historicalReintegrationRelations } from "./historicalReintegrationRelations";
import { researchedHcRelations } from "./hc2000IntakeRelations";
import { userAttachmentLineageRelations } from "./userAttachmentLineageRelations";
import { userVerifiedLineageRelations } from "./userVerifiedLineageRelations";

export type RelationKind = "direct";

export type MultiGenerationRelation = {
  id: string;
  parent: string;
  child: string;
  kind: RelationKind;
  team: string;
  years: string;
  role: string;
  sourceUrl: string;
};

export const lineageRoots = [
  { id: "walsh", root: "Bill Walsh", label: "WALSH", japanese: "ビル・ウォルシュ系" },
  { id: "carroll", root: "Pete Carroll", label: "CARROLL", japanese: "ピート・キャロル系" },
  { id: "parcells", root: "Bill Parcells", label: "PARCELLS", japanese: "ビル・パーセルズ系" },
  { id: "schottenheimer", root: "Marty Schottenheimer", label: "SCHOTTENHEIMER", japanese: "マーティ・ショッテンハイマー系" },
  { id: "reeves", root: "Dan Reeves", label: "REEVES", japanese: "ダン・リーブス系" },
  { id: "gibbs", root: "Joe Gibbs", label: "GIBBS", japanese: "ジョー・ギブス系" },
  { id: "holmgren", root: "Mike Holmgren", label: "HOLMGREN", japanese: "マイク・ホルムグレン系" },
  { id: "belichick", root: "Bill Belichick", label: "BELICHICK", japanese: "ビル・ベリチック系" },
  { id: "reid", root: "Andy Reid", label: "REID", japanese: "アンディ・リード系" },
  { id: "shanahan", root: "Mike Shanahan", label: "SHANAHAN", japanese: "マイク・シャナハン系" },
  { id: "dungy", root: "Tony Dungy", label: "DUNGY", japanese: "トニー・ダンジー系" },
  { id: "cowher", root: "Bill Cowher", label: "COWHER", japanese: "ビル・カウアー系" },
  { id: "gruden", root: "Jon Gruden", label: "GRUDEN", japanese: "ジョン・グルーデン系" },
  { id: "chuck-noll", root: "Chuck Noll", label: "CHUCK NOLL", japanese: "チャック・ノール系" },
  { id: "jimmy-johnson", root: "Jimmy Johnson", label: "JIMMY JOHNSON", japanese: "ジミー・ジョンソン系" },
  { id: "dick-vermeil", root: "Dick Vermeil", label: "VERMEIL", japanese: "ディック・バーミール系" },
  { id: "ted-marchibroda", root: "Ted Marchibroda", label: "MARCHIBRODA", japanese: "テッド・マーチブロダ系" },
  { id: "mike-ditka", root: "Mike Ditka", label: "MIKE DITKA", japanese: "マイク・ディトカ系" },
] as const;

type ExtraSeed = { name: string; japanese: string; roles: Role[]; firstYear: number; team: string; years: string; role: Role; sourceUrl: string };

const seed = (item: ExtraSeed): Coach => ({
  id: `tree-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
  name: item.name,
  japanese: item.japanese,
  roles: item.roles,
  specialty: item.roles.includes("DC") && !item.roles.includes("OC") ? "Defense" : item.roles.includes("OC") && !item.roles.includes("DC") ? "Offense" : "Balanced",
  firstYear: item.firstYear,
  era: `${Math.floor(item.firstYear / 10) * 10}s`,
  origin: item.team,
  summary: `${item.firstYear}年以降、NFLで${item.roles.join("・")}を経験。`,
  relationship: "確認済みのスタッフ・採用経路を通じて多世代ツリーへ収録。",
  sourceUrl: item.sourceUrl,
  appointments: [{ team: item.team, years: item.years, role: item.role, sourceUrl: item.sourceUrl }],
});

export const additionalConnectedCoaches: Coach[] = [
  seed({ name: "Bill Walsh", japanese: "ビル・ウォルシュ", roles: ["HC", "OC"], firstYear: 1980, team: "San Francisco 49ers", years: "1979–1988", role: "HC", sourceUrl: "https://www.profootballhof.com/players/bill-walsh" }),
  seed({ name: "George Seifert", japanese: "ジョージ・サイファート", roles: ["HC", "DC"], firstYear: 1989, team: "San Francisco 49ers", years: "1989–1996", role: "HC", sourceUrl: "https://www.49ers.com/news/a-look-into-the-history-and-diversity-of-bill-walsh-s-coaching-tree" }),
  seed({ name: "Dennis Green", japanese: "デニス・グリーン", roles: ["HC", "DC"], firstYear: 1992, team: "Minnesota Vikings", years: "1992–2001", role: "HC", sourceUrl: "https://www.espn.com/blog/nflnation/post/_/id/207545/tony-dungy-owes-a-lot-to-opportunities-dennis-green-provided" }),
  seed({ name: "Ray Rhodes", japanese: "レイ・ローズ", roles: ["HC", "DC"], firstYear: 1995, team: "Philadelphia Eagles", years: "1995–1998", role: "HC", sourceUrl: "https://www.49ers.com/news/a-look-into-the-history-and-diversity-of-bill-walsh-s-coaching-tree" }),
  seed({ name: "Sam Wyche", japanese: "サム・ワイチ", roles: ["HC", "OC"], firstYear: 1984, team: "Cincinnati Bengals", years: "1984–1991", role: "HC", sourceUrl: "https://www.nfl.com/news/hall-of-fame-coach-bill-walsh-who-won-three-super-bowls-with-th-09000d5d8012ecbb" }),
  seed({ name: "Tom Coughlin", japanese: "トム・コフリン", roles: ["HC", "OC"], firstYear: 1995, team: "Jacksonville Jaguars", years: "1995–2002", role: "HC", sourceUrl: "https://www.giants.com/news/super-coaching-staff" }),
  seed({ name: "Sean Payton", japanese: "ショーン・ペイトン", roles: ["HC", "OC"], firstYear: 2006, team: "New Orleans Saints", years: "2006–2021", role: "HC", sourceUrl: "https://www.denverbroncos.com/team/coaches-roster/sean-payton" }),
  seed({ name: "Todd Bowles", japanese: "トッド・ボウルズ", roles: ["HC", "DC"], firstYear: 2015, team: "New York Jets", years: "2015–2018", role: "HC", sourceUrl: "https://www.espn.com/blog/dallas-cowboys/post/_/id/4740035/bill-parcells-2005-cowboys-staff-has-seventh-head-coach" }),
  seed({ name: "Marty Schottenheimer", japanese: "マーティ・ショッテンハイマー", roles: ["HC"], firstYear: 1984, team: "Cleveland Browns", years: "1984–1988", role: "HC", sourceUrl: "https://www.chiefs.com/news/longforms/remembering-marty-schottenheimer" }),
  seed({ name: "Lindy Infante", japanese: "リンディ・インファンテ", roles: ["HC", "OC"], firstYear: 1986, team: "Green Bay Packers", years: "1988–1991", role: "HC", sourceUrl: "https://touchdownwire.usatoday.com/story/sports/nfl/touchdown/2021/02/09/12-nfl-coaches-marty-schottenheimer-coaching-tree-branches/80793129007/" }),
  seed({ name: "Marc Trestman", japanese: "マーク・トレストマン", roles: ["HC", "OC"], firstYear: 2013, team: "Chicago Bears", years: "2013–2014", role: "HC", sourceUrl: "https://touchdownwire.usatoday.com/story/sports/nfl/touchdown/2021/02/09/12-nfl-coaches-marty-schottenheimer-coaching-tree-branches/80793129007/" }),
  seed({ name: "Gunther Cunningham", japanese: "ガンサー・カニンガム", roles: ["HC", "DC"], firstYear: 1987, team: "Kansas City Chiefs", years: "1995–1998", role: "DC", sourceUrl: "https://touchdownwire.usatoday.com/story/sports/nfl/touchdown/2021/02/09/12-nfl-coaches-marty-schottenheimer-coaching-tree-branches/80793129007/" }),
  seed({ name: "Mike McCarthy", japanese: "マイク・マッカーシー", roles: ["HC", "OC"], firstYear: 2006, team: "Green Bay Packers", years: "2006–2018", role: "HC", sourceUrl: "https://touchdownwire.usatoday.com/story/sports/nfl/touchdown/2021/02/09/12-nfl-coaches-marty-schottenheimer-coaching-tree-branches/80793129007/" }),
  seed({ name: "Cam Cameron", japanese: "キャム・キャメロン", roles: ["HC", "OC"], firstYear: 2007, team: "Miami Dolphins", years: "2007", role: "HC", sourceUrl: "https://touchdownwire.usatoday.com/story/sports/nfl/touchdown/2021/02/09/12-nfl-coaches-marty-schottenheimer-coaching-tree-branches/80793129007/" }),
  seed({ name: "Tony Sparano", japanese: "トニー・スパラノ", roles: ["HC", "OC"], firstYear: 2008, team: "Miami Dolphins", years: "2008–2011", role: "HC", sourceUrl: "https://touchdownwire.usatoday.com/story/sports/nfl/touchdown/2021/02/09/12-nfl-coaches-marty-schottenheimer-coaching-tree-branches/80793129007/" }),
  seed({ name: "Hue Jackson", japanese: "ヒュー・ジャクソン", roles: ["HC", "OC"], firstYear: 2011, team: "Oakland Raiders", years: "2011", role: "HC", sourceUrl: "https://touchdownwire.usatoday.com/story/sports/nfl/touchdown/2021/02/09/12-nfl-coaches-marty-schottenheimer-coaching-tree-branches/80793129007/" }),
  seed({ name: "Rob Chudzinski", japanese: "ロブ・チュジンスキー", roles: ["HC", "OC"], firstYear: 2013, team: "Cleveland Browns", years: "2013", role: "HC", sourceUrl: "https://touchdownwire.usatoday.com/story/sports/nfl/touchdown/2021/02/09/12-nfl-coaches-marty-schottenheimer-coaching-tree-branches/80793129007/" }),
  seed({ name: "Dan Reeves", japanese: "ダン・リーブス", roles: ["HC", "OC"], firstYear: 1981, team: "Denver Broncos", years: "1981–1992", role: "HC", sourceUrl: "https://www.denverbroncos.com/team/tradition/ring-of-fame/dan-reeves" }),
  seed({ name: "Chan Gailey", japanese: "チャン・ゲイリー", roles: ["HC", "OC"], firstYear: 1998, team: "Dallas Cowboys", years: "1998–1999", role: "HC", sourceUrl: "https://pro-football-history.com/coach/328/dan-reeves-bio" }),
  seed({ name: "Mike Nolan", japanese: "マイク・ノーラン", roles: ["HC", "DC"], firstYear: 2005, team: "San Francisco 49ers", years: "2005–2008", role: "HC", sourceUrl: "https://pro-football-history.com/coach/328/dan-reeves-bio" }),
  seed({ name: "Wade Phillips", japanese: "ウェイド・フィリップス", roles: ["HC", "DC"], firstYear: 1985, team: "New Orleans Saints", years: "1985", role: "HC", sourceUrl: "https://pro-football-history.com/coach/328/dan-reeves-bio" }),
  seed({ name: "Dennis Allen", japanese: "デニス・アレン", roles: ["HC", "DC"], firstYear: 2012, team: "Oakland Raiders", years: "2012–2014", role: "HC", sourceUrl: "https://pro-football-history.com/coach/328/dan-reeves-bio" }),
  seed({ name: "Joe Gibbs", japanese: "ジョー・ギブス", roles: ["HC", "OC"], firstYear: 1981, team: "Washington Redskins", years: "1981–1992 / 2004–2007", role: "HC", sourceUrl: "https://pro-football-history.com/coach/144/joe-gibbs-bio" }),
  seed({ name: "Joe Bugel", japanese: "ジョー・ビューゲル", roles: ["HC", "OC"], firstYear: 1981, team: "Washington Redskins", years: "1981–1989", role: "OC", sourceUrl: "https://www.commanders.com/news/former-washington-redskins-coach-and-franchise-icon-joe-bugel-passes-away-at-age" }),
  seed({ name: "Dan Henning", japanese: "ダン・ヘニング", roles: ["HC", "OC"], firstYear: 1981, team: "Washington Redskins", years: "1981–1989", role: "OC", sourceUrl: "https://www.upi.com/Archives/1989/02/09/Dan-Henning-whose-team-finished-no-better-than-third/7276603003600/" }),
  seed({ name: "Richie Petitbon", japanese: "リッチー・プチボン", roles: ["HC", "DC"], firstYear: 1993, team: "Washington Redskins", years: "1981–1992", role: "DC", sourceUrl: "https://pro-football-history.com/coach/144/joe-gibbs-bio" }),
  seed({ name: "Don Breaux", japanese: "ドン・ブロー", roles: ["OC"], firstYear: 1981, team: "Washington Redskins", years: "1981–1992", role: "OC", sourceUrl: "https://www.pro-football-reference.com/teams/was/coaches.htm" }),
  seed({ name: "Gregg Williams", japanese: "グレッグ・ウィリアムズ", roles: ["HC", "DC"], firstYear: 2000, team: "Buffalo Bills", years: "2004–2007", role: "DC", sourceUrl: "https://www.latimes.com/archives/la-xpm-2004-jan-08-gibbs8-story.html" }),
  seed({ name: "Al Saunders", japanese: "アル・サンダース", roles: ["OC"], firstYear: 1986, team: "Washington Redskins", years: "2006–2007", role: "OC", sourceUrl: "https://www.pro-football-reference.com/teams/was/coaches.htm" }),
  seed({ name: "Chuck Noll", japanese: "チャック・ノール", roles: ["HC"], firstYear: 1980, team: "Pittsburgh Steelers", years: "1969–1991", role: "HC", sourceUrl: "https://www.profootballhof.com/news/class-of-2016-finalists" }),
  seed({ name: "Matt Nagy", japanese: "マット・ナジー", roles: ["HC", "OC"], firstYear: 2018, team: "Chicago Bears", years: "2018–2021", role: "HC", sourceUrl: "https://www.usatoday.com/story/sports/nfl/super-bowl/2025/02/09/andy-reid-coaching-tree/78058915007/" }),
  seed({ name: "Leslie Frazier", japanese: "レスリー・フレイジャー", roles: ["HC", "DC"], firstYear: 2011, team: "Minnesota Vikings", years: "2011–2013", role: "HC", sourceUrl: "https://www.buffalobills.com/team/coaches-roster/" }),
  seed({ name: "Frank Reich", japanese: "フランク・ライク", roles: ["HC", "OC"], firstYear: 2018, team: "Indianapolis Colts", years: "2018–2022", role: "HC", sourceUrl: "https://www.philadelphiaeagles.com/team/coaches-roster" }),
  seed({ name: "Mike Macdonald", japanese: "マイク・マクドナルド", roles: ["HC", "DC"], firstYear: 2024, team: "Seattle Seahawks", years: "2024–", role: "HC", sourceUrl: "https://www.baltimoreravens.com/team/coaches-roster" }),
  seed({ name: "Mike Vrabel", japanese: "マイク・ブレイベル", roles: ["HC", "DC"], firstYear: 2018, team: "Tennessee Titans", years: "2018–2023", role: "HC", sourceUrl: "https://www.tennesseetitans.com/team/coaches-roster/mike-vrabel" }),
  seed({ name: "DeMeco Ryans", japanese: "デミコ・ライアンズ", roles: ["HC", "DC"], firstYear: 2023, team: "Houston Texans", years: "2023–", role: "HC", sourceUrl: "https://www.49ers.com/news/49ers-mike-mcdaniel-offensive-coordinator-demeco-ryans-defensive-coordinator" }),
  seed({ name: "Kris Richard", japanese: "クリス・リチャード", roles: ["DC"], firstYear: 2018, team: "Dallas Cowboys", years: "2018–2019", role: "DC", sourceUrl: "https://www.seahawks.com/news/kris-richard-adapts-to-new-role-as-seahawks-defensive-coordinator-we-re-124261" }),
  seed({ name: "Ken Norton Jr.", japanese: "ケン・ノートン・ジュニア", roles: ["DC"], firstYear: 2015, team: "Oakland Raiders", years: "2015–2017", role: "DC", sourceUrl: "https://www.seahawks.com/news/add-sean-desai-karl-scott-sanjay-lal-to-staff" }),
  seed({ name: "Brian Schottenheimer", japanese: "ブライアン・ショッテンハイマー", roles: ["OC"], firstYear: 2006, team: "New York Jets", years: "2006–2011", role: "OC", sourceUrl: "https://www.raiders.com/news/pete-carroll-coaching-tree-dan-quinn-dave-canales-brian-schottenheimer" }),
  seed({ name: "Gary Moeller", japanese: "ゲイリー・モーラー", roles: ["HC"], firstYear: 2000, team: "Detroit Lions", years: "2000", role: "HC", sourceUrl: "https://www.nfl.com/news/gary-moeller-former-michigan-and-lions-coach-dies-at-81" }),
  seed({ name: "Jim Bates", japanese: "ジム・ベイツ", roles: ["HC", "DC"], firstYear: 2004, team: "Miami Dolphins", years: "2004", role: "HC", sourceUrl: "https://www.pro-football-reference.com/coaches/BateJi0.htm" }),
  seed({ name: "Emmitt Thomas", japanese: "エミット・トーマス", roles: ["HC", "DC"], firstYear: 2000, team: "Atlanta Falcons", years: "2000", role: "HC", sourceUrl: "https://www.pro-football-reference.com/coaches/ThomEm0.htm" }),
  seed({ name: "Mike Kafka", japanese: "マイク・カフカ", roles: ["HC", "OC"], firstYear: 2025, team: "New York Giants", years: "2025–", role: "HC", sourceUrl: "https://www.pro-football-reference.com/coaches/KafkMi0.htm" }),
  seed({ name: "Jeff Hafley", japanese: "ジェフ・ハフリー", roles: ["HC", "DC"], firstYear: 2026, team: "Miami Dolphins", years: "2026–", role: "HC", sourceUrl: "https://www.miamidolphins.com/team/coaches-roster/" }),
  seed({ name: "Jesse Minter", japanese: "ジェシー・ミンター", roles: ["HC", "DC"], firstYear: 2026, team: "Baltimore Ravens", years: "2026–", role: "HC", sourceUrl: "https://www.baltimoreravens.com/team/coaches-roster/" }),
  seed({ name: "Joe Brady", japanese: "ジョー・ブレイディ", roles: ["HC", "OC"], firstYear: 2026, team: "Buffalo Bills", years: "2026–", role: "HC", sourceUrl: "https://www.buffalobills.com/team/coaches-roster/joe-brady" }),
  seed({ name: "Klint Kubiak", japanese: "クリント・クビアク", roles: ["HC", "OC"], firstYear: 2026, team: "Las Vegas Raiders", years: "2026–", role: "HC", sourceUrl: "https://www.raiders.com/team/coaches-roster/" }),
  seed({ name: "Mike LaFleur", japanese: "マイク・ラフルアー", roles: ["HC", "OC"], firstYear: 2026, team: "Arizona Cardinals", years: "2026–", role: "HC", sourceUrl: "https://www.azcardinals.com/team/coaches-roster/" }),
  seed({ name: "Todd Monken", japanese: "トッド・モンケン", roles: ["HC", "OC"], firstYear: 2026, team: "Cleveland Browns", years: "2026–", role: "HC", sourceUrl: "https://www.clevelandbrowns.com/team/coaches-roster/" }),
  seed({ name: "Jimmy Johnson", japanese: "ジミー・ジョンソン", roles: ["HC"], firstYear: 1989, team: "Dallas Cowboys", years: "1989–1993", role: "HC", sourceUrl: "https://www.profootballhof.com/players/jimmy-johnson-coach" }),
  seed({ name: "Dick Vermeil", japanese: "ディック・バーミール", roles: ["HC"], firstYear: 1976, team: "Philadelphia Eagles", years: "1976–1982 / 1997–1999 / 2001–2005", role: "HC", sourceUrl: "https://www.profootballhof.com/players/dick-vermeil" }),
  seed({ name: "Jim Fassel", japanese: "ジム・ファッセル", roles: ["HC"], firstYear: 1997, team: "New York Giants", years: "1997–2003", role: "HC", sourceUrl: "https://www.giants.com/news/exploring-the-legacy-of-former-coach-jim-fassel-14929627" }),
  seed({ name: "Brian Billick", japanese: "ブライアン・ビリック", roles: ["HC"], firstYear: 1999, team: "Baltimore Ravens", years: "1999–2007", role: "HC", sourceUrl: "https://www.pro-football-reference.com/coaches/BillBr0.htm" }),
  seed({ name: "Jeff Fisher", japanese: "ジェフ・フィッシャー", roles: ["HC"], firstYear: 1994, team: "Houston Oilers / Tennessee Titans", years: "1994–2010 / 2012–2016", role: "HC", sourceUrl: "https://www.pro-football-reference.com/coaches/FishJe0.htm" }),
  seed({ name: "Dave Wannstedt", japanese: "デーブ・ワンステッド", roles: ["HC", "DC"], firstYear: 1993, team: "Chicago Bears", years: "1993–1998 / 2000–2004", role: "HC", sourceUrl: "https://www.pro-football-reference.com/coaches/WannDa0.htm" }),
];

const relation = (id: string, parent: string, child: string, kind: RelationKind, team: string, years: string, role: string, sourceUrl: string): MultiGenerationRelation => ({ id, parent, child, kind, team, years, role, sourceUrl });

const suppressedRelationIds = new Set([
  "reintegrate-kyle-lynn",
  "reintegrate-kyle-hafley",
  "reintegrate-saleh-mlafleur",
  "historic-marchibroda-lewis",
  "intake-dick-vermeil-mike-martz",
  "reintegrate-lovie-martz",
  "intake-joe-gibbs-steve-spurrier",
]);

export const multiGenerationRelations: MultiGenerationRelation[] = [
  ...directStaffEdges.map((edge) => relation(edge.id, edge.root, edge.staff, "direct", edge.team, edge.years, edge.note, edge.sourceUrl)),
  relation("walsh-seifert", "Bill Walsh", "George Seifert", "direct", "San Francisco 49ers", "1983–1988", "DC", "https://www.nfl.com/news/hall-of-fame-coach-bill-walsh-who-won-three-super-bowls-with-th-09000d5d8012ecbb"),
  relation("walsh-holmgren", "Bill Walsh", "Mike Holmgren", "direct", "San Francisco 49ers", "1986–1988", "QB coach", "https://www.nfl.com/news/bill-walsh-s-bio-09000d5d80086d95"),
  relation("walsh-green", "Bill Walsh", "Dennis Green", "direct", "San Francisco 49ers", "1986–1988", "WR coach", "https://www.49ers.com/news/a-look-into-the-history-and-diversity-of-bill-walsh-s-coaching-tree"),
  relation("walsh-rhodes", "Bill Walsh", "Ray Rhodes", "direct", "San Francisco 49ers", "1981–1988", "DB coach / DC", "https://www.49ers.com/news/a-look-into-the-history-and-diversity-of-bill-walsh-s-coaching-tree"),
  relation("walsh-wyche", "Bill Walsh", "Sam Wyche", "direct", "San Francisco 49ers", "1979–1982", "QB coach", "https://www.nfl.com/news/bill-walsh-s-bio-09000d5d80086d95"),
  relation("parcells-belichick", "Bill Parcells", "Bill Belichick", "direct", "New York Giants", "1985–1990", "DC / secondary coach", "https://www.nfl.com/news/parcells-1990-coaching-staff-was-ultimate-super-group-09000d5d80631278"),
  relation("parcells-coughlin", "Bill Parcells", "Tom Coughlin", "direct", "New York Giants", "1988–1990", "WR coach", "https://www.giants.com/news/super-coaching-staff"),
  relation("parcells-payton", "Bill Parcells", "Sean Payton", "direct", "Dallas Cowboys", "2003–2005", "QB coach / OC", "https://www.denverbroncos.com/team/coaches-roster/sean-payton"),
  relation("parcells-bowles", "Bill Parcells", "Todd Bowles", "direct", "Dallas Cowboys", "2005", "Secondary coach", "https://www.espn.com/blog/dallas-cowboys/post/_/id/4740035/bill-parcells-2005-cowboys-staff-has-seventh-head-coach"),
  relation("marty-cowher", "Marty Schottenheimer", "Bill Cowher", "direct", "Kansas City Chiefs", "1989–1991", "DC", "https://www.profootballhof.com/players/bill-cowher"),
  relation("marty-dungy", "Marty Schottenheimer", "Tony Dungy", "direct", "Kansas City Chiefs", "1989–1991", "DB coach", "https://www.chiefs.com/news/longforms/remembering-marty-schottenheimer"),
  relation("marty-arians", "Marty Schottenheimer", "Bruce Arians", "direct", "Kansas City Chiefs", "1989–1992", "RB coach", "https://touchdownwire.usatoday.com/story/sports/nfl/touchdown/2021/02/09/12-nfl-coaches-marty-schottenheimer-coaching-tree-branches/80793129007/"),
  relation("marty-mccarthy", "Marty Schottenheimer", "Mike McCarthy", "direct", "Kansas City Chiefs", "1993–1998", "Offensive QC / QB coach", "https://touchdownwire.usatoday.com/story/sports/nfl/touchdown/2021/02/09/12-nfl-coaches-marty-schottenheimer-coaching-tree-branches/80793129007/"),
  relation("marty-cameron", "Marty Schottenheimer", "Cam Cameron", "direct", "San Diego Chargers", "2002–2006", "OC", "https://touchdownwire.usatoday.com/story/sports/nfl/touchdown/2021/02/09/12-nfl-coaches-marty-schottenheimer-coaching-tree-branches/80793129007/"),
  relation("marty-sparano", "Marty Schottenheimer", "Tony Sparano", "direct", "Washington", "2001", "TE coach", "https://touchdownwire.usatoday.com/story/sports/nfl/touchdown/2021/02/09/12-nfl-coaches-marty-schottenheimer-coaching-tree-branches/80793129007/"),
  relation("marty-hue", "Marty Schottenheimer", "Hue Jackson", "direct", "Washington", "2001", "TE coach", "https://touchdownwire.usatoday.com/story/sports/nfl/touchdown/2021/02/09/12-nfl-coaches-marty-schottenheimer-coaching-tree-branches/80793129007/"),
  relation("marty-chud", "Marty Schottenheimer", "Rob Chudzinski", "direct", "San Diego Chargers", "2005–2006", "TE coach", "https://touchdownwire.usatoday.com/story/sports/nfl/touchdown/2021/02/09/12-nfl-coaches-marty-schottenheimer-coaching-tree-branches/80793129007/"),
  relation("reeves-shanahan", "Dan Reeves", "Mike Shanahan", "direct", "Denver Broncos", "1984–1987", "WR coach (1984) / OC (1985–1987)", "https://www.denverbroncos.com/news/how-mike-shanahan-drew-on-broncos-history-to-leave-his-own-lasting-impact"),
  relation("reeves-gailey", "Dan Reeves", "Chan Gailey", "direct", "Denver Broncos", "1985–1986", "WR coach", "https://pro-football-history.com/coach/328/dan-reeves-bio"),
  relation("reeves-nolan", "Dan Reeves", "Mike Nolan", "direct", "Denver Broncos", "1987–1992", "LB coach", "https://pro-football-history.com/coach/328/dan-reeves-bio"),
  relation("reeves-phillips", "Dan Reeves", "Wade Phillips", "direct", "Denver Broncos", "1989–1992", "DC", "https://www.denverbroncos.com/news/sundays-with-sacco-the-phillips-coaching-family-15464503"),
  relation("reeves-allen", "Dan Reeves", "Dennis Allen", "direct", "Atlanta Falcons", "2002–2003", "Defensive QC / defensive assistant", "https://www.nbcsportsbayarea.com/nfl/reeves-calls-allen-impressive-young-guy/1329979/"),
  relation("gibbs-bugel", "Joe Gibbs", "Joe Bugel", "direct", "Washington Redskins", "1981–1989", "OC / OL coach", "https://www.commanders.com/news/former-washington-redskins-coach-and-franchise-icon-joe-bugel-passes-away-at-age"),
  relation("gibbs-henning", "Joe Gibbs", "Dan Henning", "direct", "Washington Redskins", "1981–1982 / 1987–1988", "Assistant HC / OC / QB coach", "https://www.latimes.com/archives/la-xpm-1987-01-28-sp-1286-story.html"),
  relation("gibbs-petitbon", "Joe Gibbs", "Richie Petitbon", "direct", "Washington Redskins", "1981–1992", "DC", "https://pro-football-history.com/coach/144/joe-gibbs-bio"),
  relation("gibbs-breaux", "Joe Gibbs", "Don Breaux", "direct", "Washington Redskins", "1981–1992", "OC", "https://www.pro-football-reference.com/teams/was/coaches.htm"),
  relation("gibbs-williams", "Joe Gibbs", "Gregg Williams", "direct", "Washington Redskins", "2004–2007", "DC", "https://www.latimes.com/archives/la-xpm-2004-jan-08-gibbs8-story.html"),
  relation("gibbs-saunders", "Joe Gibbs", "Al Saunders", "direct", "Washington", "2006–2007", "OC", "https://www.pro-football-reference.com/teams/was/coaches.htm"),
  relation("noll-dungy", "Chuck Noll", "Tony Dungy", "direct", "Pittsburgh Steelers", "1981–1988", "DB coach / DC", "https://www.profootballhof.com/news/class-of-2016-finalists"),
  relation("holmgren-nagy", "Andy Reid", "Matt Nagy", "direct", "Philadelphia Eagles / Kansas City Chiefs", "2008–2017", "Offensive staff / OC", "https://www.usatoday.com/story/sports/nfl/super-bowl/2025/02/09/andy-reid-coaching-tree/78058915007/"),
  relation("reid-frazier", "Andy Reid", "Leslie Frazier", "direct", "Philadelphia Eagles", "1999–2002", "DB coach", "https://www.usatoday.com/story/sports/nfl/super-bowl/2025/02/09/andy-reid-coaching-tree/78058915007/"),
  relation("reid-bowles", "Andy Reid", "Todd Bowles", "direct", "Philadelphia Eagles", "2012", "DC", "https://www.usatoday.com/story/sports/nfl/super-bowl/2025/02/09/andy-reid-coaching-tree/78058915007/"),
  relation("pederson-reich", "Doug Pederson", "Frank Reich", "direct", "Philadelphia Eagles", "2016–2017", "OC", "https://www.philadelphiaeagles.com/team/coaches-roster"),
  relation("obrien-vrabel", "Bill O’Brien", "Mike Vrabel", "direct", "Houston Texans", "2014–2017", "LB coach / DC", "https://www.tennesseetitans.com/team/coaches-roster/mike-vrabel"),
  relation("mangini-daboll", "Eric Mangini", "Brian Daboll", "direct", "Cleveland Browns", "2009–2010", "OC", "https://www.giants.com/news/brian-daboll-biography"),
  relation("harbaugh-macdonald", "John Harbaugh", "Mike Macdonald", "direct", "Baltimore Ravens", "2014–2023", "Defensive assistant / DC", "https://www.baltimoreravens.com/team/coaches-roster"),
  relation("mcdermott-frazier", "Sean McDermott", "Leslie Frazier", "direct", "Buffalo Bills", "2017–2022", "DC", "https://www.buffalobills.com/team/coaches-roster/"),
  relation("kyle-saleh", "Kyle Shanahan", "Robert Saleh", "direct", "San Francisco 49ers", "2017–2020", "DC", "https://www.49ers.com/news/49ers-demeco-ryans-defensive-coordinator-robert-saleh-fred-warner"),
  relation("kyle-mcdaniel", "Kyle Shanahan", "Mike McDaniel", "direct", "San Francisco 49ers", "2017–2021", "Run-game coordinator / OC", "https://www.49ers.com/news/mike-mcdaniel-offensive-coordinator-kyle-shanahan-juszczyk-running-backs"),
  relation("kyle-ryans", "Kyle Shanahan", "DeMeco Ryans", "direct", "San Francisco 49ers", "2017–2022", "Defensive staff / DC", "https://www.49ers.com/news/49ers-mike-mcdaniel-offensive-coordinator-demeco-ryans-defensive-coordinator"),
  relation("mcvay-lafleur", "Sean McVay", "Matt LaFleur", "direct", "Los Angeles Rams", "2017–2018", "OC", "https://www.therams.com/news/three-things-to-know-about-rams-oc-matt-lafleur-18548155"),
  relation("dungy-frazier", "Tony Dungy", "Leslie Frazier", "direct", "Tampa Bay Buccaneers", "1999–2001", "DB coach", "https://www.espn.com/blog/tampa-bay-buccaneers/post/_/id/21271/tony-dungys-legacy-championing-diverse-coaches-including-mike-tomlin"),
  relation("carroll-richard", "Pete Carroll", "Kris Richard", "direct", "Seattle Seahawks", "2010–2017", "DB coach / DC", "https://www.seahawks.com/news/kris-richard-adapts-to-new-role-as-seahawks-defensive-coordinator-we-re-124261"),
  relation("carroll-norton", "Pete Carroll", "Ken Norton Jr.", "direct", "Seattle Seahawks", "2010–2014 / 2018–2021", "LB coach / DC", "https://www.seahawks.com/news/add-sean-desai-karl-scott-sanjay-lal-to-staff"),
  relation("carroll-schottenheimer", "Pete Carroll", "Brian Schottenheimer", "direct", "Seattle Seahawks", "2018–2020", "OC", "https://www.raiders.com/news/pete-carroll-coaching-tree-dan-quinn-dave-canales-brian-schottenheimer"),
  relation("quinn-kyle", "Dan Quinn", "Kyle Shanahan", "direct", "Atlanta Falcons", "2015–2016", "OC", "https://www.atlantafalcons.com/news/falcons-announce-several-assistant-coaches-14878214"),
  relation("cowher-tomlin", "Bill Cowher", "Mike Tomlin", "direct", "Pittsburgh Steelers", "2001–2006", "DB coach", "https://www.steelers.com/news/tomlin-steelers-a-perfect-match-15513466"),
  relation("tomlin-arians", "Mike Tomlin", "Bruce Arians", "direct", "Pittsburgh Steelers", "2007–2011", "OC", "https://www.pro-football-reference.com/coaches/AriaBr0.htm"),
  relation("gruden-kyle", "Jon Gruden", "Kyle Shanahan", "direct", "Tampa Bay Buccaneers", "2004–2005", "Offensive QC", "https://www.49ers.com/news/5-things-to-know-about-49ers-hc-kyle-shanahan-18540915"),
  relation("gruden-tomlin", "Jon Gruden", "Mike Tomlin", "direct", "Tampa Bay Buccaneers", "2002–2005", "DB coach", "https://www.buccaneers.com/news/2022-game-preview-buccaneers-steelers-week-6"),
  relation("gruden-morris", "Jon Gruden", "Raheem Morris", "direct", "Tampa Bay Buccaneers", "2002–2008", "Defensive staff", "https://www.buccaneers.com/news/youth-is-served-morris-named-new-d-coordinator-2187301"),
  ...auditedReintegrationRelations,
  ...historicalReintegrationRelations,
  ...researchedHcRelations,
  ...userVerifiedLineageRelations,
  ...userAttachmentLineageRelations,
].filter((relation) => !suppressedRelationIds.has(relation.id));
