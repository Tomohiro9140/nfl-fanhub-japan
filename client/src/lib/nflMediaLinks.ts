/**
 * NFL 日本人ブログ・メディア一覧データマスタ (提出用シート準拠)
 */

export type NFLTeamCode =
  | "ARI" | "ATL" | "BAL" | "BUF" | "CAR" | "CHI" | "CIN" | "CLE"
  | "DAL" | "DEN" | "DET" | "GB"  | "HOU" | "IND" | "JAX" | "KC"
  | "LV"  | "LAC" | "LAR" | "MIA" | "MIN" | "NE"  | "NO"  | "NYG"
  | "NYJ" | "PHI" | "PIT" | "SF"  | "SEA" | "TB"  | "TEN" | "WAS";

/** NFL地区順（BUFからスタート: AFC東→北→南→西、NFC東→北→南→西） */
export const DIVISION_TEAM_ORDER: NFLTeamCode[] = [
  // AFC East
  "BUF", "MIA", "NE", "NYJ",
  // AFC North
  "BAL", "CIN", "CLE", "PIT",
  // AFC South
  "HOU", "IND", "JAX", "TEN",
  // AFC West
  "DEN", "KC", "LV", "LAC",
  // NFC East
  "DAL", "NYG", "PHI", "WAS",
  // NFC North
  "CHI", "DET", "GB", "MIN",
  // NFC South
  "ATL", "CAR", "NO", "TB",
  // NFC West
  "ARI", "LAR", "SF", "SEA",
];

export interface BlogFilterRule {
  titleKeywords?: string[];
  categoryOrTagKeywords?: string[];
  targetUrlPattern?: RegExp;
  /** NPBや日常記事などを確実に弾くための除外キーワード */
  excludeKeywords?: string[];
}

export interface NFLMediaLinkItem {
  id: number;
  name: string;
  url: string;
  category: "team_blog" | "general" | "general_and_team" | "special";
  targetTeam?: NFLTeamCode;
  targetTeamName?: string;
  statusText: string;
  isPermitted: boolean;
  isPinnedTop?: boolean;
  showInTeamLatest: boolean;
  /** Linkページを含む全体で適用するフィルター（NPB排除など） */
  globalFilterRule?: BlogFilterRule;
  /** 各チームページの Latest News でのみ適用するフィルター（自チーム記事の抽出） */
  teamFilterRule?: BlogFilterRule;
  rssUrl?: string;
  memo?: string;
}

