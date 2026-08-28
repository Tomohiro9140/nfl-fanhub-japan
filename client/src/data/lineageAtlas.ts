import type { Role } from "./coaches";
import { completeStaffAlmanac } from "./completeStaffAlmanac";
import { allHcAlmanacCoaches, allHcStaffAlmanacRecords } from "./allHcStaffAlmanac";

export type LineageTree = {
  id: string;
  label: string;
  headCoachName: string;
  japanese: string;
  rootId: string;
  nodeIds: string[];
  years: string;
  teams: string[];
  note: string;
};

export type SeasonStaffMember = {
  id?: string;
  name: string;
  japanese: string;
  role: Role;
  contemporaneousRole: string;
  note: string;
};

export type SeasonStaffRecord = {
  id: string;
  lineageId: string;
  team: string;
  season: number;
  sourceUrl: string;
  sourceLabel: string;
  note: string;
  members: SeasonStaffMember[];
};

export const lineageTrees: LineageTree[] = [
  { id: "walsh", label: "WALSH", headCoachName: "Bill Walsh", japanese: "ビル・ウォルシュ系", rootId: "tree-bill-walsh", nodeIds: ["tree-bill-walsh"], years: "1979–1988", teams: ["San Francisco 49ers"], note: "49ersで生まれたWest Coast系の起点。" },
  { id: "parcells", label: "PARCELLS", headCoachName: "Bill Parcells", japanese: "ビル・パーセルズ系", rootId: "tree-bill-parcells", nodeIds: ["tree-bill-parcells"], years: "1983–2006", teams: ["New York Giants", "New England Patriots", "New York Jets", "Dallas Cowboys"], note: "Giants、Patriots、Jets、CowboysにまたがるHCスタッフ期。" },
  { id: "schottenheimer", label: "SCHOTTENHEIMER", headCoachName: "Marty Schottenheimer", japanese: "マーティ・ショッテンハイマー系", rootId: "tree-marty-schottenheimer", nodeIds: ["tree-marty-schottenheimer"], years: "1984–2006", teams: ["Cleveland Browns", "Kansas City Chiefs", "Washington", "San Diego Chargers"], note: "Browns、Chiefs、Washington、ChargersにまたがるHCスタッフ期。" },
  { id: "reeves", label: "REEVES", headCoachName: "Dan Reeves", japanese: "ダン・リーブス系", rootId: "tree-dan-reeves", nodeIds: ["tree-dan-reeves"], years: "1981–2003", teams: ["Denver Broncos", "New York Giants", "Atlanta Falcons"], note: "Broncos、Giants、FalconsにまたがるHCスタッフ期。" },
  { id: "holmgren", label: "HOLMGREN", headCoachName: "Mike Holmgren", japanese: "マイク・ホルムグレン系", rootId: "mike-holmgren", nodeIds: ["mike-holmgren", "andy-reid", "jon-gruden", "steve-mariucci", "mike-sherman", "bill-callahan", "doug-pederson"], years: "1992–2008", teams: ["Green Bay Packers", "Seattle Seahawks", "Philadelphia Eagles"], note: "Packersのスタッフ期からReid、Gruden、Mariucciらが伸びた系譜。" },
  { id: "belichick", label: "BELICHICK", headCoachName: "Bill Belichick", japanese: "ビル・ベリチック系", rootId: "belichick", nodeIds: ["parcells", "belichick", "crennel", "mangini", "mcdaniels", "daboll", "obrien", "patricia", "flores", "judge", "mayo"], years: "1990–2023", teams: ["New York Giants", "New England Patriots"], note: "GiantsとPatriotsのスタッフ期を中心に、守備・攻撃の双方から派生した系譜。" },
  { id: "reid", label: "REID", headCoachName: "Andy Reid", japanese: "アンディ・リード系", rootId: "andy-reid", nodeIds: ["mike-holmgren", "andy-reid", "john-harbaugh", "sean-mcdermott", "doug-pederson", "ron-rivera", "brad-childress", "steve-spagnuolo", "leslie-frazier"], years: "1992–", teams: ["Green Bay Packers", "Philadelphia Eagles", "Kansas City Chiefs"], note: "HolmgrenのGreen Bayを出発点に、EaglesとChiefsで広がった複合ツリー。" },
  { id: "shanahan", label: "SHANAHAN", headCoachName: "Mike Shanahan", japanese: "マイク・シャナハン系", rootId: "mike-shanahan", nodeIds: ["mike-shanahan", "gary-kubiak", "kyle-shanahan", "sean-mcvay", "matt-lafleur", "mike-mcdaniel", "raheem-morris", "jim-haslett", "robert-saleh"], years: "1995–", teams: ["Denver Broncos", "Washington", "San Francisco 49ers"], note: "DenverのOC系とWashingtonの若手攻撃スタッフから枝分かれした系譜。" },
  { id: "dungy", label: "DUNGY", headCoachName: "Tony Dungy", japanese: "トニー・ダンジー系", rootId: "tony-dungy", nodeIds: ["tony-dungy", "lovie-smith", "herm-edwards", "rod-marinelli", "mike-tomlin", "jim-caldwell", "monte-kiffin", "mike-martz"], years: "1996–", teams: ["Tampa Bay Buccaneers", "Indianapolis Colts", "Pittsburgh Steelers"], note: "Tampa Bayの守備スタッフを主軸に、ColtsとSteelersへ接続する系譜。" },
  { id: "carroll", label: "CARROLL", headCoachName: "Pete Carroll", japanese: "ピート・キャロル系", rootId: "pete-carroll", nodeIds: ["pete-carroll", "dan-quinn", "gus-bradley", "robert-saleh", "dave-canales", "raheem-morris"], years: "2010–2023", teams: ["Seattle Seahawks", "Jacksonville Jaguars", "Atlanta Falcons"], note: "Seattleの守備スタッフを中心に、Quinn、Bradley、Salehらが分枝する系譜。" },
  { id: "cowher", label: "COWHER", headCoachName: "Bill Cowher", japanese: "ビル・カウアー系", rootId: "bill-cowher", nodeIds: ["bill-cowher", "ken-whisenhunt", "mike-mularkey", "dick-lebeau", "bruce-arians", "mike-tomlin", "dom-capers"], years: "1992–2006", teams: ["Pittsburgh Steelers"], note: "Cowherの長期Steelersスタッフを軸にした攻守の系譜。" },
  { id: "gruden", label: "GRUDEN", headCoachName: "Jon Gruden", japanese: "ジョン・グルーデン系", rootId: "jon-gruden", nodeIds: ["jon-gruden", "bill-callahan", "monte-kiffin", "rod-marinelli", "mike-tomlin", "jay-gruden", "raheem-morris", "joe-barry"], years: "1998–2008", teams: ["Oakland Raiders", "Tampa Bay Buccaneers"], note: "OaklandとTampa Bayのスタッフ期を軸にした攻守横断の系譜。" },
  { id: "hafley", label: "HAFLEY", headCoachName: "Jeff Hafley", japanese: "ジェフ・ハフリー系", rootId: "registry-jeff-hafley", nodeIds: ["registry-jeff-hafley"], years: "2026–", teams: ["Miami Dolphins"], note: "2026年Miami DolphinsのHCスタッフ期。" },
  { id: "minter", label: "MINTER", headCoachName: "Jesse Minter", japanese: "ジェシー・ミンター系", rootId: "registry-jesse-minter", nodeIds: ["registry-jesse-minter"], years: "2026–", teams: ["Baltimore Ravens"], note: "2026年Baltimore RavensのHCスタッフ期。" },
  { id: "brady", label: "BRADY", headCoachName: "Joe Brady", japanese: "ジョー・ブレイディ系", rootId: "registry-joe-brady", nodeIds: ["registry-joe-brady"], years: "2026–", teams: ["Buffalo Bills"], note: "2026年Buffalo BillsのHCスタッフ期。" },
  { id: "kubiak", label: "KUBIAK", headCoachName: "Klint Kubiak", japanese: "クリント・キュービアク系", rootId: "registry-klint-kubiak", nodeIds: ["registry-klint-kubiak"], years: "2026–", teams: ["Las Vegas Raiders"], note: "2026年Las Vegas RaidersのHCスタッフ期。" },
  { id: "mlafleur", label: "M. LAFLEUR", headCoachName: "Mike LaFleur", japanese: "マイク・ラフルアー系", rootId: "registry-mike-lafleur", nodeIds: ["registry-mike-lafleur"], years: "2026–", teams: ["Arizona Cardinals"], note: "2026年Arizona CardinalsのHCスタッフ期。" },
  { id: "monken", label: "MONKEN", headCoachName: "Todd Monken", japanese: "トッド・モンケン系", rootId: "registry-todd-monken", nodeIds: ["registry-todd-monken"], years: "2026–", teams: ["Cleveland Browns"], note: "2026年Cleveland BrownsのHCスタッフ期。" },
];

