export type Role = "HC" | "OC" | "DC";
export type StaffRole = Role | "STC";
export type CareerRole = StaffRole | "OTHER";

export type Appointment = {
  years: string;
  team: string;
  role: CareerRole;
  /** Position-coach等を含む、出典で確認した当時の原表記。 */
  title?: string;
  sourceUrl?: string;
};

export type Coach = {
  id: string;
  name: string;
  japanese: string;
  roles: Role[];
  specialty: "Offense" | "Defense" | "Balanced";
  firstYear: number;
  era: string;
  origin: string;
  summary: string;
  relationship: string;
  sourceUrl: string;
  appointments: Appointment[];
};

export type LineageEdge = {
  from: string;
  to: string;
  years: string;
  team: string;
  note: string;
};

/** 1990年以降のHC・OC・DC経験を基準にした初期収録。 */
export const coaches: Coach[] = [
  {
    id: "parcells", name: "Bill Parcells", japanese: "ビル・パーセルズ", roles: ["HC", "DC"], specialty: "Defense", firstYear: 1990, era: "1990s", origin: "New York Giants",
    summary: "1990年のGiantsから、Patriots、Jets、CowboysまでHCを経験。1990年代以降のアトラスにおける出発点の一人。", relationship: "1990 Giants／1993–96 PatriotsでBelichickとスタッフを共有", sourceUrl: "https://www.pro-football-reference.com/coaches/ParcBi0.htm",
    appointments: [{ years: "1990", team: "New York Giants", role: "HC" }, { years: "1993–1996", team: "New England Patriots", role: "HC" }, { years: "1997–1999", team: "New York Jets", role: "HC" }, { years: "2003–2006", team: "Dallas Cowboys", role: "HC" }],
  },
  {
    id: "belichick", name: "Bill Belichick", japanese: "ビル・ベリチック", roles: ["HC", "DC"], specialty: "Defense", firstYear: 1991, era: "1990s", origin: "Cleveland Browns",
    summary: "ClevelandでHCを経験後、New Englandで長期にHCを務めた。1990年代以降のスタッフ関係を辿る初期版の中心ノード。", relationship: "ParcellsのGiants／Patriotsスタッフから派生", sourceUrl: "https://www.pro-football-reference.com/coaches/BeliBi0.htm",
    appointments: [{ years: "1991–1995", team: "Cleveland Browns", role: "HC" }, { years: "1996", team: "New England Patriots", role: "DC" }, { years: "2000–2023", team: "New England Patriots", role: "HC" }],
  },
  {
    id: "crennel", name: "Romeo Crennel", japanese: "ロメオ・クレネル", roles: ["HC", "DC"], specialty: "Defense", firstYear: 2001, era: "2000s", origin: "New England Patriots",
    summary: "PatriotsのDCからBrownsとChiefsのHCへ進んだ。ParcellsとBelichickの双方のスタッフ期をつなぐ守備系の節点。", relationship: "1990 Giants／2001–04 Patriotsのスタッフ接続", sourceUrl: "https://www.pro-football-reference.com/coaches/",
    appointments: [{ years: "2001–2004", team: "New England Patriots", role: "DC" }, { years: "2005–2008", team: "Cleveland Browns", role: "HC" }, { years: "2012", team: "Kansas City Chiefs", role: "HC" }],
  },
  {
    id: "mangini", name: "Eric Mangini", japanese: "エリック・マンジーニ", roles: ["HC", "DC"], specialty: "Defense", firstYear: 2005, era: "2000s", origin: "New England Patriots",
    summary: "PatriotsのDCを経て、JetsとBrownsでHCを務めた。", relationship: "2000年代のBelichickスタッフにおける守備系分枝", sourceUrl: "https://www.pro-football-reference.com/coaches/",
    appointments: [{ years: "2005", team: "New England Patriots", role: "DC" }, { years: "2006–2008", team: "New York Jets", role: "HC" }, { years: "2009–2010", team: "Cleveland Browns", role: "HC" }],
  },
  {
    id: "mcdaniels", name: "Josh McDaniels", japanese: "ジョシュ・マクダニエルズ", roles: ["HC", "OC"], specialty: "Offense", firstYear: 2006, era: "2000s", origin: "New England Patriots",
    summary: "PatriotsのOCを複数期経験し、DenverとLas VegasでHCを務めた攻撃系の主要分枝。", relationship: "BelichickスタッフのOC", sourceUrl: "https://www.pro-football-reference.com/coaches/",
    appointments: [{ years: "2006–2008", team: "New England Patriots", role: "OC" }, { years: "2009–2010", team: "Denver Broncos", role: "HC" }, { years: "2012–2021", team: "New England Patriots", role: "OC" }, { years: "2022–2023", team: "Las Vegas Raiders", role: "HC" }],
  },
  {
    id: "daboll", name: "Brian Daboll", japanese: "ブライアン・ダボール", roles: ["HC", "OC"], specialty: "Offense", firstYear: 2009, era: "2000s", origin: "Cleveland Browns",
    summary: "Patriotsの攻撃スタッフを経験し、BillsのOCからGiantsのHCへ進んだ。", relationship: "Belichickスタッフの攻撃系", sourceUrl: "https://www.pro-football-reference.com/coaches/",
    appointments: [{ years: "2009–2010", team: "Cleveland Browns", role: "OC" }, { years: "2017–2021", team: "Buffalo Bills", role: "OC" }, { years: "2022–2025", team: "New York Giants", role: "HC" }],
  },
  {
    id: "obrien", name: "Bill O’Brien", japanese: "ビル・オブライエン", roles: ["HC", "OC"], specialty: "Offense", firstYear: 2011, era: "2010s", origin: "New England Patriots",
    summary: "PatriotsのOCを経てTexansでHCを務め、後にPatriotsのOCにも復帰した。", relationship: "BelichickスタッフのOC", sourceUrl: "https://www.pro-football-reference.com/coaches/",
    appointments: [{ years: "2011", team: "New England Patriots", role: "OC" }, { years: "2014–2020", team: "Houston Texans", role: "HC" }, { years: "2023", team: "New England Patriots", role: "OC" }],
  },
  {
    id: "patricia", name: "Matt Patricia", japanese: "マット・パトリシア", roles: ["HC", "DC"], specialty: "Defense", firstYear: 2012, era: "2010s", origin: "New England Patriots",
    summary: "PatriotsのDCからLionsのHCへ進んだ、2010年代の守備系分枝。", relationship: "BelichickスタッフのDC", sourceUrl: "https://www.pro-football-reference.com/coaches/",
    appointments: [{ years: "2012–2017", team: "New England Patriots", role: "DC" }, { years: "2018–2020", team: "Detroit Lions", role: "HC" }],
  },
  {
    id: "flores", name: "Brian Flores", japanese: "ブライアン・フローレス", roles: ["HC", "DC"], specialty: "Defense", firstYear: 2019, era: "2010s", origin: "New England Patriots",
    summary: "Patriotsの守備を率いた後、DolphinsのHC、VikingsのDCを経験した。", relationship: "BelichickスタッフのDC", sourceUrl: "https://www.pro-football-reference.com/coaches/",
    appointments: [{ years: "2019", team: "New England Patriots", role: "DC" }, { years: "2019–2021", team: "Miami Dolphins", role: "HC" }, { years: "2023–", team: "Minnesota Vikings", role: "DC" }],
  },
  {
    id: "judge", name: "Joe Judge", japanese: "ジョー・ジャッジ", roles: ["HC"], specialty: "Balanced", firstYear: 2020, era: "2020s", origin: "New England Patriots",
    summary: "Patriotsのスタッフを経てGiantsのHCを経験。", relationship: "BelichickスタッフからHCへ", sourceUrl: "https://www.pro-football-reference.com/coaches/",
    appointments: [{ years: "2015–2018", team: "New England Patriots", role: "STC", sourceUrl: "https://www.giants.com/news/joe-judge-head-coach-5-things-to-know-patriots-special-teams-coordinator" }, { years: "2019", team: "New England Patriots", role: "STC", sourceUrl: "https://www.patriots.com/news/patriots-hire-joe-judge-as-offensive-assistant" }, { years: "2020–2021", team: "New York Giants", role: "HC" }],
  },
  {
    id: "mayo", name: "Jerod Mayo", japanese: "ジェロッド・メイヨ", roles: ["HC"], specialty: "Defense", firstYear: 2024, era: "2020s", origin: "New England Patriots",
    summary: "Patriotsの守備スタッフからHCを経験。現代の接続点として収録する。", relationship: "BelichickスタッフからHCへ", sourceUrl: "https://www.pro-football-reference.com/coaches/",
    appointments: [{ years: "2024", team: "New England Patriots", role: "HC" }],
  },
];