export const NFL_MEDIA_LINKS: NFLMediaLinkItem[] = [
  {
    id: 1,
    name: "たーくん",
    url: "https://note.com/taakun07",
    category: "team_blog",
    targetTeam: "GB",
    targetTeamName: "Green Bay Packers",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: true,
    rssUrl: "https://note.com/taakun07/rss",
    memo: "全てOK",
  },
  {
    id: 2,
    name: "にわかダラスカウボーイズファン・ツミキ",
    url: "https://note.com/huge_puma7884",
    category: "team_blog",
    targetTeam: "DAL",
    targetTeamName: "Dallas Cowboys",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: true,
    rssUrl: "https://note.com/huge_puma7884/rss",
    memo: "全てOK",
  },
  {
    id: 3,
    name: "びるずだいなすてぃ",
    url: "https://note.com/billsdynasty",
    category: "team_blog",
    targetTeam: "BUF",
    targetTeamName: "Buffalo Bills",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: true,
    rssUrl: "https://note.com/billsdynasty/rss",
    memo: "全てOK",
  },
  {
    id: 4,
    name: "ふぅだっと。 （NFL / セインツ）",
    url: "https://ameblo.jp/yoda-da-yon",
    category: "team_blog",
    targetTeam: "NO",
    targetTeamName: "New Orleans Saints",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: true,
    rssUrl: "https://rssblog.ameba.jp/yoda-da-yon/rss20.xml",
    memo: "全てOK",
  },
  {
    id: 5,
    name: "鶴嘴温助",
    url: "https://note.com/gentle_dahlia649",
    category: "team_blog",
    targetTeam: "DET",
    targetTeamName: "Detroit Lions",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: true,
    rssUrl: "https://note.com/gentle_dahlia649/rss",
    memo: "全てOK",
  },
  {
    id: 6,
    name: "ノーハドル書きなぐる - Patriots Fan Blog -",
    url: "https://foxboro.blog.fc2.com/",
    category: "team_blog",
    targetTeam: "NE",
    targetTeamName: "New England Patriots",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: true,
    rssUrl: "https://foxboro.blog.fc2.com/?xml",
    memo: "全てOK",
  },
  {
    id: 7,
    name: "Jaguars Note",
    url: "https://www.jaguars-note.com/",
    category: "team_blog",
    targetTeam: "JAX",
    targetTeamName: "Jacksonville Jaguars",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: true,
    rssUrl: "https://www.jaguars-note.com/feed/",
    memo: "全てOK",
  },
  {
    id: 8,
    name: "村田",
    url: "https://note.com/murata_north",
    category: "team_blog",
    targetTeam: "NYG",
    targetTeamName: "New York Giants",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: true,
    rssUrl: "https://note.com/murata_north/rss",
    memo: "全てOK",
  },
  {
    id: 9,
    name: "GO! HAWKS!",
    url: "https://seahawks12s.blog.jp/",
    category: "team_blog",
    targetTeam: "SEA",
    targetTeamName: "Seattle Seahawks",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: true,
    rssUrl: "https://seahawks12s.blog.jp/index.rdf",
    memo: "全てOK",
  },
  {
    id: 10,
    name: "リトルナイナー",
    url: "https://note.com/atsu_49ers",
    category: "team_blog",
    targetTeam: "SF",
    targetTeamName: "San Francisco 49ers",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: true,
    // Linkページでは全件表示、チームページのLatest Newsでのみ【49ers】で絞り込み
    teamFilterRule: {
      titleKeywords: ["49ers", "フォーティナイナーズ", "ナイナーズ"],
    },
    rssUrl: "https://note.com/atsu_49ers/rss",
    memo: "【49ers】によるタイトルでのタグ仕訳必要",
  },
  {
    id: 11,
    name: "Yukirhythm-ユーキリズム-",
    url: "https://ameblo.jp/yukirhythm5/",
    category: "team_blog",
    targetTeam: "PHI",
    targetTeamName: "Philadelphia Eagles",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: true,
    globalFilterRule: {
      categoryOrTagKeywords: ["イーグルス", "Eagles", "theme-10093848591"],
    },
    rssUrl: "https://rssblog.ameba.jp/yukirhythm5/rss20.xml",
    memo: "カテゴリー（https://ameblo.jp/yukirhythm5/theme-10093848591.html）のみ",
  },
  {
    id: 12,
    name: "茶犬 NFLブログ",
    url: "https://nflchao.com/",
    category: "general_and_team",
    targetTeam: "CLE",
    targetTeamName: "Cleveland Browns",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: true,
    // チームページでのみブラウンズ記事に限定
    teamFilterRule: {
      categoryOrTagKeywords: ["ブラウンズ", "Browns", "cat_36746"],
      targetUrlPattern: /cat_36746/,
    },
    rssUrl: "https://nflchao.com/feed/",
    memo: "ブラウンズタグのみチームページへ",
  },
  {
    id: 13,
    name: "K猫のDENファン日記",
    url: "https://www.kcatfootball.net/",
    category: "team_blog",
    targetTeam: "DEN",
    targetTeamName: "Denver Broncos",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: true,
    // チームページでのみブロンコス記事に限定
    teamFilterRule: {
      categoryOrTagKeywords: ["デンバーブロンコス", "ブロンコス", "Broncos", "cat_401706"],
      targetUrlPattern: /cat_401706/,
    },
    rssUrl: "https://www.kcatfootball.net/index.rdf",
    memo: "デンバーブロンコスタグのみチームページへ",
  },
  {
    id: 14,
    name: "JETS狂の宴",
    url: "https://jets94.com/",
    category: "team_blog",
    targetTeam: "NYJ",
    targetTeamName: "New York Jets",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: true,
    // チームページでのみジェッツ記事に限定
    teamFilterRule: {
      categoryOrTagKeywords: ["ジェッツ", "Jets"],
    },
    rssUrl: "https://jets94.com/feed/",
    memo: "ジェッツタグのみチームページへ",
  },
  {
    id: 15,
    name: "アメフトーーク",
    url: "https://note.com/amefootalk",
    category: "general_and_team",
    targetTeam: "DEN",
    targetTeamName: "Denver Broncos",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: true,
    // チームページでのみブロンコス記事に限定
    teamFilterRule: {
      titleKeywords: ["ブロンコス", "Broncos"],
    },
    rssUrl: "https://note.com/amefootalk/rss",
    memo: "タイトルにブロンコスがあるものはチームページへ",
  },
  {
    id: 16,
    name: "sleepy（アメフトニウム）",
    url: "https://note.com/sleepy_nfl_fan",
    category: "general",
    statusText: "許諾済",
    isPermitted: true,
    showInTeamLatest: false,
    rssUrl: "https://note.com/sleepy_nfl_fan/rss",
  },
  {
    id: 17,
    name: "Crazy Dol-Fan Diary",
    url: "https://ameblo.jp/shulasarmytokyo/",
    category: "team_blog",
    targetTeam: "MIA",
    targetTeamName: "Miami Dolphins",
    statusText: "済",
    isPermitted: true,
    showInTeamLatest: false,
    rssUrl: "https://rssblog.ameba.jp/shulasarmytokyo/rss20.xml",
    memo: "全てOK",
  },
  {
    id: 18,
    name: "P-BLUE",
    url: "https://note.com/pantherblue",
    category: "team_blog",
    targetTeam: "CAR",
    targetTeamName: "Carolina Panthers",
    statusText: "済",
    isPermitted: true,
    showInTeamLatest: false,
    rssUrl: "https://note.com/pantherblue/rss",
    memo: "全てOK",
  },
  {
    id: 19,
    name: "Do Your Job - NFL Patriots Fan Blog -",
    url: "https://pats185.livedoor.blog/",
    category: "team_blog",
    targetTeam: "NE",
    targetTeamName: "New England Patriots",
    statusText: "済",
    isPermitted: true,
    showInTeamLatest: false,
    rssUrl: "https://pats185.livedoor.blog/index.rdf",
    memo: "全てOK",
  },
  {
    id: 20,
    name: "ちょび太のお気楽日記",
    url: "https://ameblo.jp/lovelycat-chobi/",
    category: "team_blog",
    targetTeam: "SEA",
    targetTeamName: "Seattle Seahawks",
    statusText: "済",
    isPermitted: true,
    showInTeamLatest: false,
    rssUrl: "https://rssblog.ameba.jp/lovelycat-chobi/rss20.xml",
    globalFilterRule: {
      categoryOrTagKeywords: ["シーホークス", "Seahawks"],
      excludeKeywords: [
        "NPB", "セ・リーグ", "パ・リーグ", "クライマックスシリーズ",
        "ジャイアンツ", "タイガース", "プロ野球", "甲子園", "ドラフト会議"
      ],
    },
    memo: "テーマにシーホークスがついているもの",
  },
  {
    id: 21,
    name: "くうた",
    url: "https://note.com/kuuta_browns",
    category: "team_blog",
    targetTeam: "CLE",
    targetTeamName: "Cleveland Browns",
    statusText: "リプライ済",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://note.com/kuuta_browns/rss",
    memo: "全てOK",
  },
  {
    id: 22,
    name: "NFL_SAMURAI",
    url: "https://note.com/juicy_coot952",
    category: "general",
    statusText: "リプライ済",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://note.com/juicy_coot952/rss",
    memo: "リンクのみ",
  },
  {
    id: 23,
    name: "WhoDeyJapan",
    url: "https://note.com/whodeyjapan",
    category: "team_blog",
    targetTeam: "CIN",
    targetTeamName: "Cincinnati Bengals",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://note.com/whodeyjapan/rss",
    memo: "全てOK",
  },
  {
    id: 24,
    name: "bufbillsのもやもやビルズ",
    url: "https://bufbills.exblog.jp/",
    category: "team_blog",
    targetTeam: "BUF",
    targetTeamName: "Buffalo Bills",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://bufbills.exblog.jp/index.xml",
    memo: "全てOK",
  },
  {
    id: 25,
    name: "isisi",
    url: "https://note.com/isisi",
    category: "team_blog",
    targetTeam: "PHI",
    targetTeamName: "Philadelphia Eagles",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://note.com/isisi/rss",
    memo: "全てOK",
  },
  {
    id: 26,
    name: "ディフェンド・ザ・ノース",
    url: "http://blog.livedoor.jp/kobasoo",
    category: "team_blog",
    targetTeam: "MIN",
    targetTeamName: "Minnesota Vikings",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "http://blog.livedoor.jp/kobasoo/index.rdf",
    memo: "全てOK",
  },
  {
    id: 27,
    name: "BEAR DOWN! Chicago Bears",
    url: "https://chicagobears.blog.jp/",
    category: "team_blog",
    targetTeam: "CHI",
    targetTeamName: "Chicago Bears",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://chicagobears.blog.jp/index.rdf",
    memo: "全てOK",
  },
  {
    id: 28,
    name: "broncomaniacのブログ版",
    url: "https://broncomaniac.blog.fc2.com/",
    category: "team_blog",
    targetTeam: "DEN",
    targetTeamName: "Denver Broncos",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://broncomaniac.blog.fc2.com/?xml",
    memo: "全てOK",
  },
  {
    id: 29,
    name: "Burgundy & Gold",
    url: "https://washingtonredskins.seesaa.net/",
    category: "team_blog",
    targetTeam: "WAS",
    targetTeamName: "Washington Commanders",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://washingtonredskins.seesaa.net/index.rdf",
    memo: "全てOK",
  },
  {
    id: 30,
    name: "NYGを応援してるかもしれないブログ",
    url: "https://nygmad.blog.jp/",
    category: "team_blog",
    targetTeam: "NYG",
    targetTeamName: "New York Giants",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://nygmad.blog.jp/index.rdf",
    memo: "全てOK",
  },
  {
    id: 31,
    name: "RAIDERSを愛する漢のブログ",
    url: "https://raidernationtokyo.blog.jp/",
    category: "team_blog",
    targetTeam: "LV",
    targetTeamName: "Las Vegas Raiders",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://raidernationtokyo.blog.jp/index.rdf",
    memo: "全てOK",
  },
  {
    id: 32,
    name: "TEXANS SWARM",
    url: "https://texans-swarm.hatenablog.jp/",
    category: "team_blog",
    targetTeam: "HOU",
    targetTeamName: "Houston Texans",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://texans-swarm.hatenablog.jp/rss",
    memo: "全てOK",
  },
  {
    id: 33,
    name: "TITANS SACK MANIA",
    url: "https://titanssackmania.blog.fc2.com/",
    category: "team_blog",
    targetTeam: "TEN",
    targetTeamName: "Tennessee Titans",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://titanssackmania.blog.fc2.com/?xml",
    memo: "全てOK",
  },
  {
    id: 34,
    name: "アリゾナマニアの知ったか発言集III",
    url: "https://arizona-mania.hatenablog.com/",
    category: "team_blog",
    targetTeam: "ARI",
    targetTeamName: "Arizona Cardinals",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://arizona-mania.hatenablog.com/rss",
    memo: "全てOK",
  },
  {
    id: 35,
    name: "コルツの国から",
    url: "http://blog.livedoor.jp/coltsjp",
    category: "team_blog",
    targetTeam: "IND",
    targetTeamName: "Indianapolis Colts",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "http://blog.livedoor.jp/coltsjp/index.rdf",
    memo: "全てOK",
  },
  {
    id: 36,
    name: "超個人的NFL備忘録",
    url: "http://blog.livedoor.jp/yasgt-nfl",
    category: "team_blog",
    targetTeam: "PIT",
    targetTeamName: "Pittsburgh Steelers",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "http://blog.livedoor.jp/yasgt-nfl/index.rdf",
    memo: "全てOK",
  },
  {
    id: 37,
    name: "鷲の巣",
    url: "https://eagles-nest.hatenablog.com/",
    category: "team_blog",
    targetTeam: "PHI",
    targetTeamName: "Philadelphia Eagles",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://eagles-nest.hatenablog.com/rss",
    memo: "全てOK",
  },
  {
    id: 38,
    name: "みとこが",
    url: "https://note.com/terakoya32",
    category: "team_blog",
    targetTeam: "SEA",
    targetTeamName: "Seattle Seahawks",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://note.com/terakoya32/rss",
    memo: "アメフト記事まとめ（https://note.com/terakoya32/m/mf8c430a3d168）のもののみ",
  },
  {
    id: 39,
    name: "NFL全試合観戦記",
    url: "https://woodheadmoss.com",
    category: "general",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    // はてなブログProのRSSを設定
    rssUrl: "https://www.woodheadmoss.com/rss",
    memo: "リンクのみ",
  },
  {
    id: 40,
    name: "beanbag",
    url: "https://note.com/faircatch",
    category: "general",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://note.com/faircatch/rss",
    memo: "リンクのみ",
  },
  {
    id: 41,
    name: "しゅうまい12ブログ",
    url: "https://shumai12sea.hatenablog.com/",
    category: "team_blog",
    targetTeam: "SEA",
    targetTeamName: "Seattle Seahawks",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://shumai12sea.hatenablog.com/rss",
    memo: "カテゴリー（https://shumai12sea.hatenablog.com/archive/category/Seahawks）のみチームページへ",
  },
  {
    id: 42,
    name: "アローヘッドな日々／チーフスブログ",
    url: "http://arrowheadlike.blog.fc2.com/",
    category: "team_blog",
    targetTeam: "KC",
    targetTeamName: "Kansas City Chiefs",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "http://arrowheadlike.blog.fc2.com/?xml",
    memo: "全てOK",
  },
  {
    id: 43,
    name: "ジャガーズ中毒",
    url: "https://gooooya.livedoor.blog/",
    category: "team_blog",
    targetTeam: "JAX",
    targetTeamName: "Jacksonville Jaguars",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://gooooya.livedoor.blog/index.rdf",
    memo: "全てOK",
  },
  {
    id: 44,
    name: "ダラスカウボーイズファン",
    url: "https://note.com/cowboysjapan",
    category: "team_blog",
    targetTeam: "DAL",
    targetTeamName: "Dallas Cowboys",
    statusText: "連絡手段なし",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://note.com/cowboysjapan/rss",
    memo: "仕訳必要",
  },
  {
    id: 45,
    name: "AmesNFL",
    url: "https://ames-nfl.com/",
    category: "special",
    statusText: "神サイト",
    isPermitted: true,
    isPinnedTop: true,
    showInTeamLatest: false,
    // Amesの公式Note研究記事RSSを設定
    rssUrl: "https://note.com/ames_nflresearch/rss",
    memo: "リンクのみ",
  },
  {
    id: 46,
    name: "DB アイランド−NFL ARI フラッグ−",
    url: "https://nfl-cardinals.com/",
    category: "general",
    statusText: "届いていない？",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://nfl-cardinals.com/feed/",
    memo: "リンクのみ",
  },
  {
    id: 47,
    name: "FTTB's Playbook ｜ Bang Bang!",
    url: "https://note.com/fttb49ers",
    category: "general",
    statusText: "未設定",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://note.com/fttb49ers/rss",
    memo: "リンクのみ",
  },
  {
    id: 48,
    name: "hiro",
    url: "https://note.com/kind_quokka9252",
    category: "general",
    statusText: "未設定",
    isPermitted: false,
    showInTeamLatest: false,
    rssUrl: "https://note.com/kind_quokka9252/rss",
    memo: "リンクのみ",
  },
];