export const representativeSeasonStaffRecords: SeasonStaffRecord[] = [
  { id: "nyg-1990", lineageId: "belichick", team: "New York Giants", season: 1990, sourceUrl: "https://www.pro-football-reference.com/teams/nyg/1990.htm", sourceLabel: "Pro Football Reference — 1990 Giants", note: "Parcells–Belichickの代表的な同一スタッフ期。", members: [
    { id: "parcells", name: "Bill Parcells", japanese: "ビル・パーセルズ", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { id: "belichick", name: "Bill Belichick", japanese: "ビル・ベリチック", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "nwe-2001", lineageId: "belichick", team: "New England Patriots", season: 2001, sourceUrl: "https://www.pro-football-reference.com/teams/nwe/2001.htm", sourceLabel: "Pro Football Reference — 2001 Patriots", note: "Super Bowl XXXVI優勝期の代表スタッフ。", members: [
    { id: "belichick", name: "Bill Belichick", japanese: "ビル・ベリチック", role: "HC", contemporaneousRole: "Head Coach / de facto GM", note: "HC" },
    { name: "Charlie Weis", japanese: "チャーリー・ワイズ", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { id: "crennel", name: "Romeo Crennel", japanese: "ロメオ・クレネル", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "nwe-2007", lineageId: "belichick", team: "New England Patriots", season: 2007, sourceUrl: "https://www.pro-football-reference.com/teams/nwe/2007.htm", sourceLabel: "Pro Football Reference — 2007 Patriots", note: "McDanielsとPeesがOC・DCを務めた代表スタッフ。", members: [
    { id: "belichick", name: "Bill Belichick", japanese: "ビル・ベリチック", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { id: "mcdaniels", name: "Josh McDaniels", japanese: "ジョシュ・マクダニエルズ", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { name: "Dean Pees", japanese: "ディーン・ピーズ", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "phi-2002", lineageId: "reid", team: "Philadelphia Eagles", season: 2002, sourceUrl: "https://www.pro-football-reference.com/teams/phi/2002.htm", sourceLabel: "Pro Football Reference — 2002 Eagles", note: "Reid初期Eaglesの主要なスタッフ構成。", members: [
    { id: "andy-reid", name: "Andy Reid", japanese: "アンディ・リード", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { id: "brad-childress", name: "Brad Childress", japanese: "ブラッド・チルドレス", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { name: "Jim Johnson", japanese: "ジム・ジョンソン", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "kan-2019", lineageId: "reid", team: "Kansas City Chiefs", season: 2019, sourceUrl: "https://www.pro-football-reference.com/teams/kan/2019.htm", sourceLabel: "Pro Football Reference — 2019 Chiefs", note: "Super Bowl LIV優勝期の代表スタッフ。", members: [
    { id: "andy-reid", name: "Andy Reid", japanese: "アンディ・リード", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { name: "Eric Bieniemy", japanese: "エリック・ビエニミー", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { id: "steve-spagnuolo", name: "Steve Spagnuolo", japanese: "スティーブ・スパヌオーロ", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "den-1997", lineageId: "shanahan", team: "Denver Broncos", season: 1997, sourceUrl: "https://www.pro-football-reference.com/teams/den/1997.htm", sourceLabel: "Pro Football Reference — 1997 Broncos", note: "Broncos連覇期に向かう代表スタッフ。", members: [
    { id: "mike-shanahan", name: "Mike Shanahan", japanese: "マイク・シャナハン", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { id: "gary-kubiak", name: "Gary Kubiak", japanese: "ゲイリー・キュービアック", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { name: "Greg Robinson", japanese: "グレッグ・ロビンソン", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "was-2012", lineageId: "shanahan", team: "Washington", season: 2012, sourceUrl: "https://www.pro-football-reference.com/teams/was/2012.htm", sourceLabel: "Pro Football Reference — 2012 Washington", note: "Shanahan親子とHaslettが揃う代表スタッフ。", members: [
    { id: "mike-shanahan", name: "Mike Shanahan", japanese: "マイク・シャナハン", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { id: "kyle-shanahan", name: "Kyle Shanahan", japanese: "カイル・シャナハン", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { id: "jim-haslett", name: "Jim Haslett", japanese: "ジム・ハスレット", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "tam-1999", lineageId: "dungy", team: "Tampa Bay Buccaneers", season: 1999, sourceUrl: "https://www.pro-football-reference.com/teams/tam/1999.htm", sourceLabel: "Pro Football Reference — 1999 Buccaneers", note: "Dungy–Kiffin守備スタッフを確認できる代表シーズン。", members: [
    { id: "tony-dungy", name: "Tony Dungy", japanese: "トニー・ダンジー", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { name: "Mike Shula", japanese: "マイク・シュラ", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { id: "monte-kiffin", name: "Monte Kiffin", japanese: "モンテ・キフィン", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "clt-2006", lineageId: "dungy", team: "Indianapolis Colts", season: 2006, sourceUrl: "https://www.pro-football-reference.com/teams/clt/2006.htm", sourceLabel: "Pro Football Reference — 2006 Colts", note: "DungyのColts期におけるOC・DC構成。", members: [
    { id: "tony-dungy", name: "Tony Dungy", japanese: "トニー・ダンジー", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { name: "Tom Moore", japanese: "トム・ムーア", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { name: "Ron Meeks", japanese: "ロン・ミークス", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "gnb-1992", lineageId: "holmgren", team: "Green Bay Packers", season: 1992, sourceUrl: "https://www.packers.com/news/former-packers-offensive-coordinator-sherman-lewis-dies-at-83", sourceLabel: "Green Bay Packers — Sherman Lewis", note: "HolmgrenのPackers就任初年度の主要構成。", members: [
    { id: "mike-holmgren", name: "Mike Holmgren", japanese: "マイク・ホルムグレン", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { name: "Sherman Lewis", japanese: "シャーマン・ルイス", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { name: "Ray Rhodes", japanese: "レイ・ローズ", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "sea-2005", lineageId: "holmgren", team: "Seattle Seahawks", season: 2005, sourceUrl: "https://www.pro-football-reference.com/teams/sea/2005.htm", sourceLabel: "Pro Football Reference — 2005 Seahawks", note: "HolmgrenのSeattle期における代表構成。", members: [
    { id: "mike-holmgren", name: "Mike Holmgren", japanese: "マイク・ホルムグレン", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { name: "Gil Haskell", japanese: "ギル・ハスケル", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { name: "John Marshall", japanese: "ジョン・マーシャル", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "sea-2013", lineageId: "carroll", team: "Seattle Seahawks", season: 2013, sourceUrl: "https://www.pro-football-reference.com/teams/sea/2013.htm", sourceLabel: "Pro Football Reference — 2013 Seahawks", note: "Carroll–Quinnの代表スタッフ。", members: [
    { id: "pete-carroll", name: "Pete Carroll", japanese: "ピート・キャロル", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { name: "Darrell Bevell", japanese: "ダレル・ベベル", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { id: "dan-quinn", name: "Dan Quinn", japanese: "ダン・クイン", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "sea-2020", lineageId: "carroll", team: "Seattle Seahawks", season: 2020, sourceUrl: "https://www.pro-football-reference.com/teams/sea/2020.htm", sourceLabel: "Pro Football Reference — 2020 Seahawks", note: "Carroll期後半のOC・DC構成。", members: [
    { id: "pete-carroll", name: "Pete Carroll", japanese: "ピート・キャロル", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { name: "Brian Schottenheimer", japanese: "ブライアン・ショッテンハイマー", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { name: "Ken Norton Jr.", japanese: "ケン・ノートン・ジュニア", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "pit-1992", lineageId: "cowher", team: "Pittsburgh Steelers", season: 1992, sourceUrl: "https://www.pro-football-reference.com/teams/pit/1992.htm", sourceLabel: "Pro Football Reference — 1992 Steelers", note: "Cowher就任初年度のOC・DC構成。", members: [
    { id: "bill-cowher", name: "Bill Cowher", japanese: "ビル・カウアー", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { name: "Ron Erhardt", japanese: "ロン・エアハルト", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { id: "dom-capers", name: "Dom Capers", japanese: "ドム・ケイパーズ", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "pit-2005", lineageId: "cowher", team: "Pittsburgh Steelers", season: 2005, sourceUrl: "https://www.pro-football-reference.com/teams/pit/2005.htm", sourceLabel: "Pro Football Reference — 2005 Steelers", note: "WhisenhuntとLeBeauを含む代表スタッフ。", members: [
    { id: "bill-cowher", name: "Bill Cowher", japanese: "ビル・カウアー", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { id: "ken-whisenhunt", name: "Ken Whisenhunt", japanese: "ケン・ウィゼンハント", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { id: "dick-lebeau", name: "Dick LeBeau", japanese: "ディック・ルボー", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "rai-2001", lineageId: "gruden", team: "Oakland Raiders", season: 2001, sourceUrl: "https://www.pro-football-reference.com/teams/rai/2001_roster.htm", sourceLabel: "Pro Football Reference — 2001 Raiders", note: "GrudenのOakland期における代表スタッフ。", members: [
    { id: "jon-gruden", name: "Jon Gruden", japanese: "ジョン・グルーデン", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { id: "bill-callahan", name: "Bill Callahan", japanese: "ビル・キャラハン", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { name: "Chuck Bresnahan", japanese: "チャック・ブレスナハン", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
  { id: "tam-2002", lineageId: "gruden", team: "Tampa Bay Buccaneers", season: 2002, sourceUrl: "https://www.pro-football-reference.com/teams/tam/2002.htm", sourceLabel: "Pro Football Reference — 2002 Buccaneers", note: "Super Bowl XXXVII優勝期の代表スタッフ。", members: [
    { id: "jon-gruden", name: "Jon Gruden", japanese: "ジョン・グルーデン", role: "HC", contemporaneousRole: "Head Coach", note: "HC" },
    { name: "Bill Muir", japanese: "ビル・ミューア", role: "OC", contemporaneousRole: "Offensive Coordinator", note: "OC" },
    { id: "monte-kiffin", name: "Monte Kiffin", japanese: "モンテ・キフィン", role: "DC", contemporaneousRole: "Defensive Coordinator", note: "DC" },
  ] },
];

/** 地図の関係記録は既存の系譜データを維持し、年鑑表示は下の全HC正規化データを使う。 */
export const seasonStaffRecords: SeasonStaffRecord[] = completeStaffAlmanac;
export const staffAlmanacRecords: SeasonStaffRecord[] = allHcStaffAlmanacRecords;
export { allHcAlmanacCoaches };