/** 最短パスの計算に使用する、同一NFLスタッフ期を根拠とした無向グラフの辺。 */
export const lineageEdges: LineageEdge[] = [
  { from: "parcells", to: "belichick", years: "1990 / 1993–1996", team: "New York Giants / New England Patriots", note: "ParcellsのHCスタッフでBelichickが守備を担当" },
  { from: "parcells", to: "crennel", years: "1990", team: "New York Giants", note: "Parcellsのスタッフ期にCrennelが守備スタッフ" },
  { from: "belichick", to: "crennel", years: "2001–2004", team: "New England Patriots", note: "Belichick HC、Crennel DC" },
  { from: "belichick", to: "mangini", years: "2005", team: "New England Patriots", note: "Belichick HC、Mangini DC" },
  { from: "belichick", to: "mcdaniels", years: "2006–2008 / 2012–2021", team: "New England Patriots", note: "Belichick HC、McDaniels OC" },
  { from: "belichick", to: "daboll", years: "2000–2006 / 2013–2016", team: "New England Patriots", note: "同一攻撃スタッフ期" },
  { from: "belichick", to: "obrien", years: "2011 / 2023", team: "New England Patriots", note: "Belichick HC、O’Brien OC" },
  { from: "belichick", to: "patricia", years: "2012–2017", team: "New England Patriots", note: "Belichick HC、Patricia DC" },
  { from: "belichick", to: "flores", years: "2019", team: "New England Patriots", note: "Belichick HC、Flores DC" },
  { from: "belichick", to: "judge", years: "2012–2019", team: "New England Patriots", note: "同一スタッフ期" },
  { from: "belichick", to: "mayo", years: "2019–2023", team: "New England Patriots", note: "同一守備スタッフ期" },
];