/**
 * リンク集ページ向けの厳密ソートリスト
 * 1. AmesNFL
 * 2. 許諾済チームブログ（地区順にBUFからスタート）
 * 3. 許諾済総合ブログ
 * 4. 許諾なしチームブログ（地区順にBUFからスタート）
 * 5. 許諾なし総合ブログ
 */
export function getSortedMediaLinks(): NFLMediaLinkItem[] {
  return [...NFL_MEDIA_LINKS].sort((a, b) => {
    if (a.isPinnedTop) return -1;
    if (b.isPinnedTop) return 1;

    const getRank = (item: NFLMediaLinkItem) => {
      if (item.isPermitted && item.targetTeam) return 1; // 許諾済チーム
      if (item.isPermitted && !item.targetTeam) return 2; // 許諾済総合
      if (!item.isPermitted && item.targetTeam) return 3; // 許諾なしチーム
      return 4;                                          // 許諾なし総合
    };

    const rankA = getRank(a);
    const rankB = getRank(b);

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    if ((rankA === 1 || rankA === 3) && a.targetTeam && b.targetTeam) {
      const idxA = DIVISION_TEAM_ORDER.indexOf(a.targetTeam);
      const idxB = DIVISION_TEAM_ORDER.indexOf(b.targetTeam);
      const orderA = idxA !== -1 ? idxA : 999;
      const orderB = idxB !== -1 ? idxB : 999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
    }

    return a.id - b.id;
  });
}