export const staffRooms = [
  { years: "1990", team: "New York Giants", headCoach: "Bill Parcells", note: "ParcellsがHC、BelichickがDCを務めた1990年のGiants。1990年代以降の初期アトラスの起点。", members: ["Bill Parcells", "Bill Belichick", "Romeo Crennel"] },
  { years: "1993–1996", team: "New England Patriots", headCoach: "Bill Parcells", note: "ParcellsがHC、BelichickがDCを務めたスタッフ期。1990年代における二人の再接続点。", members: ["Bill Parcells", "Bill Belichick"] },
  { years: "2000–2023", team: "New England Patriots", headCoach: "Bill Belichick", note: "HC・OC・DC経験者が多く枝分かれしたスタッフ群。最短系譜パスもこの接続を中心に探索する。", members: ["Bill Belichick", "Josh McDaniels", "Matt Patricia", "Brian Flores", "Bill O’Brien"] },
];

export const sources = [
  { label: "Pro Football Reference — Coaches", url: "https://www.pro-football-reference.com/coaches/", detail: "HCのシーズン記録・個別コーチページへの参照入口" },
  { label: "Pro Football Reference — Bill Belichick", url: "https://www.pro-football-reference.com/coaches/BeliBi0.htm", detail: "BelichickのHCシーズン記録とキャリア参照" },
  { label: "Pro Football Reference — Bill Parcells", url: "https://www.pro-football-reference.com/coaches/ParcBi0.htm", detail: "ParcellsのHCシーズン記録とキャリア参照" },
];
