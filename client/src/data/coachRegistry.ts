/**
 * Verification Ledger: NFL HC/OC/DC role records from 1990 onward.
 * Generated from franchise-level audit data. Do not edit manually; run scripts/build-coach-registry.mjs.
 */
export type RegistryRole = "HC" | "OC" | "DC";
export type RegistryRecordStatus = "source-linked" | "needs-review";

export type RegistryRoleRecord = {
  role: RegistryRole;
  team: string;
  years: string;
  sourceUrl: string;
  note: string;
  franchise: string;
  status: RegistryRecordStatus;
};

export type RegistryCoach = {
  id: string;
  name: string;
  roles: RegistryRole[];
  firstYear: number;
  lastYear: number;
  sourceCount: number;
  verification: "source-linked" | "partial";
  records: RegistryRoleRecord[];
};

export type RegistryTeamAudit = {
  franchise: string;
  confirmedRows: number;
  reviewRows: number;
  coverageNote: string;
  sourceSummary: string;
};

const allRegistryCoaches: RegistryCoach[] = [
  {
    "id": "registry-aaron-glenn",
    "name": "Aaron Glenn",
    "records": [
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "2021–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "HC",
        "team": "New York Jets",
        "years": "2025–2026",
        "sourceUrl": "https://pro-football-history.com/franchise/3/new-york-jets-coaches",
        "note": "2026年はPFRおよびチーム年次記録で確認。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2021,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-aaron-kromer",
    "name": "Aaron Kromer",
    "records": [
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "2013–2014",
        "sourceUrl": "https://www.nbcchicago.com/news/sports/nfl/chicago-bears/heres-a-record-of-the-bears-offensive-coordinators-since-2000/3323341/",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New Orleans Saints",
        "years": "2012",
        "sourceUrl": "https://www.neworleanssaints.com/team/history/head-coaches",
        "note": "公式歴史ページが2012年の暫定HCとして掲載。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2012,
    "lastYear": 2014,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-adam-gase",
    "name": "Adam Gase",
    "records": [
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "2015–2015",
        "sourceUrl": "https://www.nbcchicago.com/news/sports/nfl/chicago-bears/heres-a-record-of-the-bears-offensive-coordinators-since-2000/3323341/",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "2013–2014",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Miami Dolphins",
        "years": "2016–2018",
        "sourceUrl": "https://www.pro-football-reference.com/teams/mia/coaches.htm",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Jets",
        "years": "2019–2020",
        "sourceUrl": "https://www.newyorkjets.com/history/coaching-history/",
        "note": "フランチャイズ公式HC歴。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2013,
    "lastYear": 2020,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-adam-stenavich",
    "name": "Adam Stenavich",
    "records": [
      {
        "role": "OC",
        "team": "Green Bay Packers",
        "years": "2019–2025",
        "sourceUrl": "https://www.pro-football-reference.com/teams/gnb/2025.htm",
        "note": "PFRの2024・2025年チームページおよびPackers公式現行名簿でOC。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2019,
    "lastYear": 2025,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-aden-durde",
    "name": "Aden Durde",
    "records": [
      {
        "role": "DC",
        "team": "Seattle Seahawks",
        "years": "2024–2026",
        "sourceUrl": "https://www.seahawks.com/team/coaches-roster/",
        "note": "公式現行スタッフページでDefensive Coordinator。",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2024,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-al-golden",
    "name": "Al Golden",
    "records": [
      {
        "role": "DC",
        "team": "Cincinnati Bengals",
        "years": "2025–2026",
        "sourceUrl": "https://www.bengals.com/news/bengals-finalize-2026-coaching-staff",
        "note": "2026年公式スタッフ一覧でDC。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2025,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-al-groh",
    "name": "Al Groh",
    "records": [
      {
        "role": "DC",
        "team": "New England Patriots",
        "years": "1993–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/8/new-england-patriots-defensive-coordinator-history",
        "note": "役職史では1993–1996年DC。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "1991–1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Jets",
        "years": "2000",
        "sourceUrl": "https://www.newyorkjets.com/history/coaching-history/",
        "note": "フランチャイズ公式HC歴。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1991,
    "lastYear": 2000,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-al-holcomb",
    "name": "Al Holcomb",
    "records": [
      {
        "role": "DC",
        "team": "Arizona Cardinals",
        "years": "2018–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/8/arizona-cardinals-defensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Carolina Panthers",
        "years": "2022",
        "sourceUrl": "https://pro-football-history.com/franchise/26/carolina-panthers-coaches",
        "note": "2022年の暫定DCとして記載。シーズン内の正式な在任開始・終了日は主要原典間で要確認。",
        "franchise": "Carolina Panthers",
        "status": "needs-review"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2018,
    "lastYear": 2022,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-al-saunders",
    "name": "Al Saunders",
    "records": [
      {
        "role": "OC",
        "team": "Kansas City Chiefs",
        "years": "2001–2005",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Oakland Raiders",
        "years": "2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "St. Louis Rams",
        "years": "2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2001,
    "lastYear": 2011,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-alan-williams",
    "name": "Alan Williams",
    "records": [
      {
        "role": "DC",
        "team": "Chicago Bears",
        "years": "2022–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/8/chicago-bears-defensive-coordinator-history",
        "note": "2023年途中辞任のため、シーズン全体を担当したかは要確認。",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Minnesota Vikings",
        "years": "2012–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/8/minnesota-vikings-defensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2012,
    "lastYear": 2023,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-alex-van-pelt",
    "name": "Alex Van Pelt",
    "records": [
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "2009–2009",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2020–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New England Patriots",
        "years": "2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/7/new-england-patriots-offensive-coordinator-history",
        "note": "役職史では2024年OC。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2009,
    "lastYear": 2024,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-alex-wood",
    "name": "Alex Wood",
    "records": [
      {
        "role": "OC",
        "team": "Arizona Cardinals",
        "years": "2004–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/7/arizona-cardinals-offensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2004,
    "lastYear": 2004,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-andrew-janocko",
    "name": "Andrew Janocko",
    "records": [
      {
        "role": "OC",
        "team": "Las Vegas Raiders",
        "years": "2026–2026",
        "sourceUrl": "https://www.raiders.com/news/raiders-name-andrew-janocko-offensive-coordinator",
        "note": "2026年2月15日就任。2026シーズン進行中。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-andy-reid",
    "name": "Andy Reid",
    "records": [
      {
        "role": "HC",
        "team": "Kansas City Chiefs",
        "years": "2013–2026",
        "sourceUrl": "https://www.chiefs.com/team/coaches-roster/",
        "note": "2013就任。2026は現行シーズンの公式掲載。",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Philadelphia Eagles",
        "years": "1999–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/1/philadelphia-eagles-head-coach-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1999,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-anthony-campanile",
    "name": "Anthony Campanile",
    "records": [
      {
        "role": "DC",
        "team": "Jacksonville Jaguars",
        "years": "2025–2026",
        "sourceUrl": "https://www.jaguars.com/team/coaches-roster/anthony-campanile",
        "note": "2026年は現職・シーズン進行中。",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2025,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-anthony-lynn",
    "name": "Anthony Lynn",
    "records": [
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "HC",
        "team": "Los Angeles Chargers",
        "years": "2017–2020",
        "sourceUrl": "https://www.chargers.com/team/history/coaching-history",
        "note": "2017年にSan DiegoからLos Angelesへ名称変更。",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2017,
    "lastYear": 2021,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-anthony-weaver",
    "name": "Anthony Weaver",
    "records": [
      {
        "role": "DC",
        "team": "Baltimore Ravens",
        "years": "2026–2026",
        "sourceUrl": "https://www.baltimoreravens.com/team/coaches-roster/",
        "note": "2026年シーズンの現職。シーズンは調査時点で進行前・未完了。",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Houston Texans",
        "years": "2020–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/8/houston-texans-defensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Miami Dolphins",
        "years": "2024–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/8/miami-dolphins-defensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2020,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-antonio-pierce",
    "name": "Antonio Pierce",
    "records": [
      {
        "role": "HC",
        "team": "Las Vegas Raiders",
        "years": "2023–2024",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "2023年はシーズン内に代理HCとして就任し、公式歴史ページは2023–24と記載。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2023,
    "lastYear": 2024,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-art-shell",
    "name": "Art Shell",
    "records": [
      {
        "role": "HC",
        "team": "Los Angeles Raiders",
        "years": "1990–1994",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "公式HC歴史ページの1989–94在任記録に基づく。1990–94はフランチャイズ移転に伴い1995年までのチーム名表記と照合が必要。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Oakland Raiders",
        "years": "2006",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "第2期。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 2006,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-arthur-smith",
    "name": "Arthur Smith",
    "records": [
      {
        "role": "HC",
        "team": "Atlanta Falcons",
        "years": "2021–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/1/atlanta-falcons-head-coach-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Pittsburgh Steelers",
        "years": "2024–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/7/pittsburgh-steelers-offensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tennessee Titans",
        "years": "2019–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2019,
    "lastYear": 2025,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-barry-switzer",
    "name": "Barry Switzer",
    "records": [
      {
        "role": "HC",
        "team": "Dallas Cowboys",
        "years": "1994–1997",
        "sourceUrl": "https://www.dallascowboys.com/news/rank-em-head-coaches-in-cowboys-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1994,
    "lastYear": 1997,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-ben-johnson",
    "name": "Ben Johnson",
    "records": [
      {
        "role": "HC",
        "team": "Chicago Bears",
        "years": "2025–2026",
        "sourceUrl": "https://www.chicagobears.com/team/coaches/",
        "note": "2025年1月21日就任。2026年は現職として掲載されるが、シーズン完了後の確定在任年ではない。",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "2022–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2022,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-ben-mcadoo",
    "name": "Ben McAdoo",
    "records": [
      {
        "role": "OC",
        "team": "Carolina Panthers",
        "years": "2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/7/carolina-panthers-offensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Giants",
        "years": "2016–2017",
        "sourceUrl": "https://www.pro-football-reference.com/teams/nyg/coaches.htm",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Giants",
        "years": "2014–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/7/new-york-giants-offensive-coordinator-history",
        "note": "後のHCと同一人物。",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2014,
    "lastYear": 2022,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-bill-arnsparger",
    "name": "Bill Arnsparger",
    "records": [
      {
        "role": "DC",
        "team": "San Diego Chargers",
        "years": "1992–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/8/los-angeles-chargers-defensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1992,
    "lastYear": 1994,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-bill-belichick",
    "name": "Bill Belichick",
    "records": [
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "1991–1995",
        "sourceUrl": "https://www.clevelandbrowns.com/team/history/head-coaches",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New England Patriots",
        "years": "2000–2023",
        "sourceUrl": "https://www.patriots.com/press-room/history",
        "note": "公式歴史ページは2024年1月11日に24年の在任終了を記載。",
        "franchise": "New England Patriots",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "1990–1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 2023,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-bill-callahan",
    "name": "Bill Callahan",
    "records": [
      {
        "role": "OC",
        "team": "Dallas Cowboys",
        "years": "2012–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/7/dallas-cowboys-offensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Oakland Raiders",
        "years": "2002–2003",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Oakland Raiders",
        "years": "1998–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Washington Redskins",
        "years": "2019–2019",
        "sourceUrl": "https://pro-football-history.com/franchise/40/washington-commanders-coaches",
        "note": "2019年シーズン途中からの代理HC。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1998,
    "lastYear": 2019,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-bill-cowher",
    "name": "Bill Cowher",
    "records": [
      {
        "role": "DC",
        "team": "Kansas City Chiefs",
        "years": "1990–1991",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Pittsburgh Steelers",
        "years": "1992–2006",
        "sourceUrl": "https://www.pro-football-reference.com/teams/pit/coaches.htm",
        "note": "PFRのチーム・コーチ年表に基づく。",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 2006,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-bill-davis",
    "name": "Bill Davis",
    "records": [
      {
        "role": "DC",
        "team": "Arizona Cardinals",
        "years": "2009–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/8/arizona-cardinals-defensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Philadelphia Eagles",
        "years": "2013–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/8/philadelphia-eagles-defensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "2005–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/8/san-francisco-49ers-defensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2005,
    "lastYear": 2015,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-bill-lazor",
    "name": "Bill Lazor",
    "records": [
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "2020–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/7/chicago-bears-offensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cincinnati Bengals",
        "years": "2018–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/7/cincinnati-bengals-offensive-coordinator-history",
        "note": "姓名表記 Bill Lazor。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "2014–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2014,
    "lastYear": 2021,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-bill-mcpherson",
    "name": "Bill McPherson",
    "records": [
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "1990–1993",
        "sourceUrl": "https://www.49ers.com/news/every-49ers-defensive-coordinator-since-george-seifert-14857597",
        "note": "1989–1993。1990年PFRでの表記はBill McPherson。",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1993,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-bill-muir",
    "name": "Bill Muir",
    "records": [
      {
        "role": "DC",
        "team": "Indianapolis Colts",
        "years": "1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/8/indianapolis-colts-defensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Kansas City Chiefs",
        "years": "2011",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "2002–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/7/tampa-bay-buccaneers-offensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC",
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 2011,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-bill-musgrave",
    "name": "Bill Musgrave",
    "records": [
      {
        "role": "OC",
        "team": "Carolina Panthers",
        "years": "2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/7/carolina-panthers-offensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "2018",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Jacksonville Jaguars",
        "years": "2003–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/7/jacksonville-jaguars-offensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Oakland Raiders",
        "years": "2015–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "2011–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2000,
    "lastYear": 2018,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-bill-obrien",
    "name": "Bill O'Brien",
    "records": [
      {
        "role": "HC",
        "team": "Houston Texans",
        "years": "2014–2020",
        "sourceUrl": "https://www.pro-football-reference.com/teams/htx/coaches.htm",
        "note": "2020年シーズン途中に解任。シーズン単位の在任年表上は2014–2020だが、2020年残余はRomeo Crennelが代理HC。",
        "franchise": "Houston Texans",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "New England Patriots",
        "years": "2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/7/new-england-patriots-offensive-coordinator-history",
        "note": "2011年および2023年の非連続在任。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "New England Patriots",
        "years": "2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/7/new-england-patriots-offensive-coordinator-history",
        "note": "2011年および2023年の非連続在任。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2011,
    "lastYear": 2023,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-bill-parcells",
    "name": "Bill Parcells",
    "records": [
      {
        "role": "HC",
        "team": "Dallas Cowboys",
        "years": "2003–2006",
        "sourceUrl": "https://www.dallascowboys.com/news/rank-em-head-coaches-in-cowboys-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New England Patriots",
        "years": "1993–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/1/new-england-patriots-head-coach-history",
        "note": "",
        "franchise": "New England Patriots",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Giants",
        "years": "1990–1990",
        "sourceUrl": "https://www.pro-football-reference.com/teams/nyg/coaches.htm",
        "note": "1990シーズン終了後まで在任。",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Jets",
        "years": "1997–1999",
        "sourceUrl": "https://www.newyorkjets.com/history/coaching-history/",
        "note": "フランチャイズ公式HC歴。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 2006,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-bill-sheridan",
    "name": "Bill Sheridan",
    "records": [
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "2009–2009",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tampa Bay Buccaneers",
        "years": "2012–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/8/tampa-bay-buccaneers-defensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2009,
    "lastYear": 2013,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-blake-williams",
    "name": "Blake Williams",
    "records": [
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/498/cleveland-browns-interim-defensive-coordinator-history",
        "note": "2018年のinterim defensive coordinator。通常のDC記録とは別建て。",
        "franchise": "Cleveland Browns",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "St. Louis Rams",
        "years": "2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2012,
    "lastYear": 2018,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-bob-babich",
    "name": "Bob Babich",
    "records": [
      {
        "role": "DC",
        "team": "Chicago Bears",
        "years": "2007–2009",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/8/chicago-bears-defensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Jacksonville Jaguars",
        "years": "2013–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/8/jacksonville-jaguars-defensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2007,
    "lastYear": 2015,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-bob-bratkowski",
    "name": "Bob Bratkowski",
    "records": [
      {
        "role": "OC",
        "team": "Cincinnati Bengals",
        "years": "2001–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/7/cincinnati-bengals-offensive-coordinator-history",
        "note": "姓名表記 Bob Bratkowski。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Jacksonville Jaguars",
        "years": "2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/7/jacksonville-jaguars-offensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Seattle Seahawks",
        "years": "1995–1998",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/7/seattle-seahawks-offensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1995,
    "lastYear": 2012,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-bob-sanders",
    "name": "Bob Sanders",
    "records": [
      {
        "role": "DC",
        "team": "Green Bay Packers",
        "years": "2006–2008",
        "sourceUrl": "https://www.jsonline.com/story/sports/nfl/packers/2024/01/26/here-are-all-of-the-green-bay-packers-defensive-coordinators-in-history/72351007007/",
        "note": "主要報道の歴代DC一覧で2006–08年。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2006,
    "lastYear": 2008,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-bob-schnelker",
    "name": "Bob Schnelker",
    "records": [
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "同資料は1986–1990のOCと記載。",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1990,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-bob-slowik",
    "name": "Bob Slowik",
    "records": [
      {
        "role": "DC",
        "team": "Chicago Bears",
        "years": "1993–1998",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/8/chicago-bears-defensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Green Bay Packers",
        "years": "2004–2004",
        "sourceUrl": "https://www.pro-football-history.com/franchpos/43/8/green-bay-packers-defensive-coordinator-history",
        "note": "2004年のDCとして主要コーチ履歴に掲載。",
        "franchise": "Green Bay Packers",
        "status": "needs-review"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1993,
    "lastYear": 2004,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-bob-sutton",
    "name": "Bob Sutton",
    "records": [
      {
        "role": "DC",
        "team": "Kansas City Chiefs",
        "years": "2013–2018",
        "sourceUrl": "https://www.chiefs.com/news/chiefs-name-bob-sutton-as-defensive-coordinator-9342416",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Jets",
        "years": "2006–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/8/new-york-jets-defensive-coordinator-history",
        "note": "DC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2006,
    "lastYear": 2018,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-bobby-babich",
    "name": "Bobby Babich",
    "records": [
      {
        "role": "DC",
        "team": "Buffalo Bills",
        "years": "2024–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/8/buffalo-bills-defensive-coordinator-history",
        "note": "2023年はDC欄に確認できず、LBコーチ等の肩書との混同を避けて未収録。",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2024,
    "lastYear": 2025,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-bobby-jackson",
    "name": "Bobby Jackson",
    "records": [
      {
        "role": "OC",
        "team": "St. Louis Rams",
        "years": "2000–2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2000,
    "lastYear": 2002,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-bobby-petrino",
    "name": "Bobby Petrino",
    "records": [
      {
        "role": "HC",
        "team": "Atlanta Falcons",
        "years": "2007",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/1/atlanta-falcons-head-coach-history",
        "note": "2007シーズンの正式HC記録",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Jacksonville Jaguars",
        "years": "2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/7/jacksonville-jaguars-offensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2001,
    "lastYear": 2007,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-bobby-ross",
    "name": "Bobby Ross",
    "records": [
      {
        "role": "HC",
        "team": "Detroit Lions",
        "years": "1997–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/1/detroit-lions-head-coach-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "San Diego Chargers",
        "years": "1992–1996",
        "sourceUrl": "https://www.chargers.com/team/history/coaching-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1992,
    "lastYear": 2000,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-bobby-slowik",
    "name": "Bobby Slowik",
    "records": [
      {
        "role": "OC",
        "team": "Houston Texans",
        "years": "2023–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/7/houston-texans-offensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "2026–2026",
        "sourceUrl": "https://www.miamidolphins.com/team/coaches-roster/",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2023,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-brad-childress",
    "name": "Brad Childress",
    "records": [
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Kansas City Chiefs",
        "years": "2016",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "年別原典ではCo-Offensive Coordinator表記。単独OCではなく共同コーディネーター扱いの可能性があるため要確認。",
        "franchise": "Kansas City Chiefs",
        "status": "needs-review"
      },
      {
        "role": "HC",
        "team": "Minnesota Vikings",
        "years": "2006–2010",
        "sourceUrl": "https://www.vikings.com/history/coaching-history",
        "note": "公式史料は2006年就任。2010年途中まで。",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "2002–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "同原典は2002–2005と記載する一方、Marty Mornhinwegも2004年を含むため、2004–2005の正式な単独・共同肩書は要確認。",
        "franchise": "Philadelphia Eagles",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2002,
    "lastYear": 2016,
    "sourceCount": 4,
    "verification": "partial"
  },
  {
    "id": "registry-brad-idzik",
    "name": "Brad Idzik",
    "records": [
      {
        "role": "OC",
        "team": "Carolina Panthers",
        "years": "2024–2026",
        "sourceUrl": "https://www.panthers.com/team/coaches-roster/brad-idzik",
        "note": "2026年は現時点の在任シーズン。",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2024,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-brandon-staley",
    "name": "Brandon Staley",
    "records": [
      {
        "role": "HC",
        "team": "Los Angeles Chargers",
        "years": "2021–2023",
        "sourceUrl": "https://www.chargers.com/team/history/coaching-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Los Angeles Rams",
        "years": "2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "ロサンゼルス時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New Orleans Saints",
        "years": "2025–2026",
        "sourceUrl": "https://www.neworleanssaints.com/team/coaches-roster/",
        "note": "公式現行スタッフページでDC。2026年は調査基準日時点の現任シーズン。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2020,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-brian-angelichio",
    "name": "Brian Angelichio",
    "records": [
      {
        "role": "OC",
        "team": "Pittsburgh Steelers",
        "years": "2026–2026",
        "sourceUrl": "https://www.steelers.com/team/coaches-roster/",
        "note": "公式コーチ名簿で2026年のOCと確認。",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-brian-billick",
    "name": "Brian Billick",
    "records": [
      {
        "role": "HC",
        "team": "Baltimore Ravens",
        "years": "1999–2007",
        "sourceUrl": "https://www.pro-football-reference.com/teams/rav/coaches.htm",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "1994–1998",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1994,
    "lastYear": 2007,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-brian-callahan",
    "name": "Brian Callahan",
    "records": [
      {
        "role": "OC",
        "team": "Cincinnati Bengals",
        "years": "2019–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/7/cincinnati-bengals-offensive-coordinator-history",
        "note": "姓名表記 Brian Callahan。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Tennessee Titans",
        "years": "2024–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/1/tennessee-titans-head-coach-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2019,
    "lastYear": 2025,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-brian-daboll",
    "name": "Brian Daboll",
    "records": [
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "2018–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2009–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Kansas City Chiefs",
        "years": "2012",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "2011–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Giants",
        "years": "2022–2025",
        "sourceUrl": "https://www.pro-football-reference.com/teams/nyg/coaches.htm",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tennessee Titans",
        "years": "2026–2026",
        "sourceUrl": "https://www.tennesseetitans.com/team/coaches-roster/",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2009,
    "lastYear": 2026,
    "sourceCount": 6,
    "verification": "source-linked"
  },
  {
    "id": "registry-brian-duker",
    "name": "Brian Duker",
    "records": [
      {
        "role": "DC",
        "team": "New York Jets",
        "years": "2026",
        "sourceUrl": "https://www.pro-football-reference.com/teams/nyj/2026_draft.htm",
        "note": "2026年PFR年次コーチ欄で確認。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-brian-fleury",
    "name": "Brian Fleury",
    "records": [
      {
        "role": "OC",
        "team": "Seattle Seahawks",
        "years": "2026–2026",
        "sourceUrl": "https://www.seahawks.com/team/coaches-roster/",
        "note": "公式現行スタッフページでOffensive Coordinator。",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-brian-flores",
    "name": "Brian Flores",
    "records": [
      {
        "role": "HC",
        "team": "Miami Dolphins",
        "years": "2019–2021",
        "sourceUrl": "https://www.miamidolphins.com/news/brian-flores-staff-comes-into-focus-miami-dolphins",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Minnesota Vikings",
        "years": "2023–2026",
        "sourceUrl": "https://www.vikings.com/team/coaches-roster/",
        "note": "公式スタッフ表および2026年トレーニングキャンプ掲載で現職を確認。",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2019,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-brian-johnson",
    "name": "Brian Johnson",
    "records": [
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "2023–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2023,
    "lastYear": 2023,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-brian-schottenheimer",
    "name": "Brian Schottenheimer",
    "records": [
      {
        "role": "HC",
        "team": "Dallas Cowboys",
        "years": "2025–2026",
        "sourceUrl": "https://www.dallascowboys.com/news/rank-em-head-coaches-in-cowboys-history",
        "note": "公式記事は2025年就任を確認。",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Dallas Cowboys",
        "years": "2023–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/7/dallas-cowboys-offensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "St. Louis Rams",
        "years": "2012–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "2006–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "OC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Seattle Seahawks",
        "years": "2018–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/7/seattle-seahawks-offensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2006,
    "lastYear": 2026,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-brian-stewart",
    "name": "Brian Stewart",
    "records": [
      {
        "role": "DC",
        "team": "Dallas Cowboys",
        "years": "2007–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/8/dallas-cowboys-defensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2007,
    "lastYear": 2008,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-brian-van-gorder",
    "name": "Brian Van Gorder",
    "records": [
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "2008–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "Brian Van Gorder等の別表記と統合可能",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2008,
    "lastYear": 2011,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-bruce-arians",
    "name": "Bruce Arians",
    "records": [
      {
        "role": "HC",
        "team": "Arizona Cardinals",
        "years": "2013–2017",
        "sourceUrl": "https://www.azcardinals.com/news/as-cardinals-coaching-search-continues-a-look-at-past-timelines",
        "note": "公式歴代HC記事で確認。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2001–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Indianapolis Colts",
        "years": "2012",
        "sourceUrl": "https://pro-football-history.com/franchise/31/indianapolis-colts-coaches",
        "note": "Chuck Pagano療養中の代理HC。",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Indianapolis Colts",
        "years": "2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/7/indianapolis-colts-offensive-coordinator-history",
        "note": "2012年の肩書は攻撃コーディネーター兼代理HCとして記録。",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Pittsburgh Steelers",
        "years": "2007–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/7/pittsburgh-steelers-offensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Tampa Bay Buccaneers",
        "years": "2019–2021",
        "sourceUrl": "https://www.buccaneers.com/team/coaches-roster/bruce-arians",
        "note": "公式ページは2019年就任を明記。",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2001,
    "lastYear": 2021,
    "sourceCount": 6,
    "verification": "source-linked"
  },
  {
    "id": "registry-bruce-coslet",
    "name": "Bruce Coslet",
    "records": [
      {
        "role": "HC",
        "team": "Cincinnati Bengals",
        "years": "1996–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/1/cincinnati-bengals-head-coach-history",
        "note": "1996年シーズン途中にDavid Shulaを交代。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cincinnati Bengals",
        "years": "1994–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/7/cincinnati-bengals-offensive-coordinator-history",
        "note": "公式記事では1996年シーズン途中にCosletがHCへ移り、Ken AndersonをOCに据えたと説明。したがって1996年は部分在任で、一覧年とシーズン全体の表記に注意。",
        "franchise": "Cincinnati Bengals",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Dallas Cowboys",
        "years": "2002–2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/7/dallas-cowboys-offensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Jets",
        "years": "1990–1993",
        "sourceUrl": "https://www.newyorkjets.com/history/coaching-history/",
        "note": "フランチャイズ公式HC歴。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 2002,
    "sourceCount": 4,
    "verification": "partial"
  },
  {
    "id": "registry-bud-carson",
    "name": "Bud Carson",
    "records": [
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "1990",
        "sourceUrl": "https://www.clevelandbrowns.com/team/history/head-coaches",
        "note": "1990年はシーズン途中まで。公式表では1989–1990、Jim Shofnerの1990年代理HCと重複。",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "St. Louis Rams",
        "years": "1997",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "1978–1981と1997の分割在任。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Philadelphia Eagles",
        "years": "1991–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/8/philadelphia-eagles-defensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1997,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-buddy-ryan",
    "name": "Buddy Ryan",
    "records": [
      {
        "role": "HC",
        "team": "Arizona Cardinals",
        "years": "1994–1995",
        "sourceUrl": "https://www.azcardinals.com/news/as-cardinals-coaching-search-continues-a-look-at-past-timelines",
        "note": "公式記事の歴代HC列挙およびPFR年次記録で確認。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Philadelphia Eagles",
        "years": "1990–1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/1/philadelphia-eagles-head-coach-history",
        "note": "在任は1986–1990。1990年シーズンを対象範囲に含めた。",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Houston Oilers",
        "years": "1993–1993",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/8/tennessee-titans-defensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1995,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-butch-davis",
    "name": "Butch Davis",
    "records": [
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "2001–2004",
        "sourceUrl": "https://www.clevelandbrowns.com/team/history/head-coaches",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Dallas Cowboys",
        "years": "1993–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/8/dallas-cowboys-defensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1993,
    "lastYear": 2004,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-byron-leftwich",
    "name": "Byron Leftwich",
    "records": [
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "2019–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/7/tampa-bay-buccaneers-offensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2019,
    "lastYear": 2022,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-cam-cameron",
    "name": "Cam Cameron",
    "records": [
      {
        "role": "OC",
        "team": "Baltimore Ravens",
        "years": "2008–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/7/baltimore-ravens-offensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Diego Chargers",
        "years": "2002–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Miami Dolphins",
        "years": "2007–2007",
        "sourceUrl": "https://www.pro-football-reference.com/teams/mia/coaches.htm",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2002,
    "lastYear": 2012,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-carl-smith",
    "name": "Carl Smith",
    "records": [
      {
        "role": "OC",
        "team": "Jacksonville Jaguars",
        "years": "2005–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/7/jacksonville-jaguars-offensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New Orleans Saints",
        "years": "1990–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/7/new-orleans-saints-offensive-coordinator-history",
        "note": "同データベースは1986–1996。1996年途中のHC交代後もOC在任年として掲載。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 2006,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-chad-oshea",
    "name": "Chad O'Shea",
    "records": [
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "2019–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2019,
    "lastYear": 2019,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-chan-gailey",
    "name": "Chan Gailey",
    "records": [
      {
        "role": "HC",
        "team": "Buffalo Bills",
        "years": "2010–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/1/buffalo-bills-head-coach-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Dallas Cowboys",
        "years": "1998–1999",
        "sourceUrl": "https://www.dallascowboys.com/news/rank-em-head-coaches-in-cowboys-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/10/7/denver-broncos-offensive-coordinator-history",
        "note": "1990 Denver media guideでもOffensive Coordinator/WRs表記。",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Kansas City Chiefs",
        "years": "2008",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "2000–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "2020–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history",
        "note": "2000–2001在任歴とは別期間。",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "2015–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "OC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Pittsburgh Steelers",
        "years": "1996–1997",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/7/pittsburgh-steelers-offensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 2020,
    "sourceCount": 7,
    "verification": "source-linked"
  },
  {
    "id": "registry-charlie-bullen",
    "name": "Charlie Bullen",
    "records": [
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "2025–2025",
        "sourceUrl": "https://bigblueinteractive.com/information-pages/new-york-giants-coaching-staff/",
        "note": "2025年終盤のinterim DC。Shane Bowenとの正式な分担期間は要確認。",
        "franchise": "New York Giants",
        "status": "needs-review"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2025,
    "lastYear": 2025,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-charlie-sumner",
    "name": "Charlie Sumner",
    "records": [
      {
        "role": "DC",
        "team": "New England Patriots",
        "years": "1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/8/new-england-patriots-defensive-coordinator-history",
        "note": "1973–1978年の在任記録とは別の1990年復帰。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1990,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-charlie-waters",
    "name": "Charlie Waters",
    "records": [
      {
        "role": "DC",
        "team": "Denver Broncos",
        "years": "1993–1994",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1993,
    "lastYear": 1994,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-charlie-weis",
    "name": "Charlie Weis",
    "records": [
      {
        "role": "OC",
        "team": "Kansas City Chiefs",
        "years": "2010",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New England Patriots",
        "years": "2000–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/7/new-england-patriots-offensive-coordinator-history",
        "note": "役職史では2000–2004年OC。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "1997–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "PFR系年次記録と整合。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1997,
    "lastYear": 2010,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-chick-harris",
    "name": "Chick Harris",
    "records": [
      {
        "role": "OC",
        "team": "Los Angeles Rams",
        "years": "1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "ロサンゼルス時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1994,
    "lastYear": 1994,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-chip-kelly",
    "name": "Chip Kelly",
    "records": [
      {
        "role": "OC",
        "team": "Las Vegas Raiders",
        "years": "2025",
        "sourceUrl": "https://www.raiders.com/photos/pete-carroll-raiders-coaching-staff-2025-nfl-patrick-graham-chip-kelly",
        "note": "2025年シーズン開始時の正式OC。シーズン途中解任。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Philadelphia Eagles",
        "years": "2013–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/1/philadelphia-eagles-head-coach-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "San Francisco 49ers",
        "years": "2016–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/1/san-francisco-49ers-head-coach-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2013,
    "lastYear": 2025,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-chris-foerster",
    "name": "Chris Foerster",
    "records": [
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "2004–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2004,
    "lastYear": 2004,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-chris-oleary",
    "name": "Chris O'Leary",
    "records": [
      {
        "role": "DC",
        "team": "Los Angeles Chargers",
        "years": "2026",
        "sourceUrl": "https://www.chargers.com/news/mike-mcdaniel-chris-oleary-new-coordinator-2026",
        "note": "2026年シーズンの現職。シーズン進行中。",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-chris-palmer",
    "name": "Chris Palmer",
    "records": [
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "1999–2000",
        "sourceUrl": "https://www.clevelandbrowns.com/team/history/head-coaches",
        "note": "1996–1998はフランチャイズ休止後の復帰前で、Cleveland BrownsのNFLシーズン記録なし。",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Houston Texans",
        "years": "2002–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/7/houston-texans-offensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Jacksonville Jaguars",
        "years": "1997–1998",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/7/jacksonville-jaguars-offensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tennessee Titans",
        "years": "2011–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1997,
    "lastYear": 2012,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-chris-shula",
    "name": "Chris Shula",
    "records": [
      {
        "role": "DC",
        "team": "Los Angeles Rams",
        "years": "2024–2026",
        "sourceUrl": "https://www.therams.com/team/coaches-roster/",
        "note": "公式ページは2026年時点で3年目のDCと記載。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2024,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-chris-tabor",
    "name": "Chris Tabor",
    "records": [
      {
        "role": "HC",
        "team": "Carolina Panthers",
        "years": "2023",
        "sourceUrl": "https://pro-football-history.com/franchise/26/carolina-panthers-coaches",
        "note": "2023年の暫定HC。",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2023,
    "lastYear": 2023,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-christian-parker",
    "name": "Christian Parker",
    "records": [
      {
        "role": "DC",
        "team": "Dallas Cowboys",
        "years": "2026–2026",
        "sourceUrl": "https://www.dallascowboys.com/team/coaches-roster/christian-parker",
        "note": "チーム公式は2026年1月22日就任を明記。",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-chuck-bresnahan",
    "name": "Chuck Bresnahan",
    "records": [
      {
        "role": "DC",
        "team": "Cincinnati Bengals",
        "years": "2005–2007",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/8/cincinnati-bengals-defensive-coordinator-history",
        "note": "姓名表記 Chuck Bresnahan。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Oakland Raiders",
        "years": "2000–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/8/las-vegas-raiders-defensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Oakland Raiders",
        "years": "2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/8/las-vegas-raiders-defensive-coordinator-history",
        "note": "再任。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2000,
    "lastYear": 2011,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-chuck-cecil",
    "name": "Chuck Cecil",
    "records": [
      {
        "role": "DC",
        "team": "Tennessee Titans",
        "years": "2009–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/8/tennessee-titans-defensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2009,
    "lastYear": 2010,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-chuck-knox",
    "name": "Chuck Knox",
    "records": [
      {
        "role": "HC",
        "team": "Los Angeles Rams",
        "years": "1992–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/1/los-angeles-rams-head-coach-history",
        "note": "ロサンゼルス時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Seattle Seahawks",
        "years": "1990–1991",
        "sourceUrl": "https://www.seahawks.com/team/coaches-roster/all-time/",
        "note": "公式歴代コーチ一覧では在任1983–1991。1990–1991シーズン部分を収録。",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 1994,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-chuck-noll",
    "name": "Chuck Noll",
    "records": [
      {
        "role": "HC",
        "team": "Pittsburgh Steelers",
        "years": "1990–1991",
        "sourceUrl": "https://www.pro-football-reference.com/teams/pit/coaches.htm",
        "note": "PFRのチーム・コーチ年表に基づく。1991年終了後に退任。",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 1991,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-chuck-pagano",
    "name": "Chuck Pagano",
    "records": [
      {
        "role": "DC",
        "team": "Baltimore Ravens",
        "years": "2011–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/8/baltimore-ravens-defensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Chicago Bears",
        "years": "2019–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/8/chicago-bears-defensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Indianapolis Colts",
        "years": "2012–2017",
        "sourceUrl": "https://pro-football-history.com/franchise/31/indianapolis-colts-coaches",
        "note": "2012年は病気療養中の期間があり、Bruce Ariansが代理HCを担当。",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2011,
    "lastYear": 2020,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-clancy-pendergast",
    "name": "Clancy Pendergast",
    "records": [
      {
        "role": "DC",
        "team": "Arizona Cardinals",
        "years": "2004–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/8/arizona-cardinals-defensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Kansas City Chiefs",
        "years": "2009",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2004,
    "lastYear": 2009,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-clarence-shelmon",
    "name": "Clarence Shelmon",
    "records": [
      {
        "role": "OC",
        "team": "San Diego Chargers",
        "years": "2007–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2007,
    "lastYear": 2011,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-clint-hurtt",
    "name": "Clint Hurtt",
    "records": [
      {
        "role": "DC",
        "team": "Seattle Seahawks",
        "years": "2022–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/8/seattle-seahawks-defensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2022,
    "lastYear": 2023,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-clyde-christensen",
    "name": "Clyde Christensen",
    "records": [
      {
        "role": "OC",
        "team": "Indianapolis Colts",
        "years": "2010–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/7/indianapolis-colts-offensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "2016–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "2001–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/7/tampa-bay-buccaneers-offensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2001,
    "lastYear": 2017,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-cory-undlin",
    "name": "Cory Undlin",
    "records": [
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2020,
    "lastYear": 2020,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-curtis-modkins",
    "name": "Curtis Modkins",
    "records": [
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "2010–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "2016–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/7/san-francisco-49ers-offensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2010,
    "lastYear": 2016,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-dale-lindsey",
    "name": "Dale Lindsey",
    "records": [
      {
        "role": "DC",
        "team": "San Diego Chargers",
        "years": "2002–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/8/los-angeles-chargers-defensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2002,
    "lastYear": 2003,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-dan-campbell",
    "name": "Dan Campbell",
    "records": [
      {
        "role": "HC",
        "team": "Detroit Lions",
        "years": "2021–2026",
        "sourceUrl": "https://www.detroitlions.com/news/lions-announce-2026-coaching-staff",
        "note": "2026公式スタッフ発表でHead Coachを確認。",
        "franchise": "Detroit Lions",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Miami Dolphins",
        "years": "2015–2015",
        "sourceUrl": "https://www.palmbeachpost.com/story/sports/nfl/dolphins/2025/01/17/miami-dolphins-dan-campbell-detroit-lions-nfl-playoffs/77777325007/",
        "note": "Joe Philbin解任後の代理HC。",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2015,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-dan-henning",
    "name": "Dan Henning",
    "records": [
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "1997–1997",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Carolina Panthers",
        "years": "2002–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/7/carolina-panthers-offensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "1992–1993",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "HC",
        "team": "San Diego Chargers",
        "years": "1990–1991",
        "sourceUrl": "https://www.chargers.com/team/history/coaching-history",
        "note": "公式歴史ページでは1989–1991。1990–91が対象範囲。",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "2008–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "OC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 2010,
    "sourceCount": 6,
    "verification": "partial"
  },
  {
    "id": "registry-dan-pitcher",
    "name": "Dan Pitcher",
    "records": [
      {
        "role": "OC",
        "team": "Cincinnati Bengals",
        "years": "2024–2026",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/7/cincinnati-bengals-offensive-coordinator-history",
        "note": "2026年公式スタッフ一覧でもOC。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2024,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-dan-quinn",
    "name": "Dan Quinn",
    "records": [
      {
        "role": "HC",
        "team": "Atlanta Falcons",
        "years": "2015–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/1/atlanta-falcons-head-coach-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Dallas Cowboys",
        "years": "2021–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/8/dallas-cowboys-defensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Seattle Seahawks",
        "years": "2013–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/8/seattle-seahawks-defensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Washington Commanders",
        "years": "2024–2026",
        "sourceUrl": "https://pro-football-history.com/franchise/40/washington-commanders-coaches",
        "note": "2026年は当該ページの現行シーズン表示に基づくため、シーズン終了後の確定記録としては要確認。",
        "franchise": "Washington Commanders",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2013,
    "lastYear": 2026,
    "sourceCount": 4,
    "verification": "partial"
  },
  {
    "id": "registry-dan-reeves",
    "name": "Dan Reeves",
    "records": [
      {
        "role": "HC",
        "team": "Atlanta Falcons",
        "years": "1997–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/1/atlanta-falcons-head-coach-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Denver Broncos",
        "years": "1990–1992",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "1992年シーズン終了まで在任。",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Giants",
        "years": "1993–1996",
        "sourceUrl": "https://www.pro-football-reference.com/teams/nyg/coaches.htm",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 2003,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-dana-bible",
    "name": "Dana Bible",
    "records": [
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "1998–1998",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1998,
    "lastYear": 1998,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-danny-abramowicz",
    "name": "Danny Abramowicz",
    "records": [
      {
        "role": "OC",
        "team": "New Orleans Saints",
        "years": "1997–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/7/new-orleans-saints-offensive-coordinator-history",
        "note": "同データベースの表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1997,
    "lastYear": 1999,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-daronte-jones",
    "name": "Daronte Jones",
    "records": [
      {
        "role": "DC",
        "team": "Washington Commanders",
        "years": "2026–2026",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history",
        "note": "2026年現行シーズン表示に基づくため、シーズン終了後の確定記録としては要確認。",
        "franchise": "Washington Commanders",
        "status": "needs-review"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-darrell-bevell",
    "name": "Darrell Bevell",
    "records": [
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "2019–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "HC",
        "team": "Jacksonville Jaguars",
        "years": "2021",
        "sourceUrl": "https://www.jaguars.com/news/k000151-official-jaguars-name-liam-coen-head-coach",
        "note": "Urban Meyer解任後、2021年最終4試合のinterim HC。",
        "franchise": "Jacksonville Jaguars",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Jacksonville Jaguars",
        "years": "2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/7/jacksonville-jaguars-offensive-coordinator-history",
        "note": "同シーズン後半にinterim HCを兼務。",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "2006–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Seattle Seahawks",
        "years": "2011–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/7/seattle-seahawks-offensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2006,
    "lastYear": 2021,
    "sourceCount": 5,
    "verification": "partial"
  },
  {
    "id": "registry-darren-rizzi",
    "name": "Darren Rizzi",
    "records": [
      {
        "role": "HC",
        "team": "New Orleans Saints",
        "years": "2024",
        "sourceUrl": "https://www.neworleanssaints.com/team/history/head-coaches",
        "note": "公式歴史ページが2024年の暫定在任として掲載。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2024,
    "lastYear": 2024,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-dave-adolph",
    "name": "Dave Adolph",
    "records": [
      {
        "role": "DC",
        "team": "Kansas City Chiefs",
        "years": "1992–1994",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Diego Chargers",
        "years": "1995–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/8/los-angeles-chargers-defensive-coordinator-history",
        "note": "役職史では1985年にも在任。",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1992,
    "lastYear": 1996,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-dave-atkins",
    "name": "Dave Atkins",
    "records": [
      {
        "role": "OC",
        "team": "Arizona Cardinals",
        "years": "1994–1995",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/7/arizona-cardinals-offensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1994,
    "lastYear": 1995,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-dave-brazil",
    "name": "Dave Brazil",
    "records": [
      {
        "role": "DC",
        "team": "Pittsburgh Steelers",
        "years": "1990–1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/8/pittsburgh-steelers-defensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1991,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-dave-campo",
    "name": "Dave Campo",
    "records": [
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2003–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Dallas Cowboys",
        "years": "2000–2002",
        "sourceUrl": "https://www.dallascowboys.com/news/rank-em-head-coaches-in-cowboys-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Dallas Cowboys",
        "years": "1995–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/8/dallas-cowboys-defensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1995,
    "lastYear": 2004,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-dave-canales",
    "name": "Dave Canales",
    "records": [
      {
        "role": "HC",
        "team": "Carolina Panthers",
        "years": "2024–2026",
        "sourceUrl": "https://www.panthers.com/team/coaches-roster/dave-canales",
        "note": "2026年は現時点の在任シーズン。",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "2023–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/7/tampa-bay-buccaneers-offensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2023,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-dave-levy",
    "name": "Dave Levy",
    "records": [
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "1991年と1994年の非連続在任。",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "1991年と1994年の非連続在任。",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1991,
    "lastYear": 1994,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-dave-mcginnis",
    "name": "Dave McGinnis",
    "records": [
      {
        "role": "HC",
        "team": "Arizona Cardinals",
        "years": "2000–2003",
        "sourceUrl": "https://www.azcardinals.com/news/as-cardinals-coaching-search-continues-a-look-at-past-timelines",
        "note": "公式記事は2000年途中の暫定就任と、残り2試合を経た正式昇格を明記。2000年は代理・正式の境界がある。",
        "franchise": "Arizona Cardinals",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Arizona Cardinals",
        "years": "1996–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/8/arizona-cardinals-defensive-coordinator-history",
        "note": "2000年途中の暫定HC就任との兼務・終了時点は要確認。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1996,
    "lastYear": 2003,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-dave-ragone",
    "name": "Dave Ragone",
    "records": [
      {
        "role": "OC",
        "team": "Atlanta Falcons",
        "years": "2021–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/7/atlanta-falcons-offensive-coordinator-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2021,
    "lastYear": 2023,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-dave-wannstedt",
    "name": "Dave Wannstedt",
    "records": [
      {
        "role": "DC",
        "team": "Buffalo Bills",
        "years": "2012–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/8/buffalo-bills-defensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Chicago Bears",
        "years": "1993–1998",
        "sourceUrl": "https://www.pro-football-reference.com/teams/chi/coaches.htm",
        "note": "姓名の別表記Wannestedt等とは統合せず、正式表記Wannstedtを採用。",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Dallas Cowboys",
        "years": "1990–1992",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/8/dallas-cowboys-defensive-coordinator-history",
        "note": "同ページは在任を1989–1992と記載。本調査対象部分は1990–1992。",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Miami Dolphins",
        "years": "2000–2004",
        "sourceUrl": "https://www.pro-football-reference.com/teams/mia/coaches.htm",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 2012,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-david-blough",
    "name": "David Blough",
    "records": [
      {
        "role": "OC",
        "team": "Washington Commanders",
        "years": "2026–2026",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history",
        "note": "2026年現行シーズン表示に基づくため、シーズン終了後の確定記録としては要確認。",
        "franchise": "Washington Commanders",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-david-culley",
    "name": "David Culley",
    "records": [
      {
        "role": "HC",
        "team": "Houston Texans",
        "years": "2021–2021",
        "sourceUrl": "https://www.pro-football-reference.com/teams/htx/coaches.htm",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2021,
    "lastYear": 2021,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-david-shula",
    "name": "David Shula",
    "records": [
      {
        "role": "HC",
        "team": "Cincinnati Bengals",
        "years": "1992–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/1/cincinnati-bengals-head-coach-history",
        "note": "1992年にSam Wycheから交代。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Dallas Cowboys",
        "years": "1990–1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/7/dallas-cowboys-offensive-coordinator-history",
        "note": "同ページは在任を1989–1990と記載。本調査対象部分は1990年。姓の表記はDavid Shula／Dave Shulaの揺れに注意。",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1996,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-davis-webb",
    "name": "Davis Webb",
    "records": [
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "2026",
        "sourceUrl": "https://www.denverbroncos.com/team/coaches-roster/",
        "note": "2026年の公式スタッフページ掲載を根拠とするが、シーズン開始時点の肩書・在任期間は要確認。",
        "franchise": "Denver Broncos",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-dean-pees",
    "name": "Dean Pees",
    "records": [
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "2021–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Baltimore Ravens",
        "years": "2012–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/8/baltimore-ravens-defensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New England Patriots",
        "years": "2006–2009",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/8/new-england-patriots-defensive-coordinator-history",
        "note": "役職史では2006–2009年DC。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Tennessee Titans",
        "years": "2018–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/8/tennessee-titans-defensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2006,
    "lastYear": 2022,
    "sourceCount": 4,
    "verification": "partial"
  },
  {
    "id": "registry-declan-doyle",
    "name": "Declan Doyle",
    "records": [
      {
        "role": "OC",
        "team": "Baltimore Ravens",
        "years": "2026–2026",
        "sourceUrl": "https://www.baltimoreravens.com/team/coaches-roster/",
        "note": "2026年シーズンの現職。シーズンは調査時点で進行前・未完了。",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "2025–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/7/chicago-bears-offensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2025,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-demarcus-covington",
    "name": "DeMarcus Covington",
    "records": [
      {
        "role": "DC",
        "team": "New England Patriots",
        "years": "2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/8/new-england-patriots-defensive-coordinator-history",
        "note": "役職史では2024年DC。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2024,
    "lastYear": 2024,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-demeco-ryans",
    "name": "DeMeco Ryans",
    "records": [
      {
        "role": "HC",
        "team": "Houston Texans",
        "years": "2023–2026",
        "sourceUrl": "https://www.houstontexans.com/team/coaches-roster/",
        "note": "2026年は現職・シーズン進行前の記録。",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "2021–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/8/san-francisco-49ers-defensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2021,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-dennard-wilson",
    "name": "Dennard Wilson",
    "records": [
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "2026–2026",
        "sourceUrl": "https://www.giants.com/news/john-harbaugh-announces-2026-coaching-staff-coordinators-matt-nagy-dennard-wilson-chris-horton",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tennessee Titans",
        "years": "2024–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/8/tennessee-titans-defensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2024,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-dennis-allen",
    "name": "Dennis Allen",
    "records": [
      {
        "role": "DC",
        "team": "Chicago Bears",
        "years": "2025–2026",
        "sourceUrl": "https://www.chicagobears.com/team/coaches/",
        "note": "公式サイトの現行スタッフ掲載。2026年はシーズン完了後確定記録ではない。",
        "franchise": "Chicago Bears",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Denver Broncos",
        "years": "2011",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Oakland Raiders",
        "years": "2012–2014",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New Orleans Saints",
        "years": "2022–2024",
        "sourceUrl": "https://www.neworleanssaints.com/team/history/head-coaches",
        "note": "公式歴史ページの表記。2024年途中まで。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New Orleans Saints",
        "years": "2016–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/8/new-orleans-saints-defensive-coordinator-history",
        "note": "同データベースの表記。後年のHC在任とは別役職。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2011,
    "lastYear": 2026,
    "sourceCount": 5,
    "verification": "partial"
  },
  {
    "id": "registry-dennis-erickson",
    "name": "Dennis Erickson",
    "records": [
      {
        "role": "HC",
        "team": "San Francisco 49ers",
        "years": "2003–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/1/san-francisco-49ers-head-coach-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Seattle Seahawks",
        "years": "1995–1998",
        "sourceUrl": "https://www.seahawks.com/team/coaches-roster/all-time/",
        "note": "公式歴代コーチ一覧では在任1995–1998。",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1995,
    "lastYear": 2004,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-dennis-green",
    "name": "Dennis Green",
    "records": [
      {
        "role": "HC",
        "team": "Arizona Cardinals",
        "years": "2004–2006",
        "sourceUrl": "https://www.azcardinals.com/news/as-cardinals-coaching-search-continues-a-look-at-past-timelines",
        "note": "公式歴代HC記事で確認。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Minnesota Vikings",
        "years": "1992–2001",
        "sourceUrl": "https://www.vikings.com/history/coaching-history",
        "note": "公式史料は1992年就任、10シーズンと記載。",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1992,
    "lastYear": 2006,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-dennis-thurman",
    "name": "Dennis Thurman",
    "records": [
      {
        "role": "DC",
        "team": "Buffalo Bills",
        "years": "2015–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/8/buffalo-bills-defensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Jets",
        "years": "2013–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/8/new-york-jets-defensive-coordinator-history",
        "note": "DC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2013,
    "lastYear": 2016,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-derrick-ansley",
    "name": "Derrick Ansley",
    "records": [
      {
        "role": "DC",
        "team": "Los Angeles Chargers",
        "years": "2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/8/los-angeles-chargers-defensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2023,
    "lastYear": 2023,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-dick-coury",
    "name": "Dick Coury",
    "records": [
      {
        "role": "OC",
        "team": "New England Patriots",
        "years": "1991–1992",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/7/new-england-patriots-offensive-coordinator-history",
        "note": "役職史では1991–1992年OC。公式チーム資料での正式肩書は要確認。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Houston Oilers",
        "years": "1994–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "1994年の在任形態がKevin Gilbrideとの重複記録となるため要確認。",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1991,
    "lastYear": 1994,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-dick-jamieson",
    "name": "Dick Jamieson",
    "records": [
      {
        "role": "OC",
        "team": "Arizona Cardinals",
        "years": "1997–1997",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/7/arizona-cardinals-offensive-coordinator-history",
        "note": "同サイトは1985年と1997年を併記。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1997,
    "lastYear": 1997,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-dick-jauron",
    "name": "Dick Jauron",
    "records": [
      {
        "role": "HC",
        "team": "Buffalo Bills",
        "years": "2006–2009",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/1/buffalo-bills-head-coach-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Chicago Bears",
        "years": "1999–2003",
        "sourceUrl": "https://www.pro-football-reference.com/teams/chi/coaches.htm",
        "note": "1999年就任、2003年まで。",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2011–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "2004–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Jacksonville Jaguars",
        "years": "1995–1998",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/8/jacksonville-jaguars-defensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1995,
    "lastYear": 2012,
    "sourceCount": 5,
    "verification": "partial"
  },
  {
    "id": "registry-dick-lebeau",
    "name": "Dick LeBeau",
    "records": [
      {
        "role": "HC",
        "team": "Cincinnati Bengals",
        "years": "2001–2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/1/cincinnati-bengals-head-coach-history",
        "note": "姓名表記 Dick LeBeau。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Cincinnati Bengals",
        "years": "1990–1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/8/cincinnati-bengals-defensive-coordinator-history",
        "note": "姓名表記 Dick LeBeau。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Cincinnati Bengals",
        "years": "1997–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/8/cincinnati-bengals-defensive-coordinator-history",
        "note": "1997年に復帰。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Pittsburgh Steelers",
        "years": "1995–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/8/pittsburgh-steelers-defensive-coordinator-history",
        "note": "1995–1996と2004–2014の2期在任。別レコードとして統合せず、同一人物の再任を注記。",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Pittsburgh Steelers",
        "years": "2004–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/8/pittsburgh-steelers-defensive-coordinator-history",
        "note": "1995–1996にも在任した再任者。",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tennessee Titans",
        "years": "2016–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/8/tennessee-titans-defensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 2017,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-dick-macpherson",
    "name": "Dick MacPherson",
    "records": [
      {
        "role": "HC",
        "team": "New England Patriots",
        "years": "1991–1992",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/1/new-england-patriots-head-coach-history",
        "note": "",
        "franchise": "New England Patriots",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1991,
    "lastYear": 1992,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-dick-vermeil",
    "name": "Dick Vermeil",
    "records": [
      {
        "role": "HC",
        "team": "Kansas City Chiefs",
        "years": "2001–2005",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "St. Louis Rams",
        "years": "1997–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/1/los-angeles-rams-head-coach-history",
        "note": "1999年のスーパーボウル優勝シーズンを含む。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1997,
    "lastYear": 2005,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-dirk-koetter",
    "name": "Dirk Koetter",
    "records": [
      {
        "role": "OC",
        "team": "Atlanta Falcons",
        "years": "2012–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/7/atlanta-falcons-offensive-coordinator-history",
        "note": "2019–2020にも再任。別在任期間は別レコードで記載",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Atlanta Falcons",
        "years": "2019–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/7/atlanta-falcons-offensive-coordinator-history",
        "note": "2012–2014にも在任。再任期間",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Jacksonville Jaguars",
        "years": "2007–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/7/jacksonville-jaguars-offensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Tampa Bay Buccaneers",
        "years": "2016–2018",
        "sourceUrl": "https://pro-football-history.com/franchise/25/tampa-bay-buccaneers-coaches",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "2015–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/7/tampa-bay-buccaneers-offensive-coordinator-history",
        "note": "2016年にHCへ昇格。",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2007,
    "lastYear": 2020,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-dom-capers",
    "name": "Dom Capers",
    "records": [
      {
        "role": "HC",
        "team": "Carolina Panthers",
        "years": "1995–1998",
        "sourceUrl": "https://pro-football-history.com/franchise/26/carolina-panthers-coaches",
        "note": "フランチャイズ初代HC。1990–1994はチーム未発足。",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Green Bay Packers",
        "years": "2009–2017",
        "sourceUrl": "https://www.jsonline.com/story/sports/nfl/packers/2024/01/26/here-are-all-of-the-green-bay-packers-defensive-coordinators-in-history/72351007007/",
        "note": "主要報道の歴代DC一覧で2009–17年。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Houston Texans",
        "years": "2002–2005",
        "sourceUrl": "https://www.pro-football-reference.com/teams/htx/coaches.htm",
        "note": "フランチャイズ初代HC。1990–2001年はHouston TexansとしてのNFLシーズンなし。",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Jacksonville Jaguars",
        "years": "1999–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/8/jacksonville-jaguars-defensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Miami Dolphins",
        "years": "2007–2007",
        "sourceUrl": "https://www.pro-football-reference.com/teams/mia/2007.htm",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Pittsburgh Steelers",
        "years": "1992–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/8/pittsburgh-steelers-defensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1992,
    "lastYear": 2017,
    "sourceCount": 6,
    "verification": "source-linked"
  },
  {
    "id": "registry-don-blackmon",
    "name": "Don Blackmon",
    "records": [
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "2001–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "当該原典では2001年単年",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2001,
    "lastYear": 2001,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-don-breaux",
    "name": "Don Breaux",
    "records": [
      {
        "role": "OC",
        "team": "Washington Redskins",
        "years": "2004–2007",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2004,
    "lastYear": 2007,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-don-shula",
    "name": "Don Shula",
    "records": [
      {
        "role": "HC",
        "team": "Miami Dolphins",
        "years": "1990–1995",
        "sourceUrl": "https://www.pro-football-reference.com/teams/mia/coaches.htm",
        "note": "1990–1995のヘッドコーチ。",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 1995,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-donnie-henderson",
    "name": "Donnie Henderson",
    "records": [
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "New York Jets",
        "years": "2004–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/8/new-york-jets-defensive-coordinator-history",
        "note": "DC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2004,
    "lastYear": 2006,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-doug-marrone",
    "name": "Doug Marrone",
    "records": [
      {
        "role": "HC",
        "team": "Buffalo Bills",
        "years": "2013–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/1/buffalo-bills-head-coach-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Jacksonville Jaguars",
        "years": "2016",
        "sourceUrl": "https://www.jaguars.com/news/k000151-official-jaguars-name-liam-coen-head-coach",
        "note": "2016年シーズン最終2試合のinterim HC。正式HC期間は2017–2020。",
        "franchise": "Jacksonville Jaguars",
        "status": "needs-review"
      },
      {
        "role": "HC",
        "team": "Jacksonville Jaguars",
        "years": "2017–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/1/jacksonville-jaguars-head-coach-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New Orleans Saints",
        "years": "2006–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/7/new-orleans-saints-offensive-coordinator-history",
        "note": "同データベースの表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2006,
    "lastYear": 2020,
    "sourceCount": 4,
    "verification": "partial"
  },
  {
    "id": "registry-doug-nussmeier",
    "name": "Doug Nussmeier",
    "records": [
      {
        "role": "OC",
        "team": "New Orleans Saints",
        "years": "2025–2026",
        "sourceUrl": "https://www.neworleanssaints.com/team/coaches-roster/",
        "note": "公式現行スタッフページでOC。2026年は調査基準日時点の現任シーズン。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2025,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-doug-pederson",
    "name": "Doug Pederson",
    "records": [
      {
        "role": "HC",
        "team": "Jacksonville Jaguars",
        "years": "2022–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/1/jacksonville-jaguars-head-coach-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Kansas City Chiefs",
        "years": "2013–2015",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Philadelphia Eagles",
        "years": "2016–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/1/philadelphia-eagles-head-coach-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2013,
    "lastYear": 2024,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-dowell-loggains",
    "name": "Dowell Loggains",
    "records": [
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "2016–2017",
        "sourceUrl": "https://www.nbcchicago.com/news/sports/nfl/chicago-bears/heres-a-record-of-the-bears-offensive-coordinators-since-2000/3323341/",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "2018–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "2019–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "OC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tennessee Titans",
        "years": "2013–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2013,
    "lastYear": 2020,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-drew-petzing",
    "name": "Drew Petzing",
    "records": [
      {
        "role": "OC",
        "team": "Arizona Cardinals",
        "years": "2023–2025",
        "sourceUrl": "https://www.detroitlions.com/news/lions-hire-drew-petzing-as-offensive-coordinator",
        "note": "公式NFLチーム発表が前職として2023–2025を明記。2019–2022は正式OC記録を確認できず。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "2026",
        "sourceUrl": "https://www.detroitlions.com/news/lions-announce-2026-coaching-staff",
        "note": "2026公式スタッフ発表でOffensive Coordinatorを確認。",
        "franchise": "Detroit Lions",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2023,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-ed-donatell",
    "name": "Ed Donatell",
    "records": [
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "2004–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Denver Broncos",
        "years": "2019–2020",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "2020年の実際のプレーコール権限と公式DC肩書の確認が必要。",
        "franchise": "Denver Broncos",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Green Bay Packers",
        "years": "2000–2003",
        "sourceUrl": "https://www.pro-football-history.com/franchpos/43/8/green-bay-packers-defensive-coordinator-history",
        "note": "主要コーチ履歴で確認。公式歴代ページでの完全な年次行は要再確認。",
        "franchise": "Green Bay Packers",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Minnesota Vikings",
        "years": "2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/8/minnesota-vikings-defensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2000,
    "lastYear": 2022,
    "sourceCount": 4,
    "verification": "partial"
  },
  {
    "id": "registry-edgar-bennett",
    "name": "Edgar Bennett",
    "records": [
      {
        "role": "OC",
        "team": "Green Bay Packers",
        "years": "2015–2017",
        "sourceUrl": "https://gb.packers.com/coaches",
        "note": "Packers公式歴代コーチ一覧でOffensive Coordinator, 2015–17。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2015,
    "lastYear": 2017,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-ejiro-evero",
    "name": "Ejiro Evero",
    "records": [
      {
        "role": "DC",
        "team": "Carolina Panthers",
        "years": "2023–2026",
        "sourceUrl": "https://www.panthers.com/team/coaches-roster/ejiro-evero",
        "note": "2026年は現時点の在任シーズン。",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Denver Broncos",
        "years": "2022",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2022,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-emmitt-thomas",
    "name": "Emmitt Thomas",
    "records": [
      {
        "role": "DC",
        "team": "Green Bay Packers",
        "years": "1999–1999",
        "sourceUrl": "https://www.jsonline.com/story/sports/nfl/packers/2024/01/26/here-are-all-of-the-green-bay-packers-defensive-coordinators-in-history/72351007007/",
        "note": "主要報道の歴代DC一覧で1999年。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Minnesota Vikings",
        "years": "2000–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/8/minnesota-vikings-defensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Philadelphia Eagles",
        "years": "1995–1998",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/8/philadelphia-eagles-defensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Washington Redskins",
        "years": "1993–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1993,
    "lastYear": 2001,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-eric-bieniemy",
    "name": "Eric Bieniemy",
    "records": [
      {
        "role": "OC",
        "team": "Kansas City Chiefs",
        "years": "2018–2022",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Kansas City Chiefs",
        "years": "2026",
        "sourceUrl": "https://www.chiefs.com/team/coaches-roster/",
        "note": "2026公式現行ページ掲載。ただし2026シーズンは進行中であり、シーズン完了後の年別記録と再照合が必要。",
        "franchise": "Kansas City Chiefs",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Washington Commanders",
        "years": "2023–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history",
        "note": "Assistant Head Coach兼任。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2018,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-eric-mangini",
    "name": "Eric Mangini",
    "records": [
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "2009–2010",
        "sourceUrl": "https://www.clevelandbrowns.com/team/history/head-coaches",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New England Patriots",
        "years": "2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/8/new-england-patriots-defensive-coordinator-history",
        "note": "役職史では2005年DC。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      },
      {
        "role": "HC",
        "team": "New York Jets",
        "years": "2006–2008",
        "sourceUrl": "https://www.newyorkjets.com/history/coaching-history/",
        "note": "フランチャイズ公式HC歴。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "2015–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/8/san-francisco-49ers-defensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2005,
    "lastYear": 2015,
    "sourceCount": 4,
    "verification": "partial"
  },
  {
    "id": "registry-eric-studesville",
    "name": "Eric Studesville",
    "records": [
      {
        "role": "HC",
        "team": "Denver Broncos",
        "years": "2010",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "McDaniels解任後の暫定HC。公式のシーズン表記と在任期間の境界を要確認。",
        "franchise": "Denver Broncos",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2010,
    "lastYear": 2010,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-eric-washington",
    "name": "Eric Washington",
    "records": [
      {
        "role": "DC",
        "team": "Carolina Panthers",
        "years": "2018–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/8/carolina-panthers-defensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Chicago Bears",
        "years": "2024–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/8/chicago-bears-defensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2018,
    "lastYear": 2024,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-ernie-zampese",
    "name": "Ernie Zampese",
    "records": [
      {
        "role": "OC",
        "team": "Dallas Cowboys",
        "years": "1994–1997",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/7/dallas-cowboys-offensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Los Angeles Rams",
        "years": "1990–1993",
        "sourceUrl": "https://www.pro-football-reference.com/teams/ram/1991/gamelog",
        "note": "PFRの1991年チーム年別ページでOC表記。1987–93の継続記録。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New England Patriots",
        "years": "1998–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/7/new-england-patriots-offensive-coordinator-history",
        "note": "役職史では1998–1999年OC。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1999,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-floyd-peters",
    "name": "Floyd Peters",
    "records": [
      {
        "role": "DC",
        "team": "Minnesota Vikings",
        "years": "1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/8/minnesota-vikings-defensive-coordinator-history",
        "note": "同資料は1986–1990のDCと記載。",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tampa Bay Buccaneers",
        "years": "1991–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/8/tampa-bay-buccaneers-defensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1994,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-foge-fazio",
    "name": "Foge Fazio",
    "records": [
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2001–2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Minnesota Vikings",
        "years": "1996–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/8/minnesota-vikings-defensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1996,
    "lastYear": 2002,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-frank-bush",
    "name": "Frank Bush",
    "records": [
      {
        "role": "DC",
        "team": "Houston Texans",
        "years": "2009–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/8/houston-texans-defensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2009,
    "lastYear": 2010,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-frank-cignetti-jr",
    "name": "Frank Cignetti Jr.",
    "records": [
      {
        "role": "OC",
        "team": "St. Louis Rams",
        "years": "2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "同ページは2015年OCとするが、2015年終盤のRob Boras昇格との期間分割が必要。",
        "franchise": "Los Angeles Rams",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2015,
    "lastYear": 2015,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-frank-reich",
    "name": "Frank Reich",
    "records": [
      {
        "role": "HC",
        "team": "Carolina Panthers",
        "years": "2023",
        "sourceUrl": "https://pro-football-history.com/franchise/26/carolina-panthers-coaches",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Indianapolis Colts",
        "years": "2018–2022",
        "sourceUrl": "https://www.footballdb.com/teams/nfl/indianapolis-colts/coaches-by-season",
        "note": "2022年途中まで。",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Diego Chargers",
        "years": "2014–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "2026",
        "sourceUrl": "https://www.pro-football-reference.com/teams/nyj/2026_draft.htm",
        "note": "2026年PFR年次コーチ欄で確認。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "2016–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2014,
    "lastYear": 2026,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-frank-smith",
    "name": "Frank Smith",
    "records": [
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "2022–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2022,
    "lastYear": 2025,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-fred-bruney",
    "name": "Fred Bruney",
    "records": [
      {
        "role": "DC",
        "team": "Tampa Bay Buccaneers",
        "years": "1990–1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/8/tampa-bay-buccaneers-defensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1990,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-fred-pagac",
    "name": "Fred Pagac",
    "records": [
      {
        "role": "DC",
        "team": "Minnesota Vikings",
        "years": "2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/8/minnesota-vikings-defensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2011,
    "lastYear": 2011,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-freddie-kitchens",
    "name": "Freddie Kitchens",
    "records": [
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "2019",
        "sourceUrl": "https://www.clevelandbrowns.com/team/history/head-coaches",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2019,
    "lastYear": 2019,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-fritz-shurmur",
    "name": "Fritz Shurmur",
    "records": [
      {
        "role": "DC",
        "team": "Phoenix Cardinals",
        "years": "1991–1993",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/8/arizona-cardinals-defensive-coordinator-history",
        "note": "フランチャイズ移転前名称。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Green Bay Packers",
        "years": "1992–1998",
        "sourceUrl": "https://www.pro-football-history.com/franchpos/43/8/green-bay-packers-defensive-coordinator-history",
        "note": "在任期間は主要コーチ履歴で確認されるが、Packers公式歴代一覧の検索表示では該当行を完全取得できず、公式原典での再確認要。",
        "franchise": "Green Bay Packers",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Los Angeles Rams",
        "years": "1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "1984–1990の継続記録のうち対象範囲。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Seattle Seahawks",
        "years": "1999–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/8/seattle-seahawks-defensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1999,
    "sourceCount": 4,
    "verification": "partial"
  },
  {
    "id": "registry-gary-crowton",
    "name": "Gary Crowton",
    "records": [
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "1999–2000",
        "sourceUrl": "https://www.nbcchicago.com/news/sports/nfl/chicago-bears/heres-a-record-of-the-bears-offensive-coordinators-since-2000/3323341/",
        "note": "NBC Chicagoは1999–2000と記載。",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1999,
    "lastYear": 2000,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-gary-gibbs",
    "name": "Gary Gibbs",
    "records": [
      {
        "role": "DC",
        "team": "New Orleans Saints",
        "years": "2006–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/8/new-orleans-saints-defensive-coordinator-history",
        "note": "同データベースの表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2006,
    "lastYear": 2008,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-gary-kubiak",
    "name": "Gary Kubiak",
    "records": [
      {
        "role": "OC",
        "team": "Baltimore Ravens",
        "years": "2014–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/7/baltimore-ravens-offensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Denver Broncos",
        "years": "2015–2016",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "1995–2005年にはDenverのOC。",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "1995–2005",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/2003.htm",
        "note": "1995–2002年はOC兼QB coach、2003–2005年はOC。",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Houston Texans",
        "years": "2006–2013",
        "sourceUrl": "https://www.pro-football-reference.com/teams/htx/coaches.htm",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1995,
    "lastYear": 2020,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-gary-moeller",
    "name": "Gary Moeller",
    "records": [
      {
        "role": "DC",
        "team": "Jacksonville Jaguars",
        "years": "2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/8/jacksonville-jaguars-defensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2001,
    "lastYear": 2001,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-gary-stevens",
    "name": "Gary Stevens",
    "records": [
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "1990–1995",
        "sourceUrl": "https://www.pro-football-reference.com/teams/mia/1990.htm",
        "note": "PFRの1990–1995年ページでOC表記を確認。",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1995,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-geep-chryst",
    "name": "Geep Chryst",
    "records": [
      {
        "role": "OC",
        "team": "San Diego Chargers",
        "years": "1999–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "2015–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/7/san-francisco-49ers-offensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1999,
    "lastYear": 2015,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-george-dyer",
    "name": "George Dyer",
    "records": [
      {
        "role": "DC",
        "team": "Los Angeles Rams",
        "years": "1992–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "ロサンゼルス時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1992,
    "lastYear": 1994,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-george-edwards",
    "name": "George Edwards",
    "records": [
      {
        "role": "DC",
        "team": "Buffalo Bills",
        "years": "2010–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/8/buffalo-bills-defensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Minnesota Vikings",
        "years": "2014–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/8/minnesota-vikings-defensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tampa Bay Buccaneers",
        "years": "2026–2026",
        "sourceUrl": "https://www.pro-football-reference.com/teams/tam/2026.htm",
        "note": "PFRの2026年チームページでDefensive Coordinatorと明記。2022–2025は公式の正式DC記録を確認できず、各種pass/run game coordinator表記のみ。",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Washington Redskins",
        "years": "2003–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2003,
    "lastYear": 2026,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-george-godsey",
    "name": "George Godsey",
    "records": [
      {
        "role": "OC",
        "team": "Houston Texans",
        "years": "2015–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/7/houston-texans-offensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2015,
    "lastYear": 2016,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-george-henshaw",
    "name": "George Henshaw",
    "records": [
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "1992",
        "sourceUrl": "https://pro-football-history.com/franchpos/10/7/denver-broncos-offensive-coordinator-history",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Giants",
        "years": "1993–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/7/new-york-giants-offensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1992,
    "lastYear": 1996,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-george-hill",
    "name": "George Hill",
    "records": [
      {
        "role": "DC",
        "team": "Miami Dolphins",
        "years": "1995–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/8/miami-dolphins-defensive-coordinator-history",
        "note": "同サイトは1995–1999とするが、PFRの1995年ページはTom OlivadottiをDCと記載。1995年は要確認。",
        "franchise": "Miami Dolphins",
        "status": "needs-review"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1995,
    "lastYear": 1999,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-george-oleary",
    "name": "George O'Leary",
    "records": [
      {
        "role": "DC",
        "team": "Minnesota Vikings",
        "years": "2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/8/minnesota-vikings-defensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2003,
    "lastYear": 2003,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-george-sefcik",
    "name": "George Sefcik",
    "records": [
      {
        "role": "OC",
        "team": "Atlanta Falcons",
        "years": "1997–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/7/atlanta-falcons-offensive-coordinator-history",
        "note": "1990–1996は当該原典でOC在任者を確認できず要確認",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1997,
    "lastYear": 2000,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-george-seifert",
    "name": "George Seifert",
    "records": [
      {
        "role": "HC",
        "team": "Carolina Panthers",
        "years": "1999–2001",
        "sourceUrl": "https://pro-football-history.com/franchise/26/carolina-panthers-coaches",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "San Francisco 49ers",
        "years": "1990–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/1/san-francisco-49ers-head-coach-history",
        "note": "1989年就任。1990–1996シーズンを対象範囲として記載。",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 2001,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-giff-smith",
    "name": "Giff Smith",
    "records": [
      {
        "role": "HC",
        "team": "Los Angeles Chargers",
        "years": "2023",
        "sourceUrl": "https://pro-football-history.com/franchise/15/los-angeles-chargers-coaches",
        "note": "2023年途中のInterim Head Coach。正式なシーズンHC在任記録とは別枠で記録。",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2023,
    "lastYear": 2023,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-gil-haskell",
    "name": "Gil Haskell",
    "records": [
      {
        "role": "OC",
        "team": "Carolina Panthers",
        "years": "1998–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/7/carolina-panthers-offensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Seattle Seahawks",
        "years": "2000–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/7/seattle-seahawks-offensive-coordinator-history",
        "note": "長期在任は確認できるが、時期により実務上のプレーコール担当と正式肩書の区別を一次資料で再確認要。",
        "franchise": "Seattle Seahawks",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1998,
    "lastYear": 2008,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-grant-udinski",
    "name": "Grant Udinski",
    "records": [
      {
        "role": "OC",
        "team": "Jacksonville Jaguars",
        "years": "2025–2026",
        "sourceUrl": "https://www.pro-football-reference.com/teams/jax/2026_draft.htm",
        "note": "2026年は現職・シーズン進行中。",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2025,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-greg-blache",
    "name": "Greg Blache",
    "records": [
      {
        "role": "DC",
        "team": "Chicago Bears",
        "years": "1999–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/8/chicago-bears-defensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Washington Redskins",
        "years": "2008–2009",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history",
        "note": "2004–2007年は正式DC記録を確認できず要確認。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1999,
    "lastYear": 2009,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-greg-knapp",
    "name": "Greg Knapp",
    "records": [
      {
        "role": "OC",
        "team": "Atlanta Falcons",
        "years": "2004–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/7/atlanta-falcons-offensive-coordinator-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Oakland Raiders",
        "years": "2007–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Oakland Raiders",
        "years": "2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "2001–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/7/san-francisco-49ers-offensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Seattle Seahawks",
        "years": "2009–2009",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/7/seattle-seahawks-offensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2001,
    "lastYear": 2012,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-greg-landry",
    "name": "Greg Landry",
    "records": [
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "1990–1992",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/7/chicago-bears-offensive-coordinator-history",
        "note": "歴史データベースは1989–1992のOCとするが、1990–1992の正式な同時代肩書をPFR公式年別ページで再確認できないため要確認。",
        "franchise": "Chicago Bears",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1992,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-greg-manusky",
    "name": "Greg Manusky",
    "records": [
      {
        "role": "DC",
        "team": "Indianapolis Colts",
        "years": "2012–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/8/indianapolis-colts-defensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Diego Chargers",
        "years": "2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/8/los-angeles-chargers-defensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "2007–2010",
        "sourceUrl": "https://www.49ers.com/news/every-49ers-defensive-coordinator-since-george-seifert-14857597",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Washington Redskins",
        "years": "2017–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2007,
    "lastYear": 2019,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-greg-mattison",
    "name": "Greg Mattison",
    "records": [
      {
        "role": "DC",
        "team": "Baltimore Ravens",
        "years": "2009–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/8/baltimore-ravens-defensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2009,
    "lastYear": 2010,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-greg-mcmackin",
    "name": "Greg McMackin",
    "records": [
      {
        "role": "DC",
        "team": "Seattle Seahawks",
        "years": "1995–1998",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/8/seattle-seahawks-defensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1995,
    "lastYear": 1998,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-greg-olson",
    "name": "Greg Olson",
    "records": [
      {
        "role": "OC",
        "team": "Jacksonville Jaguars",
        "years": "2015–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/7/jacksonville-jaguars-offensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Oakland Raiders",
        "years": "2013–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Oakland Raiders",
        "years": "2018–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "同名人物の在任を統合可能。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Las Vegas Raiders",
        "years": "2020–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Las Vegas Raiders",
        "years": "2025",
        "sourceUrl": "https://www.raiders.com/news/raiders-greg-olson-interim-offensive-coordinator-pete-carroll-2025-coaching-staff",
        "note": "Chip Kelly解任後のinterim OC／攻撃プレーコーラー。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "St. Louis Rams",
        "years": "2006–2007",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "2009–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/7/tampa-bay-buccaneers-offensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2006,
    "lastYear": 2025,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-greg-robinson",
    "name": "Greg Robinson",
    "records": [
      {
        "role": "DC",
        "team": "Denver Broncos",
        "years": "1995–2000",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "1994年はDL coach、1995年以降の正式DC在任境界を要確認。",
        "franchise": "Denver Broncos",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Kansas City Chiefs",
        "years": "2001–2003",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1995,
    "lastYear": 2003,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-greg-roman",
    "name": "Greg Roman",
    "records": [
      {
        "role": "OC",
        "team": "Baltimore Ravens",
        "years": "2019–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/7/baltimore-ravens-offensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "2015–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Los Angeles Chargers",
        "years": "2024–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "2011–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/7/san-francisco-49ers-offensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2011,
    "lastYear": 2025,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-greg-schiano",
    "name": "Greg Schiano",
    "records": [
      {
        "role": "HC",
        "team": "Tampa Bay Buccaneers",
        "years": "2012–2013",
        "sourceUrl": "https://pro-football-history.com/franchise/25/tampa-bay-buccaneers-coaches",
        "note": "正式名Gregory Edward Schiano。",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2012,
    "lastYear": 2013,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-gregg-williams",
    "name": "Gregg Williams",
    "records": [
      {
        "role": "HC",
        "team": "Buffalo Bills",
        "years": "2001–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/1/buffalo-bills-head-coach-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "2018",
        "sourceUrl": "https://www.clevelandbrowns.com/team/history/head-coaches",
        "note": "2018*のinterim head coach。",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2017–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "2018年は通常DCとinterim DCの区別があり、Blake Williamsが途中の代理DC。",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Jacksonville Jaguars",
        "years": "2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/8/jacksonville-jaguars-defensive-coordinator-history",
        "note": "姓名表記はGregg Williams（Greg Williams等の別表記と統合）。",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "St. Louis Rams",
        "years": "2014–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "2016年はLos Angeles Rams表記の資料もあるため、チーム名をまたぐ記録として統合可能。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Los Angeles Rams",
        "years": "2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "2016年のロサンゼルス移転後。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New Orleans Saints",
        "years": "2009–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/8/new-orleans-saints-defensive-coordinator-history",
        "note": "同データベースの表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Jets",
        "years": "2019–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/8/new-york-jets-defensive-coordinator-history",
        "note": "Greggの二重g表記を維持。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tennessee Oilers / Tennessee Titans",
        "years": "1997–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/8/tennessee-titans-defensive-coordinator-history",
        "note": "1997年の移転後はTennessee Oilers、1999年にTitansへ改称。",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1997,
    "lastYear": 2020,
    "sourceCount": 8,
    "verification": "source-linked"
  },
  {
    "id": "registry-gunther-cunningham",
    "name": "Gunther Cunningham",
    "records": [
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "2009–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Kansas City Chiefs",
        "years": "1995–1998",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Kansas City Chiefs",
        "years": "1999–2000",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Kansas City Chiefs",
        "years": "2004–2008",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Los Angeles Raiders",
        "years": "1992–1993",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/8/las-vegas-raiders-defensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1992,
    "lastYear": 2013,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-gus-bradley",
    "name": "Gus Bradley",
    "records": [
      {
        "role": "DC",
        "team": "Indianapolis Colts",
        "years": "2022–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/8/indianapolis-colts-defensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Jacksonville Jaguars",
        "years": "2013–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/1/jacksonville-jaguars-head-coach-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Las Vegas Raiders",
        "years": "2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/8/las-vegas-raiders-defensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Los Angeles Chargers",
        "years": "2017–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/8/los-angeles-chargers-defensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Seattle Seahawks",
        "years": "2009–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/8/seattle-seahawks-defensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tennessee Titans",
        "years": "2026–2026",
        "sourceUrl": "https://www.tennesseetitans.com/team/coaches-roster/gus-bradley",
        "note": "2026年2月4日就任。",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2009,
    "lastYear": 2026,
    "sourceCount": 6,
    "verification": "source-linked"
  },
  {
    "id": "registry-hal-hunter",
    "name": "Hal Hunter",
    "records": [
      {
        "role": "OC",
        "team": "San Diego Chargers",
        "years": "2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2012,
    "lastYear": 2012,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-hank-bullough",
    "name": "Hank Bullough",
    "records": [
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "1993",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Green Bay Packers",
        "years": "1990–1991",
        "sourceUrl": "https://gb.packers.com/coaches",
        "note": "Packers公式歴代コーチ一覧ではDefensive Coordinator, 1988–91。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1993,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-hank-kuhlmann",
    "name": "Hank Kuhlmann",
    "records": [
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "1991–1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/7/tampa-bay-buccaneers-offensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1991,
    "lastYear": 1991,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-harold-goodwin",
    "name": "Harold Goodwin",
    "records": [
      {
        "role": "OC",
        "team": "Arizona Cardinals",
        "years": "2013–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/7/arizona-cardinals-offensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2013,
    "lastYear": 2017,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-herb-paterra",
    "name": "Herb Paterra",
    "records": [
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "1994–1995",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1994,
    "lastYear": 1995,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-herm-edwards",
    "name": "Herm Edwards",
    "records": [
      {
        "role": "HC",
        "team": "Kansas City Chiefs",
        "years": "2006–2008",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Jets",
        "years": "2001–2005",
        "sourceUrl": "https://www.newyorkjets.com/history/coaching-history/",
        "note": "公式ページ表記はHerm Edwards。姓名別表記を統合。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2001,
    "lastYear": 2008,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-hue-jackson",
    "name": "Hue Jackson",
    "records": [
      {
        "role": "OC",
        "team": "Atlanta Falcons",
        "years": "2007–2007",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/7/atlanta-falcons-offensive-coordinator-history",
        "note": "当該原典では2007年単年",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cincinnati Bengals",
        "years": "2014–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/7/cincinnati-bengals-offensive-coordinator-history",
        "note": "姓名表記 Hue Jackson。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "2016–2018",
        "sourceUrl": "https://www.clevelandbrowns.com/team/history/head-coaches",
        "note": "2018年途中に解任。",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Oakland Raiders",
        "years": "2011",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Oakland Raiders",
        "years": "2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Washington Redskins",
        "years": "2003–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2003,
    "lastYear": 2018,
    "sourceCount": 6,
    "verification": "source-linked"
  },
  {
    "id": "registry-jack-burns",
    "name": "Jack Burns",
    "records": [
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "1992–1993",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "Jerry Burnsとは別人。",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Washington Redskins",
        "years": "1990–1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history",
        "note": "1989–1991在任の対象期間。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1993,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-jack-del-rio",
    "name": "Jack Del Rio",
    "records": [
      {
        "role": "DC",
        "team": "Carolina Panthers",
        "years": "2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/8/carolina-panthers-defensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Denver Broncos",
        "years": "2012–2014",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Jacksonville Jaguars",
        "years": "2003–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/1/jacksonville-jaguars-head-coach-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Oakland Raiders",
        "years": "2015–2017",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Washington Football Team",
        "years": "2020–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history",
        "note": "2020–2021はWashington Football Team。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Washington Commanders",
        "years": "2022–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history",
        "note": "同一人物の2020–2021在任記録と統合可能。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2002,
    "lastYear": 2023,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-jack-pardee",
    "name": "Jack Pardee",
    "records": [
      {
        "role": "HC",
        "team": "Houston Oilers",
        "years": "1990–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/1/tennessee-titans-head-coach-history",
        "note": "1990–1994はHouston Oilers。1994年11月にJeff Fisherが暫定HCとなったため、シーズン単位の正式在任記録とは別に扱う。",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 1994,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jack-reilly",
    "name": "Jack Reilly",
    "records": [
      {
        "role": "OC",
        "team": "Dallas Cowboys",
        "years": "2000–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/7/dallas-cowboys-offensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "St. Louis Rams",
        "years": "1995–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "移転後名称。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1995,
    "lastYear": 2001,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-james-bettcher",
    "name": "James Bettcher",
    "records": [
      {
        "role": "DC",
        "team": "Arizona Cardinals",
        "years": "2015–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/8/arizona-cardinals-defensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "2018–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2015,
    "lastYear": 2019,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-jason-garrett",
    "name": "Jason Garrett",
    "records": [
      {
        "role": "HC",
        "team": "Dallas Cowboys",
        "years": "2010–2019",
        "sourceUrl": "https://www.dallascowboys.com/news/rank-em-head-coaches-in-cowboys-history",
        "note": "2010年は途中就任のためPhillipsと重複。",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Dallas Cowboys",
        "years": "2007–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/7/dallas-cowboys-offensive-coordinator-history",
        "note": "2010年はHC職との重複・職務移行があるため、シーズン内の厳密な肩書境界は要確認。",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Giants",
        "years": "2020–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/7/new-york-giants-offensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2007,
    "lastYear": 2021,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-jason-michael",
    "name": "Jason Michael",
    "records": [
      {
        "role": "OC",
        "team": "Tennessee Titans",
        "years": "2014–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2014,
    "lastYear": 2015,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jason-tarver",
    "name": "Jason Tarver",
    "records": [
      {
        "role": "DC",
        "team": "Oakland Raiders",
        "years": "2012–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/8/las-vegas-raiders-defensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2012,
    "lastYear": 2014,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jay-gruden",
    "name": "Jay Gruden",
    "records": [
      {
        "role": "OC",
        "team": "Cincinnati Bengals",
        "years": "2011–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/7/cincinnati-bengals-offensive-coordinator-history",
        "note": "姓名表記 Jay Gruden。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Jacksonville Jaguars",
        "years": "2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/7/jacksonville-jaguars-offensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Washington Redskins",
        "years": "2014–2019",
        "sourceUrl": "https://pro-football-history.com/franchise/40/washington-commanders-coaches",
        "note": "2019年はシーズン途中で解任され、Bill Callahanが代理HC。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2011,
    "lastYear": 2020,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-jedd-fisch",
    "name": "Jedd Fisch",
    "records": [
      {
        "role": "OC",
        "team": "Jacksonville Jaguars",
        "years": "2013–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/7/jacksonville-jaguars-offensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2013,
    "lastYear": 2014,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jeff-davidson",
    "name": "Jeff Davidson",
    "records": [
      {
        "role": "OC",
        "team": "Carolina Panthers",
        "years": "2007–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/7/carolina-panthers-offensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2007,
    "lastYear": 2010,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jeff-fisher",
    "name": "Jeff Fisher",
    "records": [
      {
        "role": "HC",
        "team": "St. Louis Rams",
        "years": "2012–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/1/los-angeles-rams-head-coach-history",
        "note": "2016年途中まで在任したため、次の記録と分割。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Los Angeles Rams",
        "years": "2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/1/los-angeles-rams-head-coach-history",
        "note": "2016年はシーズン途中のロサンゼルス移転後も在任。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Los Angeles Rams",
        "years": "1991",
        "sourceUrl": "https://www.pro-football-reference.com/teams/ram/1991/gamelog",
        "note": "PFRの1991年ページの抽出結果ではDC表記。後年HCのJeff Fisherと同一人物だが、肩書の一次確認が限定的。",
        "franchise": "Los Angeles Rams",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Philadelphia Eagles",
        "years": "1990–1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/8/philadelphia-eagles-defensive-coordinator-history",
        "note": "在任は1989–1990。1990年シーズンを対象範囲に含めた。",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Houston Oilers / Tennessee Oilers / Tennessee Titans",
        "years": "1995–2010",
        "sourceUrl": "https://www.profootballhof.com/teams/tennessee-titans/team-history",
        "note": "1994年11月から暫定HC、1995年に正式就任。1997年にHoustonからTennesseeへ移転、1999年にOilersからTitansへ改称。",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Houston Oilers",
        "years": "1994–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/8/tennessee-titans-defensive-coordinator-history",
        "note": "1994年11月の暫定HC就任前後のDC職の扱いは要確認。",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 2016,
    "sourceCount": 5,
    "verification": "partial"
  },
  {
    "id": "registry-jeff-hafley",
    "name": "Jeff Hafley",
    "records": [
      {
        "role": "DC",
        "team": "Green Bay Packers",
        "years": "2024–2025",
        "sourceUrl": "https://www.pro-football-reference.com/teams/gnb/2025.htm",
        "note": "PFRの2024・2025年チームページでDC。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Miami Dolphins",
        "years": "2026–2026",
        "sourceUrl": "https://www.miamidolphins.com/team/coaches-roster/",
        "note": "2026年1月19日就任。",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2024,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-jeff-jagodzinski",
    "name": "Jeff Jagodzinski",
    "records": [
      {
        "role": "OC",
        "team": "Green Bay Packers",
        "years": "2006–2006",
        "sourceUrl": "https://www.packers.com/news/green-bay-tabs-jagodzinski-as-offensive-coordinator-2452561",
        "note": "Packers公式報道が2006年のOC就任を確認。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2006,
    "lastYear": 2006,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jeff-saturday",
    "name": "Jeff Saturday",
    "records": [
      {
        "role": "HC",
        "team": "Indianapolis Colts",
        "years": "2022",
        "sourceUrl": "https://www.footballdb.com/teams/nfl/indianapolis-colts/coaches-by-season",
        "note": "2022年途中就任の代理HC。",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2022,
    "lastYear": 2022,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jeff-tedford",
    "name": "Jeff Tedford",
    "records": [
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "2014–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/7/tampa-bay-buccaneers-offensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2014,
    "lastYear": 2014,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jeff-ulbrich",
    "name": "Jeff Ulbrich",
    "records": [
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "2025–2026",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "当該原典では2025年開始。2026年を含む",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Jets",
        "years": "2024",
        "sourceUrl": "https://www.newyorkjets.com/news/inside-the-numbers-jeff-ulbrich-jets-interim-head-coach",
        "note": "2024年途中の代理HC（interim）であり、正式なシーズン開始HCではない。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Jets",
        "years": "2021–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/8/new-york-jets-defensive-coordinator-history",
        "note": "2024年は代理HC就任後もDC欄に記録されるため、役割重複を注記。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2021,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-jeremy-bates",
    "name": "Jeremy Bates",
    "records": [
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "OC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Seattle Seahawks",
        "years": "2010–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/7/seattle-seahawks-offensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2010,
    "lastYear": 2018,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-jerod-mayo",
    "name": "Jerod Mayo",
    "records": [
      {
        "role": "HC",
        "team": "New England Patriots",
        "years": "2024",
        "sourceUrl": "https://www.patriots.com/press-room/history",
        "note": "公式歴史ページは2024年1月に第15代HC就任、2025年1月に解任を記載。",
        "franchise": "New England Patriots",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2024,
    "lastYear": 2024,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jerry-burns",
    "name": "Jerry Burns",
    "records": [
      {
        "role": "HC",
        "team": "Minnesota Vikings",
        "years": "1990–1991",
        "sourceUrl": "https://www.vikings.com/history/coaching-history",
        "note": "公式史料は在任を1986–1991と記載。1990–1991は対象範囲。",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 1991,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jerry-glanville",
    "name": "Jerry Glanville",
    "records": [
      {
        "role": "HC",
        "team": "Atlanta Falcons",
        "years": "1990–1993",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/1/atlanta-falcons-head-coach-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 1993,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jerry-gray",
    "name": "Jerry Gray",
    "records": [
      {
        "role": "DC",
        "team": "Buffalo Bills",
        "years": "2001–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/8/buffalo-bills-defensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tennessee Titans",
        "years": "2011–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/8/tennessee-titans-defensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2001,
    "lastYear": 2013,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-jerry-rhome",
    "name": "Jerry Rhome",
    "records": [
      {
        "role": "OC",
        "team": "Phoenix Cardinals",
        "years": "1990–1993",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/7/arizona-cardinals-offensive-coordinator-history",
        "note": "フランチャイズ移転前名称。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "St. Louis Rams",
        "years": "1997–1998",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Houston Oilers",
        "years": "1995–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1998,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-jerry-rosburg",
    "name": "Jerry Rosburg",
    "records": [
      {
        "role": "HC",
        "team": "Denver Broncos",
        "years": "2022",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "Hackett解任後の暫定HC。",
        "franchise": "Denver Broncos",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2022,
    "lastYear": 2022,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-jerry-sullivan",
    "name": "Jerry Sullivan",
    "records": [
      {
        "role": "OC",
        "team": "Arizona Cardinals",
        "years": "2003–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/7/arizona-cardinals-offensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2003,
    "lastYear": 2003,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jesse-minter",
    "name": "Jesse Minter",
    "records": [
      {
        "role": "HC",
        "team": "Baltimore Ravens",
        "years": "2026–2026",
        "sourceUrl": "https://www.baltimoreravens.com/team/coaches-roster/",
        "note": "2026年シーズンの現職。シーズンは調査時点で進行前・未完了。",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Los Angeles Chargers",
        "years": "2024–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/8/los-angeles-chargers-defensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2024,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-jim-bates",
    "name": "Jim Bates",
    "records": [
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "1994–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "1990–1993は当該原典でDC在任者を確認できず要確認",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Green Bay Packers",
        "years": "2005–2005",
        "sourceUrl": "https://gb.packers.com/coaches",
        "note": "Packers公式歴代コーチ一覧でDefensive Coordinator, 2005。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Miami Dolphins",
        "years": "2000–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/8/miami-dolphins-defensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tampa Bay Buccaneers",
        "years": "2009–2009",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/8/tampa-bay-buccaneers-defensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1994,
    "lastYear": 2009,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-jim-bob-cooter",
    "name": "Jim Bob Cooter",
    "records": [
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "2016–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Indianapolis Colts",
        "years": "2023–2026",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/7/indianapolis-colts-offensive-coordinator-history",
        "note": "2026年シーズンは原典上掲載されているが、シーズン完了後の確定記録ではない。",
        "franchise": "Indianapolis Colts",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2016,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-jim-caldwell",
    "name": "Jim Caldwell",
    "records": [
      {
        "role": "OC",
        "team": "Baltimore Ravens",
        "years": "2013–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/7/baltimore-ravens-offensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Detroit Lions",
        "years": "2014–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/1/detroit-lions-head-coach-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Indianapolis Colts",
        "years": "2009–2011",
        "sourceUrl": "https://pro-football-history.com/franchise/31/indianapolis-colts-coaches",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2009,
    "lastYear": 2017,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-jim-colletto",
    "name": "Jim Colletto",
    "records": [
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2008,
    "lastYear": 2008,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-jim-eddy",
    "name": "Jim Eddy",
    "records": [
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Houston Oilers",
        "years": "1990–1992",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/8/tennessee-titans-defensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1996,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-jim-fassel",
    "name": "Jim Fassel",
    "records": [
      {
        "role": "OC",
        "team": "Arizona Cardinals",
        "years": "1996–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/7/arizona-cardinals-offensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Baltimore Ravens",
        "years": "2005–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/7/baltimore-ravens-offensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "1993–1994",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/1993.htm",
        "note": "PFRの1993年年次ページでOffensive Coordinator。1994年も同職として継続。",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Giants",
        "years": "1997–2003",
        "sourceUrl": "https://www.pro-football-reference.com/teams/nyg/coaches.htm",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Giants",
        "years": "1991–1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/7/new-york-giants-offensive-coordinator-history",
        "note": "後のHCと同一人物。",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1991,
    "lastYear": 2006,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-jim-harbaugh",
    "name": "Jim Harbaugh",
    "records": [
      {
        "role": "HC",
        "team": "Los Angeles Chargers",
        "years": "2024–2026",
        "sourceUrl": "https://www.chargers.com/team/history/coaching-history",
        "note": "公式ページは2024表記だが、2026年の公式コーチ編成でもHead Coach。2026年は進行中。",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "San Francisco 49ers",
        "years": "2011–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/1/san-francisco-49ers-head-coach-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2011,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-jim-haslett",
    "name": "Jim Haslett",
    "records": [
      {
        "role": "DC",
        "team": "St. Louis Rams",
        "years": "2006–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New Orleans Saints",
        "years": "2000–2005",
        "sourceUrl": "https://www.neworleanssaints.com/team/history/head-coaches",
        "note": "公式歴史ページの表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New Orleans Saints",
        "years": "1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/8/new-orleans-saints-defensive-coordinator-history",
        "note": "同データベースの表記。後年のHC在任とは別役職記録。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Pittsburgh Steelers",
        "years": "1997–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/8/pittsburgh-steelers-defensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Washington Redskins",
        "years": "2010–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1996,
    "lastYear": 2014,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-jim-hostler",
    "name": "Jim Hostler",
    "records": [
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "2007–2007",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/7/san-francisco-49ers-offensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2007,
    "lastYear": 2007,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jim-johnson",
    "name": "Jim Johnson",
    "records": [
      {
        "role": "DC",
        "team": "Indianapolis Colts",
        "years": "1996–1997",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/8/indianapolis-colts-defensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Philadelphia Eagles",
        "years": "1999–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/8/philadelphia-eagles-defensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1996,
    "lastYear": 2008,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-jim-leonhard",
    "name": "Jim Leonhard",
    "records": [
      {
        "role": "DC",
        "team": "Buffalo Bills",
        "years": "2026–2026",
        "sourceUrl": "https://www.buffalobills.com/team/coaches-roster/",
        "note": "2026年スタッフ欄でDCとして確認。",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jim-mora",
    "name": "Jim Mora",
    "records": [
      {
        "role": "HC",
        "team": "Indianapolis Colts",
        "years": "1998–2001",
        "sourceUrl": "https://pro-football-history.com/franchise/31/indianapolis-colts-coaches",
        "note": "原典の表記はJim E. Mora (Sr.)、一般的表記はJim Mora。",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New Orleans Saints",
        "years": "1990–1996",
        "sourceUrl": "https://www.neworleanssaints.com/team/history/head-coaches",
        "note": "公式歴史ページは1986–1996と掲載。1996年途中までの在任で、同年途中のRick Venturi暫定HCと重複するシーズン表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Seattle Seahawks",
        "years": "2009–2009",
        "sourceUrl": "https://www.seahawks.com/team/coaches-roster/all-time/",
        "note": "公式歴代コーチ一覧では在任2009。",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 2009,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-jim-mora-jr",
    "name": "Jim Mora Jr.",
    "records": [
      {
        "role": "HC",
        "team": "Atlanta Falcons",
        "years": "2004–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/1/atlanta-falcons-head-coach-history",
        "note": "原典表記はJim L. Mora (Jr.)。Jim Mora Jr.等の別表記と統合可能",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "1999–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/8/san-francisco-49ers-defensive-coordinator-history",
        "note": "Jim Mora Jr.、James L. Mora等の別表記を統合。",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1999,
    "lastYear": 2006,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-jim-oneil",
    "name": "Jim O'Neil",
    "records": [
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2014–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "2016–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/8/san-francisco-49ers-defensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2014,
    "lastYear": 2016,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-jim-schwartz",
    "name": "Jim Schwartz",
    "records": [
      {
        "role": "DC",
        "team": "Buffalo Bills",
        "years": "2014–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/8/buffalo-bills-defensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2023–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Detroit Lions",
        "years": "2009–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/1/detroit-lions-head-coach-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Philadelphia Eagles",
        "years": "2016–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/8/philadelphia-eagles-defensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tennessee Titans",
        "years": "2001–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/8/tennessee-titans-defensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2001,
    "lastYear": 2025,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-jim-shofner",
    "name": "Jim Shofner",
    "records": [
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "1990",
        "sourceUrl": "https://www.clevelandbrowns.com/team/history/head-coaches",
        "note": "公式表で1990*のinterim head coach。",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "二次集計ではOCだが、同年のHC兼務・正式肩書の一次資料を未確認。",
        "franchise": "Cleveland Browns",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1990,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-jim-skipper",
    "name": "Jim Skipper",
    "records": [
      {
        "role": "OC",
        "team": "New York Giants",
        "years": "1997–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/7/new-york-giants-offensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1997,
    "lastYear": 1999,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jim-tomsula",
    "name": "Jim Tomsula",
    "records": [
      {
        "role": "HC",
        "team": "San Francisco 49ers",
        "years": "2015–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/1/san-francisco-49ers-head-coach-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2015,
    "lastYear": 2015,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jim-vechiarella",
    "name": "Jim Vechiarella",
    "records": [
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "二次集計の表記。姓名表記・正式肩書をPFR/公式で未確認。",
        "franchise": "Cleveland Browns",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "New York Jets",
        "years": "1995–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/8/new-york-jets-defensive-coordinator-history",
        "note": "同時代の公式肩書・姓名表記は要確認。推測で別表記を補わない。",
        "franchise": "New York Jets",
        "status": "needs-review"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1996,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-jim-zorn",
    "name": "Jim Zorn",
    "records": [
      {
        "role": "HC",
        "team": "Washington Redskins",
        "years": "2008–2009",
        "sourceUrl": "https://pro-football-history.com/franchise/40/washington-commanders-coaches",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2008,
    "lastYear": 2009,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jimmy-johnson",
    "name": "Jimmy Johnson",
    "records": [
      {
        "role": "HC",
        "team": "Dallas Cowboys",
        "years": "1990–1993",
        "sourceUrl": "https://www.dallascowboys.com/news/rank-em-head-coaches-in-cowboys-history",
        "note": "公式記事は在任を1989–1993と記載。本調査対象の1990年以降部分。",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Miami Dolphins",
        "years": "1996–1999",
        "sourceUrl": "https://www.pro-football-reference.com/teams/mia/coaches.htm",
        "note": "姓の別表記なし。",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 1999,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-jimmy-lake",
    "name": "Jimmy Lake",
    "records": [
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "2024–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "当該原典では2024年単年",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2024,
    "lastYear": 2024,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jimmy-raye",
    "name": "Jimmy Raye",
    "records": [
      {
        "role": "OC",
        "team": "Kansas City Chiefs",
        "years": "1998–2000",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Oakland Raiders",
        "years": "2004–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New England Patriots",
        "years": "1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/7/new-england-patriots-offensive-coordinator-history",
        "note": "役職史では1990年OC。公式チーム資料での正式肩書は要確認。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "2009–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/7/san-francisco-49ers-offensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Washington Redskins",
        "years": "2001–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history",
        "note": "1994–2000、2002年は同一原典上で正式OC記録なし。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 2010,
    "sourceCount": 5,
    "verification": "partial"
  },
  {
    "id": "registry-joe-barry",
    "name": "Joe Barry",
    "records": [
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "2007–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Green Bay Packers",
        "years": "2021–2023",
        "sourceUrl": "https://gb.packers.com/coaches",
        "note": "Packers公式歴代コーチ一覧でDefensive Coordinator, 2021–23。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Washington Redskins",
        "years": "2015–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2007,
    "lastYear": 2023,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-joe-brady",
    "name": "Joe Brady",
    "records": [
      {
        "role": "HC",
        "team": "Buffalo Bills",
        "years": "2026–2026",
        "sourceUrl": "https://www.buffalobills.com/team/coaches-roster/joe-brady",
        "note": "2026年1月27日にHC就任。",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "2024–2025",
        "sourceUrl": "https://www.buffalobills.com/team/coaches-roster/joe-brady",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2024,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-joe-bugel",
    "name": "Joe Bugel",
    "records": [
      {
        "role": "HC",
        "team": "Phoenix Cardinals",
        "years": "1990–1993",
        "sourceUrl": "https://www.pro-football-reference.com/teams/crd/coaches.htm",
        "note": "フランチャイズ移転前名称。1994年以降のArizona Cardinalsと同一フランチャイズとして統合。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Oakland Raiders",
        "years": "1997",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 1997,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-joe-collier",
    "name": "Joe Collier",
    "records": [
      {
        "role": "DC",
        "team": "New England Patriots",
        "years": "1991–1992",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/8/new-england-patriots-defensive-coordinator-history",
        "note": "役職史では1991–1992年DC。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1991,
    "lastYear": 1992,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-joe-cullen",
    "name": "Joe Cullen",
    "records": [
      {
        "role": "DC",
        "team": "Jacksonville Jaguars",
        "years": "2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/8/jacksonville-jaguars-defensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2021,
    "lastYear": 2021,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-joe-gibbs",
    "name": "Joe Gibbs",
    "records": [
      {
        "role": "HC",
        "team": "Washington Redskins",
        "years": "1990–1992",
        "sourceUrl": "https://pro-football-history.com/franchise/40/washington-commanders-coaches",
        "note": "1981–1992在任のうち対象期間。旧称Washington Redskins。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Washington Redskins",
        "years": "2004–2007",
        "sourceUrl": "https://pro-football-history.com/franchise/40/washington-commanders-coaches",
        "note": "同一人物の1990–1992在任記録と統合可能。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 2007,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-joe-haering",
    "name": "Joe Haering",
    "records": [
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "1995–1995",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "当該原典では1995年単年",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1995,
    "lastYear": 1995,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-joe-judge",
    "name": "Joe Judge",
    "records": [
      {
        "role": "HC",
        "team": "New York Giants",
        "years": "2020–2021",
        "sourceUrl": "https://www.pro-football-reference.com/teams/nyg/coaches.htm",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2020,
    "lastYear": 2021,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-joe-lombardi",
    "name": "Joe Lombardi",
    "records": [
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "2023–2025",
        "sourceUrl": "https://www.nfl.com/news/broncos-fire-offensive-coordinator-joe-lombardi-after-three-seasons-in-denver",
        "note": "NFL報道は3シーズン在任と記載。",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "2014–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Los Angeles Chargers",
        "years": "2021–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2014,
    "lastYear": 2025,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-joe-pascale",
    "name": "Joe Pascale",
    "records": [
      {
        "role": "DC",
        "team": "Phoenix Cardinals",
        "years": "1990–1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/8/arizona-cardinals-defensive-coordinator-history",
        "note": "フランチャイズ移転前名称。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Diego Chargers",
        "years": "1997–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/8/los-angeles-chargers-defensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 2001,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-joe-pendry",
    "name": "Joe Pendry",
    "records": [
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "1998–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Carolina Panthers",
        "years": "1995–1997",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/7/carolina-panthers-offensive-coordinator-history",
        "note": "Joseph Pendry表記とも統合。",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Kansas City Chiefs",
        "years": "1990–1992",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 2000,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-joe-philbin",
    "name": "Joe Philbin",
    "records": [
      {
        "role": "OC",
        "team": "Green Bay Packers",
        "years": "2007–2011",
        "sourceUrl": "https://www.pro-football-reference.com/teams/gnb/coaches.htm",
        "note": "PFR年次チーム記録とPackers公式コーチ履歴で攻撃部門責任者として確認。ただし2007–11の正式タイトル表記は年度資料間で揺れがあるため要確認。",
        "franchise": "Green Bay Packers",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Green Bay Packers",
        "years": "2012–2015",
        "sourceUrl": "https://www.pro-football-reference.com/teams/gnb/coaches.htm",
        "note": "PFR・Packers資料で攻撃部門責任者として確認されるが、Edgar Bennettの2015–17年OC表記と2015年が重複するため、共同・実務上の肩書を要確認。",
        "franchise": "Green Bay Packers",
        "status": "needs-review"
      },
      {
        "role": "HC",
        "team": "Green Bay Packers",
        "years": "2018–2018",
        "sourceUrl": "https://www.pro-football-reference.com/teams/gnb/coaches.htm",
        "note": "McCarthy解任後の2018年暫定HC。通常のシーズンHCと区別。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Miami Dolphins",
        "years": "2012–2015",
        "sourceUrl": "https://www.pro-football-reference.com/teams/mia/coaches.htm",
        "note": "2015年途中解任まで。",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2007,
    "lastYear": 2018,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-joe-vitt",
    "name": "Joe Vitt",
    "records": [
      {
        "role": "HC",
        "team": "St. Louis Rams",
        "years": "2005",
        "sourceUrl": "https://www.footballdb.com/teams/nfl/los-angeles-rams/head-coaches",
        "note": "Mike Martz離脱後の代理・暫定HC。フルタイムHC在任記録には統合しない。",
        "franchise": "Los Angeles Rams",
        "status": "needs-review"
      },
      {
        "role": "HC",
        "team": "New Orleans Saints",
        "years": "2012",
        "sourceUrl": "https://www.neworleanssaints.com/team/history/head-coaches",
        "note": "公式歴史ページが2012年の暫定HCとして掲載。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2005,
    "lastYear": 2012,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-joe-walton",
    "name": "Joe Walton",
    "records": [
      {
        "role": "OC",
        "team": "Pittsburgh Steelers",
        "years": "1990–1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/7/pittsburgh-steelers-offensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1991,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-joe-whitt-jr",
    "name": "Joe Whitt Jr.",
    "records": [
      {
        "role": "DC",
        "team": "Washington Commanders",
        "years": "2024–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2024,
    "lastYear": 2025,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-joe-woods",
    "name": "Joe Woods",
    "records": [
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2020–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Denver Broncos",
        "years": "2017–2018",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New Orleans Saints",
        "years": "2023–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/8/new-orleans-saints-defensive-coordinator-history",
        "note": "同データベースの表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2017,
    "lastYear": 2024,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-john-becker",
    "name": "John Becker",
    "records": [
      {
        "role": "OC",
        "team": "Seattle Seahawks",
        "years": "1990–1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/7/seattle-seahawks-offensive-coordinator-history",
        "note": "同資料では1989–1991。1990–1991シーズン部分を収録。",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1991,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-john-defilippo",
    "name": "John DeFilippo",
    "records": [
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Jacksonville Jaguars",
        "years": "2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/7/jacksonville-jaguars-offensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2015,
    "lastYear": 2019,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-john-fassel",
    "name": "John Fassel",
    "records": [
      {
        "role": "HC",
        "team": "Los Angeles Rams",
        "years": "2016",
        "sourceUrl": "https://www.footballdb.com/teams/nfl/los-angeles-rams/head-coaches",
        "note": "Fisher解任後の暫定HC。",
        "franchise": "Los Angeles Rams",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2016,
    "lastYear": 2016,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-john-fox",
    "name": "John Fox",
    "records": [
      {
        "role": "HC",
        "team": "Carolina Panthers",
        "years": "2002–2010",
        "sourceUrl": "https://pro-football-history.com/franchise/26/carolina-panthers-coaches",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Chicago Bears",
        "years": "2015–2017",
        "sourceUrl": "https://www.pro-football-reference.com/teams/chi/coaches.htm",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Denver Broncos",
        "years": "2011–2014",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Los Angeles Raiders",
        "years": "1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/8/las-vegas-raiders-defensive-coordinator-history",
        "note": "同ページは1994–95をLos Angeles/Oaklandとして併記。移転後の1995年分はOakland。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Oakland Raiders",
        "years": "1995",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/8/las-vegas-raiders-defensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "1997–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1994,
    "lastYear": 2017,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-john-harbaugh",
    "name": "John Harbaugh",
    "records": [
      {
        "role": "HC",
        "team": "Baltimore Ravens",
        "years": "2008–2025",
        "sourceUrl": "https://www.pro-football-reference.com/teams/rav/coaches.htm",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Giants",
        "years": "2026–2026",
        "sourceUrl": "https://www.giants.com/news/john-harbaugh-announces-2026-coaching-staff-coordinators-matt-nagy-dennard-wilson-chris-horton",
        "note": "2026年1月就任。",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2008,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-john-hufnagel",
    "name": "John Hufnagel",
    "records": [
      {
        "role": "OC",
        "team": "New York Giants",
        "years": "2004–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/7/new-york-giants-offensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2004,
    "lastYear": 2006,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-john-marshall",
    "name": "John Marshall",
    "records": [
      {
        "role": "DC",
        "team": "Carolina Panthers",
        "years": "1999–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/8/carolina-panthers-defensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Oakland Raiders",
        "years": "2009–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/8/las-vegas-raiders-defensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "1997–1998",
        "sourceUrl": "https://www.49ers.com/news/every-49ers-defensive-coordinator-since-george-seifert-14857597",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Seattle Seahawks",
        "years": "2006–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/8/seattle-seahawks-defensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1997,
    "lastYear": 2010,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-john-morton",
    "name": "John Morton",
    "records": [
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "2026年1月の報道で2025年OC離任が確認されるが、正式なシーズン内肩書は要確認。",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "OC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2017,
    "lastYear": 2025,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-john-pagano",
    "name": "John Pagano",
    "records": [
      {
        "role": "DC",
        "team": "San Diego Chargers",
        "years": "2012–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/8/los-angeles-chargers-defensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2012,
    "lastYear": 2016,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-john-pease",
    "name": "John Pease",
    "records": [
      {
        "role": "DC",
        "team": "Jacksonville Jaguars",
        "years": "2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/8/jacksonville-jaguars-defensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2002,
    "lastYear": 2002,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-john-robinson",
    "name": "John Robinson",
    "records": [
      {
        "role": "HC",
        "team": "Los Angeles Rams",
        "years": "1990–1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/1/los-angeles-rams-head-coach-history",
        "note": "1990–91のロサンゼルス時代。1991年終了後に退任。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 1991,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-john-shoop",
    "name": "John Shoop",
    "records": [
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "2001–2003",
        "sourceUrl": "https://www.nbcchicago.com/news/sports/nfl/chicago-bears/heres-a-record-of-the-bears-offensive-coordinators-since-2000/3323341/",
        "note": "表記揺れShoop/ShoopではなくJohn Shoop。",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2001,
    "lastYear": 2003,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-johnnie-lynn",
    "name": "Johnnie Lynn",
    "records": [
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "2002–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2002,
    "lastYear": 2003,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-jon-gruden",
    "name": "Jon Gruden",
    "records": [
      {
        "role": "HC",
        "team": "Oakland Raiders",
        "years": "1998–2001",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "第1期。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Oakland Raiders",
        "years": "2018–2021",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "第2期。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "1995–1997",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Tampa Bay Buccaneers",
        "years": "2002–2008",
        "sourceUrl": "https://www.buccaneers.com/team/ring-of-honor/jon-gruden",
        "note": "公式ページは2002–08在任を明記。",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1995,
    "lastYear": 2021,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-jonathan-gannon",
    "name": "Jonathan Gannon",
    "records": [
      {
        "role": "HC",
        "team": "Arizona Cardinals",
        "years": "2023–2025",
        "sourceUrl": "https://www.azcardinals.com/news/as-cardinals-coaching-search-continues-a-look-at-past-timelines",
        "note": "公式記事は2026年の後任探索記事として在任期間を裏付ける。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Green Bay Packers",
        "years": "2026–2026",
        "sourceUrl": "https://www.packers.com/team/coaches-roster/",
        "note": "Packers公式2026年現行コーチ名簿でDC。2026年はシーズン途中・在任中として扱う。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Philadelphia Eagles",
        "years": "2021–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/8/philadelphia-eagles-defensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2021,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-joseph-brady",
    "name": "Joseph Brady",
    "records": [
      {
        "role": "OC",
        "team": "Carolina Panthers",
        "years": "2020–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/7/carolina-panthers-offensive-coordinator-history",
        "note": "一般にJoe Bradyとも表記。",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2020,
    "lastYear": 2021,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-josh-boyer",
    "name": "Josh Boyer",
    "records": [
      {
        "role": "DC",
        "team": "Miami Dolphins",
        "years": "2020–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/8/miami-dolphins-defensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2020,
    "lastYear": 2022,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-josh-grizzard",
    "name": "Josh Grizzard",
    "records": [
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "2025–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/7/tampa-bay-buccaneers-offensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2025,
    "lastYear": 2025,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-josh-mcdaniels",
    "name": "Josh McDaniels",
    "records": [
      {
        "role": "HC",
        "team": "Denver Broncos",
        "years": "2009–2010",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "2010年途中解任。",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Las Vegas Raiders",
        "years": "2022–2023",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "St. Louis Rams",
        "years": "2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New England Patriots",
        "years": "2006–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/7/new-england-patriots-offensive-coordinator-history",
        "note": "非連続在任の第1期。2005年は公式OC不在として報道されている。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "New England Patriots",
        "years": "2012–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/7/new-england-patriots-offensive-coordinator-history",
        "note": "非連続在任の第2期。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "New England Patriots",
        "years": "2025–2026",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/7/new-england-patriots-offensive-coordinator-history",
        "note": "非連続在任の第3期。2022年は公式OCを置かない方針が報道されている。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2006,
    "lastYear": 2026,
    "sourceCount": 4,
    "verification": "partial"
  },
  {
    "id": "registry-juan-castillo",
    "name": "Juan Castillo",
    "records": [
      {
        "role": "DC",
        "team": "Philadelphia Eagles",
        "years": "2011–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/8/philadelphia-eagles-defensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2011,
    "lastYear": 2012,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-june-jones",
    "name": "June Jones",
    "records": [
      {
        "role": "HC",
        "team": "Atlanta Falcons",
        "years": "1994–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/1/atlanta-falcons-head-coach-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "San Diego Chargers",
        "years": "1998",
        "sourceUrl": "https://www.chargers.com/team/history/coaching-history",
        "note": "Kevin Gilbrideと同じ1998年シーズンに在任。",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1994,
    "lastYear": 1998,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-justin-outten",
    "name": "Justin Outten",
    "records": [
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "2022",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "役職名が正式なOCか、Run Game Coordinator等との分担かを要確認。",
        "franchise": "Denver Broncos",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2022,
    "lastYear": 2022,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-kacy-rodgers",
    "name": "Kacy Rodgers",
    "records": [
      {
        "role": "DC",
        "team": "New York Jets",
        "years": "2015–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/8/new-york-jets-defensive-coordinator-history",
        "note": "DC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2015,
    "lastYear": 2018,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-keith-butler",
    "name": "Keith Butler",
    "records": [
      {
        "role": "DC",
        "team": "Pittsburgh Steelers",
        "years": "2015–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/8/pittsburgh-steelers-defensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2015,
    "lastYear": 2021,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-keith-rowen",
    "name": "Keith Rowen",
    "records": [
      {
        "role": "OC",
        "team": "Arizona Cardinals",
        "years": "2005–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/7/arizona-cardinals-offensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2005,
    "lastYear": 2006,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-kellen-moore",
    "name": "Kellen Moore",
    "records": [
      {
        "role": "OC",
        "team": "Dallas Cowboys",
        "years": "2019–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/7/dallas-cowboys-offensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Los Angeles Chargers",
        "years": "2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New Orleans Saints",
        "years": "2025–2026",
        "sourceUrl": "https://www.neworleanssaints.com/team/history/head-coaches",
        "note": "公式ページは2025年2月11日就任と記載。2026年は調査基準日時点の現任シーズン。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "2024–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2019,
    "lastYear": 2026,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-kelvin-sheppard",
    "name": "Kelvin Sheppard",
    "records": [
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "2025–2026",
        "sourceUrl": "https://www.detroitlions.com/news/lions-announce-2026-coaching-staff",
        "note": "2026公式スタッフ発表でDefensive Coordinatorを確認。",
        "franchise": "Detroit Lions",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2025,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-ken-anderson",
    "name": "Ken Anderson",
    "records": [
      {
        "role": "OC",
        "team": "Cincinnati Bengals",
        "years": "1996–2000",
        "sourceUrl": "https://www.bengals.com/news/winds-of-change-approaching-pbs",
        "note": "公式記事は1996年途中の就任を明記し、1997年開幕時のOC在任を確認できる。1996年は部分在任。",
        "franchise": "Cincinnati Bengals",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1996,
    "lastYear": 2000,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-ken-dorsey",
    "name": "Ken Dorsey",
    "records": [
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "2022–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2022,
    "lastYear": 2024,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-ken-flajole",
    "name": "Ken Flajole",
    "records": [
      {
        "role": "DC",
        "team": "St. Louis Rams",
        "years": "2009–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2009,
    "lastYear": 2011,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-ken-norton-jr",
    "name": "Ken Norton Jr.",
    "records": [
      {
        "role": "DC",
        "team": "Oakland Raiders",
        "years": "2015–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/8/las-vegas-raiders-defensive-coordinator-history",
        "note": "姓名表記はKen Norton Jr.／Ken Norton, Jr.を統合。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Seattle Seahawks",
        "years": "2018–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/8/seattle-seahawks-defensive-coordinator-history",
        "note": "姓の表記はKen Norton Jr.／Ken Norton, Jr.の揺れあり。",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2015,
    "lastYear": 2021,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-ken-whisenhunt",
    "name": "Ken Whisenhunt",
    "records": [
      {
        "role": "HC",
        "team": "Arizona Cardinals",
        "years": "2007–2012",
        "sourceUrl": "https://www.azcardinals.com/news/as-cardinals-coaching-search-continues-a-look-at-past-timelines",
        "note": "公式歴代HC記事で確認。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Diego Chargers",
        "years": "2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Diego Chargers",
        "years": "2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "同一人物の2013年在任と2016–2019年在任を分割表記。",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Los Angeles Chargers",
        "years": "2017–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "2017年の名称変更後。",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Pittsburgh Steelers",
        "years": "2004–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/7/pittsburgh-steelers-offensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Tennessee Titans",
        "years": "2014–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/1/tennessee-titans-head-coach-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2004,
    "lastYear": 2019,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-ken-zampese",
    "name": "Ken Zampese",
    "records": [
      {
        "role": "OC",
        "team": "Cincinnati Bengals",
        "years": "2016–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/7/cincinnati-bengals-offensive-coordinator-history",
        "note": "姓名表記 Ken Zampese。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2016,
    "lastYear": 2017,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-kevin-coyle",
    "name": "Kevin Coyle",
    "records": [
      {
        "role": "DC",
        "team": "Miami Dolphins",
        "years": "2012–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/8/miami-dolphins-defensive-coordinator-history",
        "note": "2015年の役割・交代時期は要確認。",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2012,
    "lastYear": 2015,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-kevin-gilbride",
    "name": "Kevin Gilbride",
    "records": [
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "2002–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Jacksonville Jaguars",
        "years": "1995–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/7/jacksonville-jaguars-offensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "San Diego Chargers",
        "years": "1997–1998",
        "sourceUrl": "https://www.chargers.com/team/history/coaching-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Giants",
        "years": "2007–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/7/new-york-giants-offensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Pittsburgh Steelers",
        "years": "1999–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/7/pittsburgh-steelers-offensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Houston Oilers",
        "years": "1990–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "1994年はDick Couryとの重複記録があり、共同・交代制を含む正式肩書の時期は要確認。",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 2013,
    "sourceCount": 6,
    "verification": "partial"
  },
  {
    "id": "registry-kevin-oconnell",
    "name": "Kevin O'Connell",
    "records": [
      {
        "role": "OC",
        "team": "Los Angeles Rams",
        "years": "2020–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "2018–2019は正式OCの扱いが資料間で不明確なため別記。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Minnesota Vikings",
        "years": "2022–2026",
        "sourceUrl": "https://www.vikings.com/history/coaching-history",
        "note": "公式史料は2022年2月16日就任。2026年は現行シーズン。",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Washington Redskins",
        "years": "2019–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2019,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-kevin-patullo",
    "name": "Kevin Patullo",
    "records": [
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "2025–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2025,
    "lastYear": 2025,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-kevin-stefanski",
    "name": "Kevin Stefanski",
    "records": [
      {
        "role": "HC",
        "team": "Atlanta Falcons",
        "years": "2026–2026",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/1/atlanta-falcons-head-coach-history",
        "note": "2026シーズン開始前の現職記録",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "2020–2025",
        "sourceUrl": "https://www.clevelandbrowns.com/team/history/head-coaches",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2019,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-kippy-brown",
    "name": "Kippy Brown",
    "records": [
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "1998–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1998,
    "lastYear": 1999,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-klay-kubiak",
    "name": "Klay Kubiak",
    "records": [
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "2025–2026",
        "sourceUrl": "https://www.pro-football-reference.com/teams/sfo/2026_draft.htm",
        "note": "2025–2026。",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2025,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-klayton-adams",
    "name": "Klayton Adams",
    "records": [
      {
        "role": "OC",
        "team": "Dallas Cowboys",
        "years": "2025–2026",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/7/dallas-cowboys-offensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2025,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-kliff-kingsbury",
    "name": "Kliff Kingsbury",
    "records": [
      {
        "role": "HC",
        "team": "Arizona Cardinals",
        "years": "2019–2022",
        "sourceUrl": "https://www.azcardinals.com/news/as-cardinals-coaching-search-continues-a-look-at-past-timelines",
        "note": "公式歴代HC記事およびPFR年次記録で確認。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Washington Commanders",
        "years": "2024–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2019,
    "lastYear": 2025,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-klint-kubiak",
    "name": "Klint Kubiak",
    "records": [
      {
        "role": "HC",
        "team": "Las Vegas Raiders",
        "years": "2026–2026",
        "sourceUrl": "https://www.raiders.com/team/coaches-roster/",
        "note": "2026年2月9日就任。2026シーズンは調査時点で進行中。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New Orleans Saints",
        "years": "2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/7/new-orleans-saints-offensive-coordinator-history",
        "note": "同データベースの表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Seattle Seahawks",
        "years": "2025–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/7/seattle-seahawks-offensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2021,
    "lastYear": 2026,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-kris-richard",
    "name": "Kris Richard",
    "records": [
      {
        "role": "DC",
        "team": "Seattle Seahawks",
        "years": "2015–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/8/seattle-seahawks-defensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2015,
    "lastYear": 2017,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-kurt-schottenheimer",
    "name": "Kurt Schottenheimer",
    "records": [
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "2002–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Kansas City Chiefs",
        "years": "1999–2000",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "Marty Schottenheimerとは別人。",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Washington Redskins",
        "years": "2001–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1999,
    "lastYear": 2003,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-kyle-shanahan",
    "name": "Kyle Shanahan",
    "records": [
      {
        "role": "OC",
        "team": "Atlanta Falcons",
        "years": "2015–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/7/atlanta-falcons-offensive-coordinator-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Houston Texans",
        "years": "2008–2009",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/7/houston-texans-offensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "San Francisco 49ers",
        "years": "2017–2026",
        "sourceUrl": "https://www.pro-football-reference.com/teams/sfo/2026_draft.htm",
        "note": "2026年は同ページの現行スタッフ記載に基づく。",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Washington Redskins",
        "years": "2010–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2008,
    "lastYear": 2026,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-lane-kiffin",
    "name": "Lane Kiffin",
    "records": [
      {
        "role": "HC",
        "team": "Oakland Raiders",
        "years": "2007–2008",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "公式ページは2007–08と記載。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2007,
    "lastYear": 2008,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-larry-coyer",
    "name": "Larry Coyer",
    "records": [
      {
        "role": "DC",
        "team": "Denver Broncos",
        "years": "2003–2008",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "2003年の昇格時期と2008年終了時期に資料差異の可能性。",
        "franchise": "Denver Broncos",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Indianapolis Colts",
        "years": "2009–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/8/indianapolis-colts-defensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2003,
    "lastYear": 2011,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-larry-kennan",
    "name": "Larry Kennan",
    "records": [
      {
        "role": "OC",
        "team": "Indianapolis Colts",
        "years": "1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/7/indianapolis-colts-offensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New England Patriots",
        "years": "1997",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/7/new-england-patriots-offensive-coordinator-history",
        "note": "役職史では1997年OC。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Seattle Seahawks",
        "years": "1992–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/7/seattle-seahawks-offensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1997,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-larry-marmie",
    "name": "Larry Marmie",
    "records": [
      {
        "role": "DC",
        "team": "Arizona Cardinals",
        "years": "2001–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/8/arizona-cardinals-defensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "St. Louis Rams",
        "years": "2004–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2001,
    "lastYear": 2005,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-larry-peccatiello",
    "name": "Larry Peccatiello",
    "records": [
      {
        "role": "DC",
        "team": "Cincinnati Bengals",
        "years": "1994–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/8/cincinnati-bengals-defensive-coordinator-history",
        "note": "姓名表記 Larry Peccatiello。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "1997–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Washington Redskins",
        "years": "1990–1992",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history",
        "note": "1983–1992在任の対象期間。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 2000,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-leon-burtnett",
    "name": "Leon Burtnett",
    "records": [
      {
        "role": "OC",
        "team": "Indianapolis Colts",
        "years": "1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/7/indianapolis-colts-offensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1991,
    "lastYear": 1991,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-les-steckel",
    "name": "Les Steckel",
    "records": [
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "2000–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/7/tampa-bay-buccaneers-offensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tennessee Oilers / Tennessee Titans",
        "years": "1997–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "1997年の移転後はTennessee Oilers、1999年にTitansへ改称。",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1997,
    "lastYear": 2000,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-leslie-frazier",
    "name": "Leslie Frazier",
    "records": [
      {
        "role": "DC",
        "team": "Buffalo Bills",
        "years": "2017–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/8/buffalo-bills-defensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Cincinnati Bengals",
        "years": "2003–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/8/cincinnati-bengals-defensive-coordinator-history",
        "note": "姓名表記 Leslie Frazier。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Minnesota Vikings",
        "years": "2010–2013",
        "sourceUrl": "https://www.vikings.com/history/coaching-history",
        "note": "2010年最後の6試合はinterim HC、正式就任は2011年1月3日。",
        "franchise": "Minnesota Vikings",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Minnesota Vikings",
        "years": "2007–2010",
        "sourceUrl": "https://www.vikings.com/history/coaching-history",
        "note": "公式史料は2007–2010のDCと記載。",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tampa Bay Buccaneers",
        "years": "2014–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/8/tampa-bay-buccaneers-defensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2003,
    "lastYear": 2022,
    "sourceCount": 4,
    "verification": "partial"
  },
  {
    "id": "registry-liam-coen",
    "name": "Liam Coen",
    "records": [
      {
        "role": "HC",
        "team": "Jacksonville Jaguars",
        "years": "2025–2026",
        "sourceUrl": "https://www.jaguars.com/team/coaches-roster/liam-coen",
        "note": "2026年は現職・シーズン進行中。",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Los Angeles Rams",
        "years": "2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "ロサンゼルス時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "2024–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/7/tampa-bay-buccaneers-offensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2022,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-lindy-infante",
    "name": "Lindy Infante",
    "records": [
      {
        "role": "HC",
        "team": "Green Bay Packers",
        "years": "1990–1991",
        "sourceUrl": "https://www.pro-football-reference.com/teams/gnb/1990.htm",
        "note": "PFRの1990・1991年チームページでHead Coach。姓名別表記としてGelindo 'Lindy' Infanteがある。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Indianapolis Colts",
        "years": "1996–1997",
        "sourceUrl": "https://pro-football-history.com/franchise/31/indianapolis-colts-coaches",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Indianapolis Colts",
        "years": "1995",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/7/indianapolis-colts-offensive-coordinator-history",
        "note": "HC在任期間と役職が重なる。",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1997,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-lou-anarumo",
    "name": "Lou Anarumo",
    "records": [
      {
        "role": "DC",
        "team": "Cincinnati Bengals",
        "years": "2019–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/8/cincinnati-bengals-defensive-coordinator-history",
        "note": "姓名表記 Lou Anarumo。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Indianapolis Colts",
        "years": "2025–2026",
        "sourceUrl": "https://www.colts.com/team/coaches-roster/lou-anarumo",
        "note": "公式現行スタッフ。2026年シーズンは原典上掲載されているが、シーズン完了後の確定記録ではない。",
        "franchise": "Indianapolis Colts",
        "status": "needs-review"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2019,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-louie-cioffi",
    "name": "Louie Cioffi",
    "records": [
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2016,
    "lastYear": 2016,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-lovie-smith",
    "name": "Lovie Smith",
    "records": [
      {
        "role": "HC",
        "team": "Chicago Bears",
        "years": "2004–2012",
        "sourceUrl": "https://www.pro-football-reference.com/teams/chi/coaches.htm",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Houston Texans",
        "years": "2022–2022",
        "sourceUrl": "https://www.pro-football-reference.com/teams/htx/coaches.htm",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Houston Texans",
        "years": "2021–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/8/houston-texans-defensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "St. Louis Rams",
        "years": "2001–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Tampa Bay Buccaneers",
        "years": "2014–2015",
        "sourceUrl": "https://pro-football-history.com/franchise/25/tampa-bay-buccaneers-coaches",
        "note": "正式名Lovie Lee Smith。",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2001,
    "lastYear": 2022,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-luke-getsy",
    "name": "Luke Getsy",
    "records": [
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "2022–2023",
        "sourceUrl": "https://www.nbcchicago.com/news/sports/nfl/chicago-bears/heres-a-record-of-the-bears-offensive-coordinators-since-2000/3323341/",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Las Vegas Raiders",
        "years": "2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "シーズン途中解任の報道あり。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2022,
    "lastYear": 2024,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-marc-trestman",
    "name": "Marc Trestman",
    "records": [
      {
        "role": "OC",
        "team": "Arizona Cardinals",
        "years": "1998–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/7/arizona-cardinals-offensive-coordinator-history",
        "note": "1997年はDick Jamiesonとされるが、対象期間の単年記録として別掲。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Baltimore Ravens",
        "years": "2015–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/7/baltimore-ravens-offensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Chicago Bears",
        "years": "2013–2014",
        "sourceUrl": "https://www.pro-football-reference.com/teams/chi/coaches.htm",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Oakland Raiders",
        "years": "2002–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "1995–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/7/san-francisco-49ers-offensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1995,
    "lastYear": 2016,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-marcus-brady",
    "name": "Marcus Brady",
    "records": [
      {
        "role": "OC",
        "team": "Indianapolis Colts",
        "years": "2021–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/7/indianapolis-colts-offensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2021,
    "lastYear": 2022,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-mark-duffner",
    "name": "Mark Duffner",
    "records": [
      {
        "role": "DC",
        "team": "Cincinnati Bengals",
        "years": "2001–2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/8/cincinnati-bengals-defensive-coordinator-history",
        "note": "姓名表記 Mark Duffner。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2001,
    "lastYear": 2002,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-mark-helfrich",
    "name": "Mark Helfrich",
    "records": [
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "2018–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/7/chicago-bears-offensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2018,
    "lastYear": 2019,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-marquand-manuel",
    "name": "Marquand Manuel",
    "records": [
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "2017–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2017,
    "lastYear": 2018,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-marty-mornhinweg",
    "name": "Marty Mornhinweg",
    "records": [
      {
        "role": "OC",
        "team": "Baltimore Ravens",
        "years": "2017–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/7/baltimore-ravens-offensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Detroit Lions",
        "years": "2001–2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/1/detroit-lions-head-coach-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "2013–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "OC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "2004–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "同原典は2004年および2006–2012と記載。2004年のBrad Childressとの重複は要確認。",
        "franchise": "Philadelphia Eagles",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "2006–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "1997–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/7/san-francisco-49ers-offensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1997,
    "lastYear": 2018,
    "sourceCount": 5,
    "verification": "partial"
  },
  {
    "id": "registry-marty-schottenheimer",
    "name": "Marty Schottenheimer",
    "records": [
      {
        "role": "HC",
        "team": "Kansas City Chiefs",
        "years": "1990–1998",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "1989就任。",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "San Diego Chargers",
        "years": "2002–2006",
        "sourceUrl": "https://www.chargers.com/team/history/coaching-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Washington Redskins",
        "years": "2001–2001",
        "sourceUrl": "https://pro-football-history.com/franchise/40/washington-commanders-coaches",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 2006,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-marv-levy",
    "name": "Marv Levy",
    "records": [
      {
        "role": "HC",
        "team": "Buffalo Bills",
        "years": "1990–1997",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/1/buffalo-bills-head-coach-history",
        "note": "1990–1997。1990–1996は同一在任期間の一部。",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 1997,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-marvin-lewis",
    "name": "Marvin Lewis",
    "records": [
      {
        "role": "DC",
        "team": "Baltimore Ravens",
        "years": "1996–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/8/baltimore-ravens-defensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Cincinnati Bengals",
        "years": "2003–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/1/cincinnati-bengals-head-coach-history",
        "note": "姓名表記 Marvin Lewis。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Washington Redskins",
        "years": "2002–2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1996,
    "lastYear": 2018,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-matt-burke",
    "name": "Matt Burke",
    "records": [
      {
        "role": "DC",
        "team": "Houston Texans",
        "years": "2023–2026",
        "sourceUrl": "https://www.houstontexans.com/team/coaches-roster/matt-burke",
        "note": "公式略歴は2023–25の3シーズン実績を示し、現職ページは2026年時点で在任。",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Miami Dolphins",
        "years": "2017–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/8/miami-dolphins-defensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2017,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-matt-canada",
    "name": "Matt Canada",
    "records": [
      {
        "role": "OC",
        "team": "Pittsburgh Steelers",
        "years": "2021–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/7/pittsburgh-steelers-offensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2021,
    "lastYear": 2023,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-matt-cavanaugh",
    "name": "Matt Cavanaugh",
    "records": [
      {
        "role": "OC",
        "team": "Baltimore Ravens",
        "years": "1999–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/7/baltimore-ravens-offensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "1997–1998",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/7/chicago-bears-offensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Washington Redskins",
        "years": "2017–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1997,
    "lastYear": 2018,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-matt-eberflus",
    "name": "Matt Eberflus",
    "records": [
      {
        "role": "HC",
        "team": "Chicago Bears",
        "years": "2022–2024",
        "sourceUrl": "https://www.jt-sw.com/football/pro/teams.nsf/histories/bears",
        "note": "2024年途中解任まで。",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Dallas Cowboys",
        "years": "2025–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/8/dallas-cowboys-defensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Indianapolis Colts",
        "years": "2018–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/8/indianapolis-colts-defensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2018,
    "lastYear": 2025,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-matt-lafleur",
    "name": "Matt LaFleur",
    "records": [
      {
        "role": "HC",
        "team": "Green Bay Packers",
        "years": "2019–2026",
        "sourceUrl": "https://www.packers.com/team/coaches-roster/",
        "note": "Packers公式現行コーチ名簿で2019年就任。2026年は現時点のシーズン在任中。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Los Angeles Rams",
        "years": "2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "ロサンゼルス復帰初年度。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tennessee Titans",
        "years": "2018–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2017,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-matt-nagy",
    "name": "Matt Nagy",
    "records": [
      {
        "role": "HC",
        "team": "Chicago Bears",
        "years": "2018–2021",
        "sourceUrl": "https://www.pro-football-reference.com/teams/chi/coaches.htm",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Kansas City Chiefs",
        "years": "2017",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Kansas City Chiefs",
        "years": "2023–2025",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "2023年に再任。",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Giants",
        "years": "2026–2026",
        "sourceUrl": "https://www.giants.com/news/john-harbaugh-announces-2026-coaching-staff-coordinators-matt-nagy-dennard-wilson-chris-horton",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2017,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-matt-patricia",
    "name": "Matt Patricia",
    "records": [
      {
        "role": "HC",
        "team": "Detroit Lions",
        "years": "2018–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/1/detroit-lions-head-coach-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New England Patriots",
        "years": "2012–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/8/new-england-patriots-defensive-coordinator-history",
        "note": "役職史では2012–2017年DC。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2012,
    "lastYear": 2020,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-matt-rhule",
    "name": "Matt Rhule",
    "records": [
      {
        "role": "HC",
        "team": "Carolina Panthers",
        "years": "2020–2022",
        "sourceUrl": "https://pro-football-history.com/franchise/26/carolina-panthers-coaches",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2020,
    "lastYear": 2022,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-maurice-carthon",
    "name": "Maurice Carthon",
    "records": [
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2005–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Dallas Cowboys",
        "years": "2003–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/7/dallas-cowboys-offensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "2001年は同一覧でOC記録が確認できず要確認。",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2002,
    "lastYear": 2006,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-mel-tucker",
    "name": "Mel Tucker",
    "records": [
      {
        "role": "DC",
        "team": "Chicago Bears",
        "years": "2013–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/8/chicago-bears-defensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Jacksonville Jaguars",
        "years": "2011",
        "sourceUrl": "https://www.jaguars.com/news/k000151-official-jaguars-name-liam-coen-head-coach",
        "note": "2011年シーズン最終5試合のinterim HC。正式HC在任とは区別。",
        "franchise": "Jacksonville Jaguars",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Jacksonville Jaguars",
        "years": "2009–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/8/jacksonville-jaguars-defensive-coordinator-history",
        "note": "2011年はDCとinterim HCを兼務。",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2008,
    "lastYear": 2014,
    "sourceCount": 4,
    "verification": "partial"
  },
  {
    "id": "registry-mick-lombardi",
    "name": "Mick Lombardi",
    "records": [
      {
        "role": "OC",
        "team": "Las Vegas Raiders",
        "years": "2022–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2022,
    "lastYear": 2023,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-caldwell",
    "name": "Mike Caldwell",
    "records": [
      {
        "role": "DC",
        "team": "Jacksonville Jaguars",
        "years": "2022–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/8/jacksonville-jaguars-defensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2022,
    "lastYear": 2023,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-ditka",
    "name": "Mike Ditka",
    "records": [
      {
        "role": "HC",
        "team": "Chicago Bears",
        "years": "1990–1992",
        "sourceUrl": "https://www.pro-football-reference.com/teams/chi/coaches.htm",
        "note": "PFRのチーム・コーチ履歴および年別履歴で確認。",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New Orleans Saints",
        "years": "1997–1999",
        "sourceUrl": "https://www.neworleanssaints.com/team/history/head-coaches",
        "note": "公式歴史ページの表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 1999,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-groh",
    "name": "Mike Groh",
    "records": [
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "2018–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2018,
    "lastYear": 2019,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-heimerdinger",
    "name": "Mike Heimerdinger",
    "records": [
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "2006",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "PFRのコーチ一覧・年次スタッフ表記で要再確認。",
        "franchise": "Denver Broncos",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "OC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tennessee Titans",
        "years": "2000–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tennessee Titans",
        "years": "2008–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "2005–2007はNorm Chow。Heimerdingerの在任は二つの期間に分割。",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2000,
    "lastYear": 2010,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-mike-holmgren",
    "name": "Mike Holmgren",
    "records": [
      {
        "role": "HC",
        "team": "Green Bay Packers",
        "years": "1992–1998",
        "sourceUrl": "https://www.pro-football-reference.com/teams/gnb/coaches.htm",
        "note": "PFRコーチ一覧およびPackersの歴代コーチ資料で確認。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "1990–1991",
        "sourceUrl": "https://www.pro-football-reference.com/teams/sfo/1990.htm",
        "note": "1989–1991。1990年PFR年別ページでOffensive Coordinatorと確認。",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Seattle Seahawks",
        "years": "1999–2008",
        "sourceUrl": "https://www.seahawks.com/team/coaches-roster/all-time/",
        "note": "公式歴代コーチ一覧では在任1999–2008。",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 2008,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-kafka",
    "name": "Mike Kafka",
    "records": [
      {
        "role": "OC",
        "team": "New York Giants",
        "years": "2022–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/7/new-york-giants-offensive-coordinator-history",
        "note": "2025年終盤は肩書・実務分担が複雑。",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2022,
    "lastYear": 2025,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-lafleur",
    "name": "Mike LaFleur",
    "records": [
      {
        "role": "HC",
        "team": "Arizona Cardinals",
        "years": "2026–2026",
        "sourceUrl": "https://www.azcardinals.com/team/coaches-roster/",
        "note": "2026年シーズンの現職HC。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Los Angeles Rams",
        "years": "2023–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "ロサンゼルス時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "2021–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "姓名表記はMike LaFleur。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2021,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-macdonald",
    "name": "Mike Macdonald",
    "records": [
      {
        "role": "DC",
        "team": "Baltimore Ravens",
        "years": "2022–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/8/baltimore-ravens-defensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Seattle Seahawks",
        "years": "2024–2026",
        "sourceUrl": "https://www.seahawks.com/team/coaches-roster/",
        "note": "公式現行スタッフページでヘッドコーチ。2026年は当該シーズンの現職として記載。",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2022,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-martz",
    "name": "Mike Martz",
    "records": [
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "2010–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/7/chicago-bears-offensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "2006–2007",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "HC",
        "team": "St. Louis Rams",
        "years": "2000–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/1/los-angeles-rams-head-coach-history",
        "note": "2005年はシーズン途中に離脱。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "St. Louis Rams",
        "years": "1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "1999年。翌年HCに就任。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "2008–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/7/san-francisco-49ers-offensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1999,
    "lastYear": 2011,
    "sourceCount": 5,
    "verification": "partial"
  },
  {
    "id": "registry-mike-mccarthy",
    "name": "Mike McCarthy",
    "records": [
      {
        "role": "HC",
        "team": "Dallas Cowboys",
        "years": "2020–2024",
        "sourceUrl": "https://www.dallascowboys.com/news/rank-em-head-coaches-in-cowboys-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Green Bay Packers",
        "years": "2006–2018",
        "sourceUrl": "https://www.pro-football-reference.com/teams/gnb/coaches.htm",
        "note": "PFRコーチ一覧で2006–18年。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New Orleans Saints",
        "years": "2000–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/7/new-orleans-saints-offensive-coordinator-history",
        "note": "同データベースの表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Pittsburgh Steelers",
        "years": "2026–2026",
        "sourceUrl": "https://www.steelers.com/team/coaches-roster/",
        "note": "2026年1月27日に17代目HCとして公式発表。2026シーズン在任中。",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "2005–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/7/san-francisco-49ers-offensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2000,
    "lastYear": 2026,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-mccoy",
    "name": "Mike McCoy",
    "records": [
      {
        "role": "OC",
        "team": "Arizona Cardinals",
        "years": "2018–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/7/arizona-cardinals-offensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "2009–2012",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "2009–2010年の肩書・権限配分は資料によりOC表記が揺れるため要確認。",
        "franchise": "Denver Broncos",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "2017",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "San Diego Chargers",
        "years": "2013–2016",
        "sourceUrl": "https://www.chargers.com/team/history/coaching-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2009,
    "lastYear": 2018,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-mike-mcdaniel",
    "name": "Mike McDaniel",
    "records": [
      {
        "role": "OC",
        "team": "Los Angeles Chargers",
        "years": "2026",
        "sourceUrl": "https://www.chargers.com/news/mike-mcdaniel-chris-oleary-new-coordinator-2026",
        "note": "2026年シーズンの現職。シーズン進行中。",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Miami Dolphins",
        "years": "2022–2025",
        "sourceUrl": "https://www.pro-football-reference.com/teams/mia/coaches.htm",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "2021–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/7/san-francisco-49ers-offensive-coordinator-history",
        "note": "2022年の正式肩書は今回の主要原典間で未統一のため別記載せず。",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2021,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-miller",
    "name": "Mike Miller",
    "records": [
      {
        "role": "OC",
        "team": "Arizona Cardinals",
        "years": "2012–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/7/arizona-cardinals-offensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2012,
    "lastYear": 2012,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-mularkey",
    "name": "Mike Mularkey",
    "records": [
      {
        "role": "OC",
        "team": "Atlanta Falcons",
        "years": "2008–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/7/atlanta-falcons-offensive-coordinator-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Buffalo Bills",
        "years": "2004–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/1/buffalo-bills-head-coach-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Jacksonville Jaguars",
        "years": "2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/1/jacksonville-jaguars-head-coach-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "2006–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Pittsburgh Steelers",
        "years": "2001–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/7/pittsburgh-steelers-offensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Tennessee Titans",
        "years": "2016–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/1/tennessee-titans-head-coach-history",
        "note": "2015年途中の暫定HC期間はシーズン記録と別扱い。",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2001,
    "lastYear": 2017,
    "sourceCount": 6,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-munchak",
    "name": "Mike Munchak",
    "records": [
      {
        "role": "HC",
        "team": "Tennessee Titans",
        "years": "2011–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/1/tennessee-titans-head-coach-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2011,
    "lastYear": 2013,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-nolan",
    "name": "Mike Nolan",
    "records": [
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "2012–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Baltimore Ravens",
        "years": "2002–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/8/baltimore-ravens-defensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Dallas Cowboys",
        "years": "2020–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/8/dallas-cowboys-defensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Denver Broncos",
        "years": "2009",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Miami Dolphins",
        "years": "2010–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/8/miami-dolphins-defensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "1993–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Jets",
        "years": "2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/8/new-york-jets-defensive-coordinator-history",
        "note": "DC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "San Francisco 49ers",
        "years": "2005–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/1/san-francisco-49ers-head-coach-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Washington Redskins",
        "years": "1997–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history",
        "note": "1995–1996年は正式DC記録を確認できず要確認。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1993,
    "lastYear": 2020,
    "sourceCount": 9,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-pettine",
    "name": "Mike Pettine",
    "records": [
      {
        "role": "DC",
        "team": "Buffalo Bills",
        "years": "2013–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/8/buffalo-bills-defensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "2014–2015",
        "sourceUrl": "https://www.clevelandbrowns.com/team/history/head-coaches",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Green Bay Packers",
        "years": "2018–2020",
        "sourceUrl": "https://www.jsonline.com/story/sports/nfl/packers/2024/01/26/here-are-all-of-the-green-bay-packers-defensive-coordinators-in-history/72351007007/",
        "note": "主要報道の歴代DC一覧で2018–20年。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Jets",
        "years": "2009–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/8/new-york-jets-defensive-coordinator-history",
        "note": "DC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2009,
    "lastYear": 2020,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-pope",
    "name": "Mike Pope",
    "records": [
      {
        "role": "OC",
        "team": "Cincinnati Bengals",
        "years": "1993–1993",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/7/cincinnati-bengals-offensive-coordinator-history",
        "note": "1990–92については公式記事が正式なOC不在または肩書不明としており、推測で補っていない。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1993,
    "lastYear": 1993,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-riley",
    "name": "Mike Riley",
    "records": [
      {
        "role": "HC",
        "team": "San Diego Chargers",
        "years": "1999–2001",
        "sourceUrl": "https://www.chargers.com/team/history/coaching-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1999,
    "lastYear": 2001,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-rutenberg",
    "name": "Mike Rutenberg",
    "records": [
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2026",
        "sourceUrl": "https://www.clevelandbrowns.com/team/coaches-roster/",
        "note": "公式現行コーチ rosterでDC。",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-shanahan",
    "name": "Mike Shanahan",
    "records": [
      {
        "role": "HC",
        "team": "Denver Broncos",
        "years": "1995–2008",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "1991年にはDenverのOC。",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/10/7/denver-broncos-offensive-coordinator-history",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "1992–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/7/san-francisco-49ers-offensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Washington Redskins",
        "years": "2010–2013",
        "sourceUrl": "https://pro-football-history.com/franchise/40/washington-commanders-coaches",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1991,
    "lastYear": 2013,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-sheppard",
    "name": "Mike Sheppard",
    "records": [
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "2001–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Diego Chargers",
        "years": "1997–1998",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New Orleans Saints",
        "years": "2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/7/new-orleans-saints-offensive-coordinator-history",
        "note": "同データベースの表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1997,
    "lastYear": 2005,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-sherman",
    "name": "Mike Sherman",
    "records": [
      {
        "role": "HC",
        "team": "Green Bay Packers",
        "years": "2000–2005",
        "sourceUrl": "https://www.pro-football-reference.com/teams/gnb/coaches.htm",
        "note": "PFRコーチ一覧で2000–05年のHead Coach。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Houston Texans",
        "years": "2007–2007",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/7/houston-texans-offensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "2012–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Seattle Seahawks",
        "years": "1999–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/7/seattle-seahawks-offensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1999,
    "lastYear": 2013,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-shula",
    "name": "Mike Shula",
    "records": [
      {
        "role": "OC",
        "team": "Carolina Panthers",
        "years": "2013–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/7/carolina-panthers-offensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Giants",
        "years": "2018–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/7/new-york-giants-offensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "1996–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/7/tampa-bay-buccaneers-offensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1996,
    "lastYear": 2019,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-singletary",
    "name": "Mike Singletary",
    "records": [
      {
        "role": "HC",
        "team": "San Francisco 49ers",
        "years": "2009–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/1/san-francisco-49ers-head-coach-history",
        "note": "2008年途中の代理・暫定扱いは本記録の正式シーズン在任年から除外。",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2009,
    "lastYear": 2010,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-smith",
    "name": "Mike Smith",
    "records": [
      {
        "role": "HC",
        "team": "Atlanta Falcons",
        "years": "2008–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/1/atlanta-falcons-head-coach-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Jacksonville Jaguars",
        "years": "2003–2007",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/8/jacksonville-jaguars-defensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tampa Bay Buccaneers",
        "years": "2016–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/8/tampa-bay-buccaneers-defensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2003,
    "lastYear": 2018,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-solari",
    "name": "Mike Solari",
    "records": [
      {
        "role": "OC",
        "team": "Kansas City Chiefs",
        "years": "2006–2007",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2006,
    "lastYear": 2007,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-sullivan",
    "name": "Mike Sullivan",
    "records": [
      {
        "role": "OC",
        "team": "New York Giants",
        "years": "2016–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/7/new-york-giants-offensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "2012–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/7/tampa-bay-buccaneers-offensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2012,
    "lastYear": 2017,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-tice",
    "name": "Mike Tice",
    "records": [
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "2012–2012",
        "sourceUrl": "https://www.nbcchicago.com/news/sports/nfl/chicago-bears/heres-a-record-of-the-bears-offensive-coordinators-since-2000/3323341/",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Minnesota Vikings",
        "years": "2001–2005",
        "sourceUrl": "https://www.vikings.com/history/coaching-history",
        "note": "2001年最終レギュラーシーズン戦の代理HCを含む。正式HCは2002年就任。",
        "franchise": "Minnesota Vikings",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2001,
    "lastYear": 2012,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-mike-tomlin",
    "name": "Mike Tomlin",
    "records": [
      {
        "role": "DC",
        "team": "Minnesota Vikings",
        "years": "2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/8/minnesota-vikings-defensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Pittsburgh Steelers",
        "years": "2007–2025",
        "sourceUrl": "https://www.pro-football-reference.com/teams/pit/coaches.htm",
        "note": "PFRのチーム・コーチ年表に基づく。2025年まで。",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2006,
    "lastYear": 2025,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-trgovac",
    "name": "Mike Trgovac",
    "records": [
      {
        "role": "DC",
        "team": "Carolina Panthers",
        "years": "2003–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/8/carolina-panthers-defensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2003,
    "lastYear": 2008,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-vrabel",
    "name": "Mike Vrabel",
    "records": [
      {
        "role": "DC",
        "team": "Houston Texans",
        "years": "2017–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/8/houston-texans-defensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New England Patriots",
        "years": "2025–2026",
        "sourceUrl": "https://www.patriots.com/press-room/history",
        "note": "公式歴史ページは2025年就任および2026年シーズンを記載。",
        "franchise": "New England Patriots",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Tennessee Titans",
        "years": "2018–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/1/tennessee-titans-head-coach-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2017,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-white",
    "name": "Mike White",
    "records": [
      {
        "role": "HC",
        "team": "Oakland Raiders",
        "years": "1995–1996",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1995,
    "lastYear": 1996,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-mike-zimmer",
    "name": "Mike Zimmer",
    "records": [
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "2007–2007",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "当該原典では2007年単年",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Cincinnati Bengals",
        "years": "2008–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/8/cincinnati-bengals-defensive-coordinator-history",
        "note": "姓名表記 Mike Zimmer。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Dallas Cowboys",
        "years": "2000–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/8/dallas-cowboys-defensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Dallas Cowboys",
        "years": "2024–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/8/dallas-cowboys-defensive-coordinator-history",
        "note": "2000–2006在任と同一人物。",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Minnesota Vikings",
        "years": "2014–2021",
        "sourceUrl": "https://www.vikings.com/history/coaching-history",
        "note": "公式史料は2014年1月15日就任。",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2000,
    "lastYear": 2024,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-monte-kiffin",
    "name": "Monte Kiffin",
    "records": [
      {
        "role": "DC",
        "team": "Dallas Cowboys",
        "years": "2013–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/8/dallas-cowboys-defensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Minnesota Vikings",
        "years": "1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/8/minnesota-vikings-defensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New Orleans Saints",
        "years": "1995",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/8/new-orleans-saints-defensive-coordinator-history",
        "note": "同データベースの表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tampa Bay Buccaneers",
        "years": "1996–2008",
        "sourceUrl": "https://www.buccaneers.com/team/ring-of-honor/monte-kiffin",
        "note": "公式ページは1996–2008の13シーズン在籍を確認。",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1991,
    "lastYear": 2013,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-nate-scheelhaase",
    "name": "Nate Scheelhaase",
    "records": [
      {
        "role": "OC",
        "team": "Los Angeles Rams",
        "years": "2026",
        "sourceUrl": "https://www.therams.com/team/coaches-roster/",
        "note": "公式ページは2026年シーズンのOCとして記載。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-nathaniel-hackett",
    "name": "Nathaniel Hackett",
    "records": [
      {
        "role": "OC",
        "team": "Arizona Cardinals",
        "years": "2026–2026",
        "sourceUrl": "https://www.azcardinals.com/team/coaches-roster/nathaniel-hackett",
        "note": "2026年に正式就任。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "2013–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Denver Broncos",
        "years": "2022",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "2022年途中解任。",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Green Bay Packers",
        "years": "2016–2018",
        "sourceUrl": "https://www.pro-football-history.com/franchpos/43/7/green-bay-packers-offensive-coordinator-history",
        "note": "主要コーチ履歴で掲載されるが、Packers公式歴代一覧では当時の肩書が複数表記されるため、正式OC期間は要確認。",
        "franchise": "Green Bay Packers",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Jacksonville Jaguars",
        "years": "2017–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/7/jacksonville-jaguars-offensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "2023–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "2024年のTodd Downingはoffensive pass game coordinatorであり、OCには含めない。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2013,
    "lastYear": 2026,
    "sourceCount": 6,
    "verification": "partial"
  },
  {
    "id": "registry-nick-caley",
    "name": "Nick Caley",
    "records": [
      {
        "role": "OC",
        "team": "Houston Texans",
        "years": "2025–2026",
        "sourceUrl": "https://www.houstontexans.com/team/coaches-roster/nick-caley",
        "note": "2026年は現職。公式略歴は2025–26 Offensive Coordinatorと記載。",
        "franchise": "Houston Texans",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2025,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-nick-holz",
    "name": "Nick Holz",
    "records": [
      {
        "role": "OC",
        "team": "Tennessee Titans",
        "years": "2024–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2024,
    "lastYear": 2025,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-nick-nicolau",
    "name": "Nick Nicolau",
    "records": [
      {
        "role": "OC",
        "team": "Indianapolis Colts",
        "years": "1992–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/7/indianapolis-colts-offensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1992,
    "lastYear": 1994,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-nick-rallis",
    "name": "Nick Rallis",
    "records": [
      {
        "role": "DC",
        "team": "Arizona Cardinals",
        "years": "2023–2026",
        "sourceUrl": "https://www.azcardinals.com/team/coaches-roster/nick-rallis",
        "note": "2026年も現職として公式スタッフページに掲載。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2023,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-nick-saban",
    "name": "Nick Saban",
    "records": [
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "1991–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Miami Dolphins",
        "years": "2005–2006",
        "sourceUrl": "https://www.pro-football-reference.com/teams/mia/coaches.htm",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1991,
    "lastYear": 2006,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-nick-sirianni",
    "name": "Nick Sirianni",
    "records": [
      {
        "role": "OC",
        "team": "Indianapolis Colts",
        "years": "2018–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/7/indianapolis-colts-offensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Philadelphia Eagles",
        "years": "2021–2026",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/1/philadelphia-eagles-head-coach-history",
        "note": "2026年は同原典が現職在任として記載。",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2018,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-nick-sorensen",
    "name": "Nick Sorensen",
    "records": [
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "2024–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/8/san-francisco-49ers-defensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2024,
    "lastYear": 2024,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-norm-chow",
    "name": "Norm Chow",
    "records": [
      {
        "role": "OC",
        "team": "Tennessee Titans",
        "years": "2005–2007",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2005,
    "lastYear": 2007,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-norv-turner",
    "name": "Norv Turner",
    "records": [
      {
        "role": "OC",
        "team": "Carolina Panthers",
        "years": "2018–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/7/carolina-panthers-offensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Dallas Cowboys",
        "years": "1991–1993",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/7/dallas-cowboys-offensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Oakland Raiders",
        "years": "2004–2005",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "San Diego Chargers",
        "years": "2007–2012",
        "sourceUrl": "https://www.chargers.com/team/history/coaching-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Diego Chargers",
        "years": "2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "2002–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "2014–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "2006–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/7/san-francisco-49ers-offensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Washington Redskins",
        "years": "1994–2000",
        "sourceUrl": "https://pro-football-history.com/franchise/40/washington-commanders-coaches",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1991,
    "lastYear": 2019,
    "sourceCount": 10,
    "verification": "source-linked"
  },
  {
    "id": "registry-pat-shurmur",
    "name": "Pat Shurmur",
    "records": [
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "2011–2012",
        "sourceUrl": "https://www.clevelandbrowns.com/team/history/head-coaches",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "2020–2021",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "St. Louis Rams",
        "years": "2009–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Giants",
        "years": "2018–2019",
        "sourceUrl": "https://www.pro-football-reference.com/teams/nyg/coaches.htm",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "2013–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2009,
    "lastYear": 2021,
    "sourceCount": 6,
    "verification": "source-linked"
  },
  {
    "id": "registry-patrick-graham",
    "name": "Patrick Graham",
    "records": [
      {
        "role": "DC",
        "team": "Las Vegas Raiders",
        "years": "2022–2025",
        "sourceUrl": "https://www.steelers.com/team/coaches-roster/patrick-graham",
        "note": "Raidersの2022–25在任。2025年終了後に退団。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Miami Dolphins",
        "years": "2019–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/8/miami-dolphins-defensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "2020–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Pittsburgh Steelers",
        "years": "2026–2026",
        "sourceUrl": "https://www.steelers.com/team/coaches-roster/",
        "note": "2026年の公式コーチ名簿でDCと確認。",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2019,
    "lastYear": 2026,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-paul-guenther",
    "name": "Paul Guenther",
    "records": [
      {
        "role": "DC",
        "team": "Cincinnati Bengals",
        "years": "2014–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/8/cincinnati-bengals-defensive-coordinator-history",
        "note": "姓名表記 Paul Guenther。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Oakland Raiders",
        "years": "2018–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/8/las-vegas-raiders-defensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2014,
    "lastYear": 2020,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-paul-hackett",
    "name": "Paul Hackett",
    "records": [
      {
        "role": "OC",
        "team": "Kansas City Chiefs",
        "years": "1993–1997",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "2001–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "OC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1993,
    "lastYear": 2004,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-paul-pasqualoni",
    "name": "Paul Pasqualoni",
    "records": [
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "2018–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Miami Dolphins",
        "years": "2008–2009",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/8/miami-dolphins-defensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2008,
    "lastYear": 2019,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-pep-hamilton",
    "name": "Pep Hamilton",
    "records": [
      {
        "role": "OC",
        "team": "Houston Texans",
        "years": "2022–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/7/houston-texans-offensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Indianapolis Colts",
        "years": "2013–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/7/indianapolis-colts-offensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2013,
    "lastYear": 2022,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-perry-fewell",
    "name": "Perry Fewell",
    "records": [
      {
        "role": "DC",
        "team": "Buffalo Bills",
        "years": "2006–2009",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/8/buffalo-bills-defensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Carolina Panthers",
        "years": "2019",
        "sourceUrl": "https://pro-football-history.com/franchise/26/carolina-panthers-coaches",
        "note": "暫定HC。",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "2010–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2006,
    "lastYear": 2019,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-pete-carmichael",
    "name": "Pete Carmichael",
    "records": [
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "2026–2026",
        "sourceUrl": "https://www.pro-football-reference.com/teams/buf/2026_draft.htm",
        "note": "2026年のPFRチーム欄でOCとして確認。",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2000,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-pete-carmichael-jr",
    "name": "Pete Carmichael Jr.",
    "records": [
      {
        "role": "OC",
        "team": "New Orleans Saints",
        "years": "2009–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/7/new-orleans-saints-offensive-coordinator-history",
        "note": "PFRや報道でPete Carmichael表記もあるが、Pete Carmichael Jr.と同一人物として統合。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2009,
    "lastYear": 2023,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-pete-carroll",
    "name": "Pete Carroll",
    "records": [
      {
        "role": "HC",
        "team": "Las Vegas Raiders",
        "years": "2025",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New England Patriots",
        "years": "1997–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/1/new-england-patriots-head-coach-history",
        "note": "姓の別表記Pete Carroll。",
        "franchise": "New England Patriots",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Jets",
        "years": "1994",
        "sourceUrl": "https://www.newyorkjets.com/history/coaching-history/",
        "note": "フランチャイズ公式HC歴。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Jets",
        "years": "1990–1993",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/8/new-york-jets-defensive-coordinator-history",
        "note": "1994年にHCへ移行。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "1995–1996",
        "sourceUrl": "https://www.49ers.com/news/every-49ers-defensive-coordinator-since-george-seifert-14857597",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Seattle Seahawks",
        "years": "2010–2023",
        "sourceUrl": "https://www.seahawks.com/team/coaches-roster/all-time/",
        "note": "公式歴代コーチ一覧では在任2010–2023。",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 2025,
    "sourceCount": 6,
    "verification": "source-linked"
  },
  {
    "id": "registry-pete-mangurian",
    "name": "Pete Mangurian",
    "records": [
      {
        "role": "OC",
        "team": "Atlanta Falcons",
        "years": "2003–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/7/atlanta-falcons-offensive-coordinator-history",
        "note": "当該原典では2003年単年",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2003,
    "lastYear": 2003,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-peter-giunta",
    "name": "Peter Giunta",
    "records": [
      {
        "role": "DC",
        "team": "St. Louis Rams",
        "years": "1998–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1998,
    "lastYear": 2000,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-phil-snow",
    "name": "Phil Snow",
    "records": [
      {
        "role": "DC",
        "team": "Carolina Panthers",
        "years": "2020–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/8/carolina-panthers-defensive-coordinator-history",
        "note": "2022年はシーズン途中までの正式DC。",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2020,
    "lastYear": 2022,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-press-taylor",
    "name": "Press Taylor",
    "records": [
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "2026–2026",
        "sourceUrl": "https://www.chicagobears.com/team/coaches/",
        "note": "公式サイトの現行スタッフ掲載。2026年シーズンの完了後確定記録ではない。",
        "franchise": "Chicago Bears",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Jacksonville Jaguars",
        "years": "2022–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/7/jacksonville-jaguars-offensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2022,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-raheem-morris",
    "name": "Raheem Morris",
    "records": [
      {
        "role": "HC",
        "team": "Atlanta Falcons",
        "years": "2024–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/1/atlanta-falcons-head-coach-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "2020–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "2020年単年。HC在任期間とは別役職",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Los Angeles Rams",
        "years": "2021–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "ロサンゼルス時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "2026–2026",
        "sourceUrl": "https://www.pro-football-reference.com/teams/sfo/2026_draft.htm",
        "note": "2026年現行スタッフ。",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Tampa Bay Buccaneers",
        "years": "2009–2011",
        "sourceUrl": "https://pro-football-history.com/franchise/25/tampa-bay-buccaneers-coaches",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2009,
    "lastYear": 2026,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-ralph-friedgen",
    "name": "Ralph Friedgen",
    "records": [
      {
        "role": "OC",
        "team": "San Diego Chargers",
        "years": "1994–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1994,
    "lastYear": 1996,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-randy-fichtner",
    "name": "Randy Fichtner",
    "records": [
      {
        "role": "OC",
        "team": "Pittsburgh Steelers",
        "years": "2018–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/7/pittsburgh-steelers-offensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2018,
    "lastYear": 2020,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-ray-handley",
    "name": "Ray Handley",
    "records": [
      {
        "role": "HC",
        "team": "New York Giants",
        "years": "1991–1992",
        "sourceUrl": "https://www.pro-football-reference.com/teams/nyg/coaches.htm",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1991,
    "lastYear": 1992,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-ray-horton",
    "name": "Ray Horton",
    "records": [
      {
        "role": "DC",
        "team": "Arizona Cardinals",
        "years": "2011–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/8/arizona-cardinals-defensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tennessee Titans",
        "years": "2014–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/8/tennessee-titans-defensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2011,
    "lastYear": 2015,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-ray-perkins",
    "name": "Ray Perkins",
    "records": [
      {
        "role": "OC",
        "team": "Oakland Raiders",
        "years": "1997",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New England Patriots",
        "years": "1993–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/7/new-england-patriots-offensive-coordinator-history",
        "note": "役職史では1993–1996年OC。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      },
      {
        "role": "HC",
        "team": "Tampa Bay Buccaneers",
        "years": "1990–1990",
        "sourceUrl": "https://pro-football-history.com/franchise/25/tampa-bay-buccaneers-coaches",
        "note": "1987–1990のHC。1990シーズン途中に解任されたため、同一シーズンにRichard Williamsonの代理HC記録と重なる。",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1997,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-ray-rhodes",
    "name": "Ray Rhodes",
    "records": [
      {
        "role": "DC",
        "team": "Denver Broncos",
        "years": "2001–2002",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "2001–2002年の役職表記をPFR年次ページで要再確認。",
        "franchise": "Denver Broncos",
        "status": "needs-review"
      },
      {
        "role": "HC",
        "team": "Green Bay Packers",
        "years": "1999–1999",
        "sourceUrl": "https://www.pro-football-reference.com/teams/gnb/coaches.htm",
        "note": "1999シーズンのHead Coach。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Philadelphia Eagles",
        "years": "1995–1998",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/1/philadelphia-eagles-head-coach-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "1994–1994",
        "sourceUrl": "https://www.49ers.com/news/every-49ers-defensive-coordinator-since-george-seifert-14857597",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Seattle Seahawks",
        "years": "2003–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/8/seattle-seahawks-defensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Washington Redskins",
        "years": "2000–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1994,
    "lastYear": 2005,
    "sourceCount": 6,
    "verification": "partial"
  },
  {
    "id": "registry-ray-sherman",
    "name": "Ray Sherman",
    "records": [
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "同時代の正式肩書は要確認ではないが、一覧ではOCとして記録。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Pittsburgh Steelers",
        "years": "1998–1998",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/7/pittsburgh-steelers-offensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1994,
    "lastYear": 1999,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-renaldo-hill",
    "name": "Renaldo Hill",
    "records": [
      {
        "role": "DC",
        "team": "Denver Broncos",
        "years": "2021",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "共同・分担型の守備スタッフだった可能性があり、正式DCとして要確認。",
        "franchise": "Denver Broncos",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Los Angeles Chargers",
        "years": "2021–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/8/los-angeles-chargers-defensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2021,
    "lastYear": 2022,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-rex-ryan",
    "name": "Rex Ryan",
    "records": [
      {
        "role": "DC",
        "team": "Baltimore Ravens",
        "years": "2005–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/8/baltimore-ravens-defensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Buffalo Bills",
        "years": "2015–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/1/buffalo-bills-head-coach-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Jets",
        "years": "2009–2014",
        "sourceUrl": "https://pro-football-history.com/franchise/3/new-york-jets-coaches",
        "note": "PFR年次コーチ記録と照合。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2005,
    "lastYear": 2016,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-rich-bisaccia",
    "name": "Rich Bisaccia",
    "records": [
      {
        "role": "HC",
        "team": "Las Vegas Raiders",
        "years": "2021",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "Jon Gruden辞任後の代理HC。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2021,
    "lastYear": 2021,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-rich-brooks",
    "name": "Rich Brooks",
    "records": [
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "1997–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "1996年は当該原典でDC在任者を確認できず要確認",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "St. Louis Rams",
        "years": "1995–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/1/los-angeles-rams-head-coach-history",
        "note": "1995年の移転後はSt. Louis Rams。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1995,
    "lastYear": 2000,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-rich-kotite",
    "name": "Rich Kotite",
    "records": [
      {
        "role": "HC",
        "team": "New York Jets",
        "years": "1995–1996",
        "sourceUrl": "https://www.newyorkjets.com/history/coaching-history/",
        "note": "フランチャイズ公式HC歴。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Philadelphia Eagles",
        "years": "1991–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/1/philadelphia-eagles-head-coach-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "1990–1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1996,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-rich-olson",
    "name": "Rich Olson",
    "records": [
      {
        "role": "OC",
        "team": "Arizona Cardinals",
        "years": "2001–2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/7/arizona-cardinals-offensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2001,
    "lastYear": 2002,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-rich-scangarello",
    "name": "Rich Scangarello",
    "records": [
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "2019",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2019,
    "lastYear": 2019,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-richard-smith",
    "name": "Richard Smith",
    "records": [
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "2015–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Houston Texans",
        "years": "2006–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/8/houston-texans-defensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Miami Dolphins",
        "years": "2005–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/8/miami-dolphins-defensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2005,
    "lastYear": 2016,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-richard-williamson",
    "name": "Richard Williamson",
    "records": [
      {
        "role": "OC",
        "team": "Carolina Panthers",
        "years": "2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/7/carolina-panthers-offensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Tampa Bay Buccaneers",
        "years": "1990–1991",
        "sourceUrl": "https://www.buccaneersfan.com/Pages/TeamZone/History/history-coaching.htm",
        "note": "1990年はRay Perkins解任後のinterim HC、1991年はHC。",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "1990–1990",
        "sourceUrl": "https://www.buccaneersfan.com/Pages/TeamZone/History/history-coaching.htm",
        "note": "公式系の歴史資料はPerkins配下のoffensive coordinatorと記すが、1990年途中にinterim HCへ移行。OCとしてのシーズン境界・正式肩書は要確認。",
        "franchise": "Tampa Bay Buccaneers",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 2001,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-richie-petitbon",
    "name": "Richie Petitbon",
    "records": [
      {
        "role": "HC",
        "team": "Washington Redskins",
        "years": "1993–1993",
        "sourceUrl": "https://pro-football-history.com/franchise/40/washington-commanders-coaches",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1993,
    "lastYear": 1993,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-rick-dennison",
    "name": "Rick Dennison",
    "records": [
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "2017–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "2007–2008",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "役職名がAssistant Head Coach/Offensive Coordinator等の資料差異あり。",
        "franchise": "Denver Broncos",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Denver Broncos",
        "years": "2015–2016",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Houston Texans",
        "years": "2010–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/7/houston-texans-offensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2007,
    "lastYear": 2017,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-rick-neuheisel",
    "name": "Rick Neuheisel",
    "records": [
      {
        "role": "OC",
        "team": "Baltimore Ravens",
        "years": "2007–2007",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/7/baltimore-ravens-offensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2007,
    "lastYear": 2007,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-rick-venturi",
    "name": "Rick Venturi",
    "records": [
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "1995",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Indianapolis Colts",
        "years": "1991",
        "sourceUrl": "https://www.footballdb.com/teams/nfl/indianapolis-colts/coaches-by-season",
        "note": "1991年の代理HC。",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Indianapolis Colts",
        "years": "1991–1993",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/8/indianapolis-colts-defensive-coordinator-history",
        "note": "1991年は代理HCも兼任。",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New Orleans Saints",
        "years": "1996",
        "sourceUrl": "https://www.neworleanssaints.com/team/history/head-coaches",
        "note": "公式歴史ページは1996年の暫定在任を明記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New Orleans Saints",
        "years": "2002–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/8/new-orleans-saints-defensive-coordinator-history",
        "note": "同データベースの表記。1996年の暫定HC記録とは別役職。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1991,
    "lastYear": 2005,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-rob-boras",
    "name": "Rob Boras",
    "records": [
      {
        "role": "OC",
        "team": "St. Louis Rams",
        "years": "2015–2016",
        "sourceUrl": "https://static.clubs.nfl.com/image/upload/bills/icolscg4klw4ivygs9ys",
        "note": "NFL資料は2015年最終4試合および2016年全シーズンをOCと記載。",
        "franchise": "Los Angeles Rams",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2015,
    "lastYear": 2016,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-rob-chudzinski",
    "name": "Rob Chudzinski",
    "records": [
      {
        "role": "OC",
        "team": "Carolina Panthers",
        "years": "2011–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/7/carolina-panthers-offensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "2013",
        "sourceUrl": "https://www.clevelandbrowns.com/team/history/head-coaches",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2007–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Indianapolis Colts",
        "years": "2016–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/7/indianapolis-colts-offensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2007,
    "lastYear": 2017,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-rob-leonard",
    "name": "Rob Leonard",
    "records": [
      {
        "role": "DC",
        "team": "Las Vegas Raiders",
        "years": "2026–2026",
        "sourceUrl": "https://www.raiders.com/team/coaches-roster/",
        "note": "2026年現行スタッフ。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-rob-ryan",
    "name": "Rob Ryan",
    "records": [
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2009–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Dallas Cowboys",
        "years": "2011–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/8/dallas-cowboys-defensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Oakland Raiders",
        "years": "2004–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/8/las-vegas-raiders-defensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New Orleans Saints",
        "years": "2013–2015",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/8/new-orleans-saints-defensive-coordinator-history",
        "note": "同データベースの表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2004,
    "lastYear": 2015,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-robert-saleh",
    "name": "Robert Saleh",
    "records": [
      {
        "role": "HC",
        "team": "New York Jets",
        "years": "2021–2024",
        "sourceUrl": "https://pro-football-history.com/franchise/3/new-york-jets-coaches",
        "note": "2024年途中解任まで。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "2017–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/8/san-francisco-49ers-defensive-coordinator-history",
        "note": "2025年の再任も同原典に記載されるが、2025年は再任期間として別途要確認のため本行は初回在任のみ。",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "2025–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/8/san-francisco-49ers-defensive-coordinator-history",
        "note": "同一人物の再任。主要原典には2025年在任とあるが、シーズン途中・正式肩書の扱いを追加確認要。",
        "franchise": "San Francisco 49ers",
        "status": "needs-review"
      },
      {
        "role": "HC",
        "team": "Tennessee Titans",
        "years": "2026–2026",
        "sourceUrl": "https://www.tennesseetitans.com/team/coaches-roster/",
        "note": "2026年1月22日就任。",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2017,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-rod-dowhower",
    "name": "Rod Dowhower",
    "records": [
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "1999–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Washington Redskins",
        "years": "1993–1993",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history",
        "note": "1992年は正式OC記録を確認できず要確認。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1993,
    "lastYear": 2001,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-rod-marinelli",
    "name": "Rod Marinelli",
    "records": [
      {
        "role": "DC",
        "team": "Chicago Bears",
        "years": "2010–2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/8/chicago-bears-defensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Dallas Cowboys",
        "years": "2014–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/8/dallas-cowboys-defensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Detroit Lions",
        "years": "2006–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/1/detroit-lions-head-coach-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2006,
    "lastYear": 2019,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-rod-rust",
    "name": "Rod Rust",
    "records": [
      {
        "role": "HC",
        "team": "New England Patriots",
        "years": "1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/1/new-england-patriots-head-coach-history",
        "note": "PFRのフランチャイズ表記では旧称Boston PatriotsとNew England Patriotsを同一フランチャイズとして扱う。",
        "franchise": "New England Patriots",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "1992–1992",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1992,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-romeo-crennel",
    "name": "Romeo Crennel",
    "records": [
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "2005–2008",
        "sourceUrl": "https://www.clevelandbrowns.com/team/history/head-coaches",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Houston Texans",
        "years": "2020–2020",
        "sourceUrl": "https://www.pro-football-reference.com/teams/htx/coaches.htm",
        "note": "2020年シーズン途中から代理HC。",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Houston Texans",
        "years": "2014–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/8/houston-texans-defensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Houston Texans",
        "years": "2018–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/8/houston-texans-defensive-coordinator-history",
        "note": "2014–2016年在任後、2018–2019年に再任。",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Kansas City Chiefs",
        "years": "2010–2012",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Kansas City Chiefs",
        "years": "2011–2012",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "2011年はTodd Haley解任後の暫定HC、2012年は正式HC。",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New England Patriots",
        "years": "2001–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/8/new-england-patriots-defensive-coordinator-history",
        "note": "役職史では2001–2004年DC。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2000,
    "lastYear": 2020,
    "sourceCount": 6,
    "verification": "partial"
  },
  {
    "id": "registry-ron-erhardt",
    "name": "Ron Erhardt",
    "records": [
      {
        "role": "OC",
        "team": "New York Giants",
        "years": "1990–1990",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/7/new-york-giants-offensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "OC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Pittsburgh Steelers",
        "years": "1992–1995",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/7/pittsburgh-steelers-offensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1996,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-ron-lynn",
    "name": "Ron Lynn",
    "records": [
      {
        "role": "DC",
        "team": "Cincinnati Bengals",
        "years": "1992–1993",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/8/cincinnati-bengals-defensive-coordinator-history",
        "note": "姓名表記 Ron Lynn。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Diego Chargers",
        "years": "1990–1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/8/los-angeles-chargers-defensive-coordinator-history",
        "note": "役職史では1986–1991。1990–91が対象範囲。",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1993,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-ron-meeks",
    "name": "Ron Meeks",
    "records": [
      {
        "role": "DC",
        "team": "Carolina Panthers",
        "years": "2009–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/8/carolina-panthers-defensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Indianapolis Colts",
        "years": "2002–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/8/indianapolis-colts-defensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2002,
    "lastYear": 2010,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-ron-meyer",
    "name": "Ron Meyer",
    "records": [
      {
        "role": "HC",
        "team": "Indianapolis Colts",
        "years": "1990–1991",
        "sourceUrl": "https://www.footballdb.com/teams/nfl/indianapolis-colts/coaches-by-season",
        "note": "1991年途中まで。1991年の後半はRick Venturiが代理HC。",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 1991,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-ron-rivera",
    "name": "Ron Rivera",
    "records": [
      {
        "role": "HC",
        "team": "Carolina Panthers",
        "years": "2011–2019",
        "sourceUrl": "https://pro-football-history.com/franchise/26/carolina-panthers-coaches",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Chicago Bears",
        "years": "2004–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/8/chicago-bears-defensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Diego Chargers",
        "years": "2009–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/8/los-angeles-chargers-defensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Washington Football Team",
        "years": "2020–2020",
        "sourceUrl": "https://pro-football-history.com/franchise/40/washington-commanders-coaches",
        "note": "2020年の当時チーム名はWashington Football Team。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Washington Football Team",
        "years": "2021–2021",
        "sourceUrl": "https://pro-football-history.com/franchise/40/washington-commanders-coaches",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Washington Commanders",
        "years": "2022–2023",
        "sourceUrl": "https://pro-football-history.com/franchise/40/washington-commanders-coaches",
        "note": "チーム名変更は2022年シーズンから。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2004,
    "lastYear": 2023,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-ron-turner",
    "name": "Ron Turner",
    "records": [
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "1993–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/7/chicago-bears-offensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "2005–2009",
        "sourceUrl": "https://www.nbcchicago.com/news/sports/nfl/chicago-bears/heres-a-record-of-the-bears-offensive-coordinators-since-2000/3323341/",
        "note": "同一人物の1993–1996在任とは別レコードとして保持。",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1993,
    "lastYear": 2009,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-ron-zook",
    "name": "Ron Zook",
    "records": [
      {
        "role": "DC",
        "team": "New Orleans Saints",
        "years": "2000–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/8/new-orleans-saints-defensive-coordinator-history",
        "note": "同データベースの表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2000,
    "lastYear": 2001,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-ronnie-joe-jones",
    "name": "Ronnie Joe Jones",
    "records": [
      {
        "role": "DC",
        "team": "Arizona Cardinals",
        "years": "1994–1995",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/8/arizona-cardinals-defensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1994,
    "lastYear": 1995,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-rusty-tillman",
    "name": "Rusty Tillman",
    "records": [
      {
        "role": "DC",
        "team": "Indianapolis Colts",
        "years": "1998",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/8/indianapolis-colts-defensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Seattle Seahawks",
        "years": "1992–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/8/seattle-seahawks-defensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tampa Bay Buccaneers",
        "years": "1995–1995",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/8/tampa-bay-buccaneers-defensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1992,
    "lastYear": 1998,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-ryan-grubb",
    "name": "Ryan Grubb",
    "records": [
      {
        "role": "OC",
        "team": "Seattle Seahawks",
        "years": "2024–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/7/seattle-seahawks-offensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2024,
    "lastYear": 2024,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-ryan-nielsen",
    "name": "Ryan Nielsen",
    "records": [
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "2023–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "当該原典では2023年単年",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Jacksonville Jaguars",
        "years": "2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/8/jacksonville-jaguars-defensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2023,
    "lastYear": 2024,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-sam-wyche",
    "name": "Sam Wyche",
    "records": [
      {
        "role": "HC",
        "team": "Cincinnati Bengals",
        "years": "1990–1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/1/cincinnati-bengals-head-coach-history",
        "note": "1990–91。姓名表記 Sam Wyche。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Tampa Bay Buccaneers",
        "years": "1992–1995",
        "sourceUrl": "https://pro-football-history.com/franchise/25/tampa-bay-buccaneers-coaches",
        "note": "姓名の正式表記はSamuel David Wyche。",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 1995,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-scott-linehan",
    "name": "Scott Linehan",
    "records": [
      {
        "role": "OC",
        "team": "Dallas Cowboys",
        "years": "2015–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/20/7/dallas-cowboys-offensive-coordinator-history",
        "note": "",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "2009–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "HC",
        "team": "St. Louis Rams",
        "years": "2006–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/1/los-angeles-rams-head-coach-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Miami Dolphins",
        "years": "2005–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "2002–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2002,
    "lastYear": 2018,
    "sourceCount": 5,
    "verification": "partial"
  },
  {
    "id": "registry-scott-turner",
    "name": "Scott Turner",
    "records": [
      {
        "role": "OC",
        "team": "Washington Football Team",
        "years": "2020–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history",
        "note": "2020–2021はWashington Football Team。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Washington Commanders",
        "years": "2022–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history",
        "note": "同一人物の2020–2021在任記録と統合可能。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2020,
    "lastYear": 2022,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-sean-desai",
    "name": "Sean Desai",
    "records": [
      {
        "role": "DC",
        "team": "Chicago Bears",
        "years": "2021–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/8/chicago-bears-defensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Philadelphia Eagles",
        "years": "2023–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/8/philadelphia-eagles-defensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2021,
    "lastYear": 2023,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-sean-duggan",
    "name": "Sean Duggan",
    "records": [
      {
        "role": "DC",
        "team": "Miami Dolphins",
        "years": "2026–2026",
        "sourceUrl": "https://www.miamidolphins.com/team/coaches-roster/",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-sean-mannion",
    "name": "Sean Mannion",
    "records": [
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "2026–2026",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "2026年は同原典が現職として記載。",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-sean-mcdermott",
    "name": "Sean McDermott",
    "records": [
      {
        "role": "HC",
        "team": "Buffalo Bills",
        "years": "2017–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/1/buffalo-bills-head-coach-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Carolina Panthers",
        "years": "2011–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/8/carolina-panthers-defensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Philadelphia Eagles",
        "years": "2009–2010",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/8/philadelphia-eagles-defensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2009,
    "lastYear": 2025,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-sean-mcvay",
    "name": "Sean McVay",
    "records": [
      {
        "role": "HC",
        "team": "Los Angeles Rams",
        "years": "2017–2026",
        "sourceUrl": "https://www.therams.com/team/coaches-roster/",
        "note": "2017年就任。公式ページはフランチャイズ23人目のフルタイムHCと記載。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Washington Redskins",
        "years": "2014–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2014,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-sean-payton",
    "name": "Sean Payton",
    "records": [
      {
        "role": "HC",
        "team": "Denver Broncos",
        "years": "2023–2026",
        "sourceUrl": "https://www.denverbroncos.com/team/coaches-roster/",
        "note": "2026年は当該NFLシーズンの現職として記録。",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New Orleans Saints",
        "years": "2006–2011",
        "sourceUrl": "https://www.neworleanssaints.com/team/history/head-coaches",
        "note": "公式ページが在任を2006–2011と2013–2021に分割掲載。姓名の別表記Sean Paytonは同一人物。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New Orleans Saints",
        "years": "2013–2021",
        "sourceUrl": "https://www.neworleanssaints.com/team/history/head-coaches",
        "note": "公式ページの表記。2012年は在任記録が分割されているため別エントリ化。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Giants",
        "years": "2000–2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/7/new-york-giants-offensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2000,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-shane-bowen",
    "name": "Shane Bowen",
    "records": [
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "2024–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tennessee Titans",
        "years": "2021–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/8/tennessee-titans-defensive-coordinator-history",
        "note": "2020年は正式DCとしての記録未確認。",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2021,
    "lastYear": 2025,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-shane-steichen",
    "name": "Shane Steichen",
    "records": [
      {
        "role": "HC",
        "team": "Indianapolis Colts",
        "years": "2023–2026",
        "sourceUrl": "https://www.colts.com/team/coaches-roster/shane-steichen",
        "note": "公式には2023年2月14日就任。2026年シーズンは原典上掲載されているが、シーズン完了後の確定記録ではない。",
        "franchise": "Indianapolis Colts",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Los Angeles Chargers",
        "years": "2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "2021–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2020,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-shane-waldron",
    "name": "Shane Waldron",
    "records": [
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "2024–2024",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/7/chicago-bears-offensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Seattle Seahawks",
        "years": "2021–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/7/seattle-seahawks-offensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2021,
    "lastYear": 2024,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-sherman-lewis",
    "name": "Sherman Lewis",
    "records": [
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "2003–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Green Bay Packers",
        "years": "1992–1999",
        "sourceUrl": "https://www.packers.com/news/green-bay-tabs-jagodzinski-as-offensive-coordinator-2452561",
        "note": "Packers公式報道がLewisを1992–99年のOCとして明記。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "2000–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1992,
    "lastYear": 2004,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-sherman-smith",
    "name": "Sherman Smith",
    "records": [
      {
        "role": "OC",
        "team": "Washington Redskins",
        "years": "2008–2009",
        "sourceUrl": "https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2008,
    "lastYear": 2009,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-steve-crosby",
    "name": "Steve Crosby",
    "records": [
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "1994–1995",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1994,
    "lastYear": 1995,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-steve-fairchild",
    "name": "Steve Fairchild",
    "records": [
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "2006–2007",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "St. Louis Rams",
        "years": "2003–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2003,
    "lastYear": 2007,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-steve-loney",
    "name": "Steve Loney",
    "records": [
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2005,
    "lastYear": 2005,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-steve-mariucci",
    "name": "Steve Mariucci",
    "records": [
      {
        "role": "HC",
        "team": "Detroit Lions",
        "years": "2003–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/1/detroit-lions-head-coach-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "San Francisco 49ers",
        "years": "1997–2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/1/san-francisco-49ers-head-coach-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1997,
    "lastYear": 2005,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-steve-sarkisian",
    "name": "Steve Sarkisian",
    "records": [
      {
        "role": "OC",
        "team": "Atlanta Falcons",
        "years": "2017–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/7/atlanta-falcons-offensive-coordinator-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2017,
    "lastYear": 2018,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-steve-sidwell",
    "name": "Steve Sidwell",
    "records": [
      {
        "role": "DC",
        "team": "New England Patriots",
        "years": "1997–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/8/new-england-patriots-defensive-coordinator-history",
        "note": "役職史では1997–1999年DC。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "New Orleans Saints",
        "years": "1990–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/8/new-orleans-saints-defensive-coordinator-history",
        "note": "同データベースは1986–1994。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Seattle Seahawks",
        "years": "2000–2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/8/seattle-seahawks-defensive-coordinator-history",
        "note": "",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Houston Oilers",
        "years": "1995–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/8/tennessee-titans-defensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 2002,
    "sourceCount": 4,
    "verification": "partial"
  },
  {
    "id": "registry-steve-spagnuolo",
    "name": "Steve Spagnuolo",
    "records": [
      {
        "role": "DC",
        "team": "Kansas City Chiefs",
        "years": "2019–2026",
        "sourceUrl": "https://www.chiefs.com/team/coaches-roster/steve-spagnuolo",
        "note": "2019就任。2026は公式現行掲載。",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "St. Louis Rams",
        "years": "2009–2011",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/1/los-angeles-rams-head-coach-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New Orleans Saints",
        "years": "2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/8/new-orleans-saints-defensive-coordinator-history",
        "note": "同データベースの表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "2007–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history",
        "note": "2015–2017にも再任。",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "2015–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history",
        "note": "2007–2008にも在任。",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2007,
    "lastYear": 2026,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-steve-spurrier",
    "name": "Steve Spurrier",
    "records": [
      {
        "role": "HC",
        "team": "Washington Redskins",
        "years": "2002–2003",
        "sourceUrl": "https://pro-football-history.com/franchise/40/washington-commanders-coaches",
        "note": "",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2002,
    "lastYear": 2003,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-steve-wilks",
    "name": "Steve Wilks",
    "records": [
      {
        "role": "HC",
        "team": "Arizona Cardinals",
        "years": "2018–2018",
        "sourceUrl": "https://www.azcardinals.com/news/as-cardinals-coaching-search-continues-a-look-at-past-timelines",
        "note": "公式歴代HC記事で確認。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Carolina Panthers",
        "years": "2022",
        "sourceUrl": "https://pro-football-history.com/franchise/26/carolina-panthers-coaches",
        "note": "2022年の暫定HC。",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Carolina Panthers",
        "years": "2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/8/carolina-panthers-defensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Jets",
        "years": "2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/8/new-york-jets-defensive-coordinator-history",
        "note": "DC履歴一覧および年次記録に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "2023–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/8/san-francisco-49ers-defensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2017,
    "lastYear": 2025,
    "sourceCount": 6,
    "verification": "source-linked"
  },
  {
    "id": "registry-sylvester-croom",
    "name": "Sylvester Croom",
    "records": [
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "1997–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1997,
    "lastYear": 2000,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-tanner-engstrand",
    "name": "Tanner Engstrand",
    "records": [
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "PFR年次記録と照合。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2025,
    "lastYear": 2025,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-ted-cottrell",
    "name": "Ted Cottrell",
    "records": [
      {
        "role": "DC",
        "team": "Buffalo Bills",
        "years": "1998–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/8/buffalo-bills-defensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Diego Chargers",
        "years": "2007–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/8/los-angeles-chargers-defensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Minnesota Vikings",
        "years": "2004–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/8/minnesota-vikings-defensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Jets",
        "years": "2001–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/8/new-york-jets-defensive-coordinator-history",
        "note": "DC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1998,
    "lastYear": 2008,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-ted-marchibroda",
    "name": "Ted Marchibroda",
    "records": [
      {
        "role": "HC",
        "team": "Baltimore Ravens",
        "years": "1996–1998",
        "sourceUrl": "https://www.pro-football-reference.com/teams/rav/coaches.htm",
        "note": "フランチャイズ初代HC。1990–1995年はBaltimore RavensとしてのNFLシーズンが存在せず、移転前Cleveland Brownsの記録とは統合していない。",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "1990–1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "原資料の在任期間は1989–1991。",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Indianapolis Colts",
        "years": "1992–1995",
        "sourceUrl": "https://pro-football-history.com/franchise/31/indianapolis-colts-coaches",
        "note": "移転前Baltimore Colts時代の同名人物と統合可能。",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 1998,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-ted-monachino",
    "name": "Ted Monachino",
    "records": [
      {
        "role": "DC",
        "team": "Indianapolis Colts",
        "years": "2016–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/8/indianapolis-colts-defensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2016,
    "lastYear": 2017,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-ted-tollner",
    "name": "Ted Tollner",
    "records": [
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "San Diego Chargers",
        "years": "1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "San Francisco 49ers",
        "years": "2004–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/7/san-francisco-49ers-offensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1991,
    "lastYear": 2005,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-terrell-williams",
    "name": "Terrell Williams",
    "records": [
      {
        "role": "DC",
        "team": "New England Patriots",
        "years": "2025–2026",
        "sourceUrl": "https://pro-football-history.com/franchpos/6/8/new-england-patriots-defensive-coordinator-history",
        "note": "役職史では2025年就任、2026年も在任。",
        "franchise": "New England Patriots",
        "status": "needs-review"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2025,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-terry-robiskie",
    "name": "Terry Robiskie",
    "records": [
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "2004",
        "sourceUrl": "https://www.clevelandbrowns.com/team/history/head-coaches",
        "note": "2004年途中のinterim head coach。Butch Davisと同一シーズン内で重複。",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Los Angeles Raiders",
        "years": "1990–1993",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "同ページは1989–93をLos Angeles Raidersとして掲載。1990–93分を採用。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tennessee Titans",
        "years": "2016–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Washington Redskins",
        "years": "2000–2000",
        "sourceUrl": "https://pro-football-history.com/franchise/40/washington-commanders-coaches",
        "note": "2000年シーズン途中の代理HC。Norv Turnerの在任と重複するため、正式なシーズン単位HC記録との境界は要確認。",
        "franchise": "Washington Commanders",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 1990,
    "lastYear": 2017,
    "sourceCount": 5,
    "verification": "source-linked"
  },
  {
    "id": "registry-terry-shea",
    "name": "Terry Shea",
    "records": [
      {
        "role": "OC",
        "team": "Chicago Bears",
        "years": "2004–2004",
        "sourceUrl": "https://www.nbcchicago.com/news/sports/nfl/chicago-bears/heres-a-record-of-the-bears-offensive-coordinators-since-2000/3323341/",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2004,
    "lastYear": 2004,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-teryl-austin",
    "name": "Teryl Austin",
    "records": [
      {
        "role": "DC",
        "team": "Cincinnati Bengals",
        "years": "2018–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/8/cincinnati-bengals-defensive-coordinator-history",
        "note": "姓名表記 Teryl Austin。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "2014–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Pittsburgh Steelers",
        "years": "2022–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/8/pittsburgh-steelers-defensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2014,
    "lastYear": 2025,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-thomas-brown",
    "name": "Thomas Brown",
    "records": [
      {
        "role": "OC",
        "team": "Carolina Panthers",
        "years": "2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/7/carolina-panthers-offensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Chicago Bears",
        "years": "2024–2024",
        "sourceUrl": "https://www.jt-sw.com/football/pro/teams.nsf/histories/bears",
        "note": "2024年残り5試合のinterim HC。フランチャイズ公式のfull-time HC原簿とは別扱い。",
        "franchise": "Chicago Bears",
        "status": "needs-review"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2023,
    "lastYear": 2024,
    "sourceCount": 2,
    "verification": "partial"
  },
  {
    "id": "registry-tim-kelly",
    "name": "Tim Kelly",
    "records": [
      {
        "role": "OC",
        "team": "Houston Texans",
        "years": "2019–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/7/houston-texans-offensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Giants",
        "years": "2025–2025",
        "sourceUrl": "https://bigblueinteractive.com/information-pages/new-york-giants-coaching-staff/",
        "note": "2025年のinterim OCとして記載。Mike Kafkaとの役割分担の正式な期間は要確認。",
        "franchise": "New York Giants",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Tennessee Titans",
        "years": "2023–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2019,
    "lastYear": 2025,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-tim-lewis",
    "name": "Tim Lewis",
    "records": [
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "2004–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Pittsburgh Steelers",
        "years": "2000–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/8/pittsburgh-steelers-defensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2000,
    "lastYear": 2006,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-tim-walton",
    "name": "Tim Walton",
    "records": [
      {
        "role": "DC",
        "team": "St. Louis Rams",
        "years": "2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "St. Louis時代。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2013,
    "lastYear": 2013,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-todd-bowles",
    "name": "Todd Bowles",
    "records": [
      {
        "role": "DC",
        "team": "Arizona Cardinals",
        "years": "2013–2014",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/8/arizona-cardinals-defensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Jets",
        "years": "2015–2018",
        "sourceUrl": "https://www.newyorkjets.com/history/coaching-history/",
        "note": "公式ページの2015–2018表記。",
        "franchise": "New York Jets",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Tampa Bay Buccaneers",
        "years": "2022–2026",
        "sourceUrl": "https://www.buccaneers.com/team/coaches-roster/todd-bowles",
        "note": "2026シーズン時点の現職。",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Tampa Bay Buccaneers",
        "years": "2019–2021",
        "sourceUrl": "https://www.buccaneers.com/team/coaches-roster/todd-bowles",
        "note": "HC就任前のDC在任。",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2013,
    "lastYear": 2026,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-todd-downing",
    "name": "Todd Downing",
    "records": [
      {
        "role": "OC",
        "team": "Oakland Raiders",
        "years": "2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tennessee Titans",
        "years": "2021–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history",
        "note": "",
        "franchise": "Tennessee Titans (Houston Oilers)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2017,
    "lastYear": 2022,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-todd-grantham",
    "name": "Todd Grantham",
    "records": [
      {
        "role": "DC",
        "team": "Cleveland Browns",
        "years": "2005–2007",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2005,
    "lastYear": 2007,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-todd-haley",
    "name": "Todd Haley",
    "records": [
      {
        "role": "OC",
        "team": "Arizona Cardinals",
        "years": "2007–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/7/arizona-cardinals-offensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Kansas City Chiefs",
        "years": "2009–2011",
        "sourceUrl": "https://pro-football-reference.com/teams/kan/coaches.htm",
        "note": "2011年途中まで。",
        "franchise": "Kansas City Chiefs",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Pittsburgh Steelers",
        "years": "2012–2017",
        "sourceUrl": "https://pro-football-history.com/franchpos/37/7/pittsburgh-steelers-offensive-coordinator-history",
        "note": "",
        "franchise": "Pittsburgh Steelers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2007,
    "lastYear": 2018,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-todd-monken",
    "name": "Todd Monken",
    "records": [
      {
        "role": "OC",
        "team": "Baltimore Ravens",
        "years": "2023–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/7/baltimore-ravens-offensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Cleveland Browns",
        "years": "2026",
        "sourceUrl": "https://www.clevelandbrowns.com/team/coaches-roster/",
        "note": "2026年1月28日就任。",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2019",
        "sourceUrl": "https://www.clevelandbrowns.com/news/todd-monken-named-browns-head-coach",
        "note": "公式報道が2019年OC在任を明記。",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "2016–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/25/7/tampa-bay-buccaneers-offensive-coordinator-history",
        "note": "",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2016,
    "lastYear": 2026,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-todd-wash",
    "name": "Todd Wash",
    "records": [
      {
        "role": "DC",
        "team": "Jacksonville Jaguars",
        "years": "2016–2020",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/8/jacksonville-jaguars-defensive-coordinator-history",
        "note": "",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2016,
    "lastYear": 2020,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-tom-bresnahan",
    "name": "Tom Bresnahan",
    "records": [
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "1992–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1992,
    "lastYear": 1996,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-tom-cable",
    "name": "Tom Cable",
    "records": [
      {
        "role": "HC",
        "team": "Oakland Raiders",
        "years": "2008–2010",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "2008年はLane Kiffinとのシーズン内交代を含む。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2008,
    "lastYear": 2010,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-tom-catlin",
    "name": "Tom Catlin",
    "records": [
      {
        "role": "DC",
        "team": "Seattle Seahawks",
        "years": "1990–1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/24/8/seattle-seahawks-defensive-coordinator-history",
        "note": "同資料では1983–1991。1990–1991シーズン部分を収録。",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1991,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-tom-clements",
    "name": "Tom Clements",
    "records": [
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "2004–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2004,
    "lastYear": 2005,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-tom-coughlin",
    "name": "Tom Coughlin",
    "records": [
      {
        "role": "HC",
        "team": "Jacksonville Jaguars",
        "years": "1995–2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/1/jacksonville-jaguars-head-coach-history",
        "note": "Jaguars初代HC。",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "New York Giants",
        "years": "2004–2015",
        "sourceUrl": "https://www.pro-football-reference.com/teams/nyg/coaches.htm",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1995,
    "lastYear": 2015,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-tom-flores",
    "name": "Tom Flores",
    "records": [
      {
        "role": "HC",
        "team": "Seattle Seahawks",
        "years": "1992–1994",
        "sourceUrl": "https://www.seahawks.com/team/coaches-roster/all-time/",
        "note": "公式歴代コーチ一覧では在任1992–1994。",
        "franchise": "Seattle Seahawks",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1992,
    "lastYear": 1994,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-tom-moore",
    "name": "Tom Moore",
    "records": [
      {
        "role": "OC",
        "team": "Detroit Lions",
        "years": "1995–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "OC",
        "team": "Indianapolis Colts",
        "years": "1998–2009",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/7/indianapolis-colts-offensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "1991",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1991,
    "lastYear": 2009,
    "sourceCount": 3,
    "verification": "partial"
  },
  {
    "id": "registry-tom-olivadotti",
    "name": "Tom Olivadotti",
    "records": [
      {
        "role": "DC",
        "team": "Miami Dolphins",
        "years": "1990–1995",
        "sourceUrl": "https://www.pro-football-reference.com/teams/mia/1990.htm",
        "note": "PFRは1990–1995をDCとする一方、別の履歴集約ではGeorge Hillが1995年からとされるため、1995年の交代時期・正式肩書は要確認。",
        "franchise": "Miami Dolphins",
        "status": "needs-review"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1995,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-tom-rossley",
    "name": "Tom Rossley",
    "records": [
      {
        "role": "OC",
        "team": "Green Bay Packers",
        "years": "2000–2005",
        "sourceUrl": "https://www.packers.com/news/green-bay-tabs-jagodzinski-as-offensive-coordinator-2452561",
        "note": "Packers公式報道がRossleyを2000–05年のOCとして明記。",
        "franchise": "Green Bay Packers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2000,
    "lastYear": 2005,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-tom-walsh",
    "name": "Tom Walsh",
    "records": [
      {
        "role": "OC",
        "team": "Oakland Raiders",
        "years": "2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2006,
    "lastYear": 2006,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-tommy-rees",
    "name": "Tommy Rees",
    "records": [
      {
        "role": "OC",
        "team": "Atlanta Falcons",
        "years": "2026–2026",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/7/atlanta-falcons-offensive-coordinator-history",
        "note": "2026シーズンの現職記録",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history",
        "note": "",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2025,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-tony-dungy",
    "name": "Tony Dungy",
    "records": [
      {
        "role": "HC",
        "team": "Indianapolis Colts",
        "years": "2002–2008",
        "sourceUrl": "https://www.colts.com/team/history/hall-of-fame/tony-dungy",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Minnesota Vikings",
        "years": "1992–1995",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/8/minnesota-vikings-defensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Tampa Bay Buccaneers",
        "years": "1996–2001",
        "sourceUrl": "https://pro-football-history.com/franchise/25/tampa-bay-buccaneers-coaches",
        "note": "正式名Anthony Kevin Dungy。",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1992,
    "lastYear": 2008,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-tony-sparano",
    "name": "Tony Sparano",
    "records": [
      {
        "role": "HC",
        "team": "Oakland Raiders",
        "years": "2014",
        "sourceUrl": "https://www.raiders.com/history/coaching-history",
        "note": "Dennis Allen解任後の代理HC。公式歴史ページ掲載。",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Miami Dolphins",
        "years": "2008–2011",
        "sourceUrl": "https://www.pro-football-reference.com/teams/mia/coaches.htm",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "New York Jets",
        "years": "2012",
        "sourceUrl": "https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history",
        "note": "OC履歴一覧に基づく。",
        "franchise": "New York Jets",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "OC"
    ],
    "firstYear": 2008,
    "lastYear": 2014,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-travis-switzer",
    "name": "Travis Switzer",
    "records": [
      {
        "role": "OC",
        "team": "Cleveland Browns",
        "years": "2026",
        "sourceUrl": "https://www.clevelandbrowns.com/team/coaches-roster/",
        "note": "公式現行コーチ rosterでOC。",
        "franchise": "Cleveland Browns",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2026,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-troy-calhoun",
    "name": "Troy Calhoun",
    "records": [
      {
        "role": "OC",
        "team": "Houston Texans",
        "years": "2006–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/7/houston-texans-offensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2006,
    "lastYear": 2006,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-turk-schonert",
    "name": "Turk Schonert",
    "records": [
      {
        "role": "OC",
        "team": "Buffalo Bills",
        "years": "2008–2008",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2008,
    "lastYear": 2008,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-urban-meyer",
    "name": "Urban Meyer",
    "records": [
      {
        "role": "HC",
        "team": "Jacksonville Jaguars",
        "years": "2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/27/1/jacksonville-jaguars-head-coach-history",
        "note": "シーズン途中解任。",
        "franchise": "Jacksonville Jaguars",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2021,
    "lastYear": 2021,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-vance-joseph",
    "name": "Vance Joseph",
    "records": [
      {
        "role": "DC",
        "team": "Arizona Cardinals",
        "years": "2019–2022",
        "sourceUrl": "https://pro-football-history.com/franchpos/50/8/arizona-cardinals-defensive-coordinator-history",
        "note": "",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Denver Broncos",
        "years": "2017–2018",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "2023年以降はDCとして復帰。",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Denver Broncos",
        "years": "2023–2026",
        "sourceUrl": "https://www.denverbroncos.com/team/coaches-roster/vance-joseph",
        "note": "公式プロフィールが2023年採用、2025年に3年目DCと記載。2026年も公式スタッフページ掲載。",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Miami Dolphins",
        "years": "2016–2016",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/8/miami-dolphins-defensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 2016,
    "lastYear": 2026,
    "sourceCount": 4,
    "verification": "source-linked"
  },
  {
    "id": "registry-vic-fangio",
    "name": "Vic Fangio",
    "records": [
      {
        "role": "DC",
        "team": "Carolina Panthers",
        "years": "1995–1998",
        "sourceUrl": "https://pro-football-history.com/franchpos/26/8/carolina-panthers-defensive-coordinator-history",
        "note": "",
        "franchise": "Carolina Panthers",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Chicago Bears",
        "years": "2015–2018",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/8/chicago-bears-defensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Denver Broncos",
        "years": "2019–2021",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Houston Texans",
        "years": "2002–2005",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/8/houston-texans-defensive-coordinator-history",
        "note": "",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Indianapolis Colts",
        "years": "1999–2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/8/indianapolis-colts-defensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Miami Dolphins",
        "years": "2023–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/19/8/miami-dolphins-defensive-coordinator-history",
        "note": "",
        "franchise": "Miami Dolphins",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Philadelphia Eagles",
        "years": "2024–2026",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/8/philadelphia-eagles-defensive-coordinator-history",
        "note": "2026年は同原典が現職在任として記載。",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "2011–2014",
        "sourceUrl": "https://www.49ers.com/news/every-49ers-defensive-coordinator-since-george-seifert-14857597",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1995,
    "lastYear": 2026,
    "sourceCount": 8,
    "verification": "source-linked"
  },
  {
    "id": "registry-vince-tobin",
    "name": "Vince Tobin",
    "records": [
      {
        "role": "HC",
        "team": "Arizona Cardinals",
        "years": "1996–2000",
        "sourceUrl": "https://www.pro-football-reference.com/teams/crd/coaches.htm",
        "note": "2000年途中にDave McGinnisが暫定HCに就任したため、シーズン内の重複・正式在任境界は要確認。",
        "franchise": "Arizona Cardinals",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Chicago Bears",
        "years": "1990–1992",
        "sourceUrl": "https://pro-football-history.com/franchpos/46/8/chicago-bears-defensive-coordinator-history",
        "note": "",
        "franchise": "Chicago Bears",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "2001",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history",
        "note": "",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Indianapolis Colts",
        "years": "1994–1995",
        "sourceUrl": "https://pro-football-history.com/franchpos/31/8/indianapolis-colts-defensive-coordinator-history",
        "note": "",
        "franchise": "Indianapolis Colts",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 2001,
    "sourceCount": 4,
    "verification": "partial"
  },
  {
    "id": "registry-wade-phillips",
    "name": "Wade Phillips",
    "records": [
      {
        "role": "DC",
        "team": "Atlanta Falcons",
        "years": "2002–2003",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Buffalo Bills",
        "years": "1998–2000",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/1/buffalo-bills-head-coach-history",
        "note": "",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Buffalo Bills",
        "years": "1995–1997",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/8/buffalo-bills-defensive-coordinator-history",
        "note": "HC就任前のDC在任。",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Dallas Cowboys",
        "years": "2007–2010",
        "sourceUrl": "https://www.dallascowboys.com/news/rank-em-head-coaches-in-cowboys-history",
        "note": "2010年シーズン途中まで。",
        "franchise": "Dallas Cowboys",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Dallas Cowboys",
        "years": "2009–2010",
        "sourceUrl": "https://www.espn.com/nfl/story/_/id/39487438/mike-zimmer-rejoin-cowboys-defensive-coordinator-source-says",
        "note": "HC兼任下の実質・正式肩書の区別を、今回確認できた主要原典だけでは確定できなかったため要確認。",
        "franchise": "Dallas Cowboys",
        "status": "needs-review"
      },
      {
        "role": "HC",
        "team": "Denver Broncos",
        "years": "1993–1994",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "同人物は1990–1992年にDCも兼任。",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Denver Broncos",
        "years": "1990–1992",
        "sourceUrl": "https://www.denverbroncos.com/news/phillips-to-be-defensive-coordinator-14857688",
        "note": "公式記事が1989–1992年のDenver DC在任を明記。",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Denver Broncos",
        "years": "2015–2016",
        "sourceUrl": "https://www.denverbroncos.com/news/phillips-to-be-defensive-coordinator-14857688",
        "note": "公式記事が2015年の再任を報じ、2016年までの在任をPFRが記録。",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "HC",
        "team": "Houston Texans",
        "years": "2013–2013",
        "sourceUrl": "https://www.pro-football-reference.com/teams/htx/coaches.htm",
        "note": "Gary Kubiak解任後の2013年シーズン終盤に代理HCを務めた3試合。正式なシーズンHC記録との扱いは要確認。",
        "franchise": "Houston Texans",
        "status": "needs-review"
      },
      {
        "role": "DC",
        "team": "Houston Texans",
        "years": "2011–2013",
        "sourceUrl": "https://pro-football-history.com/franchpos/29/8/houston-texans-defensive-coordinator-history",
        "note": "2013年はHC代理との兼務期間を含む可能性があるため、職務分掌の詳細は要確認。",
        "franchise": "Houston Texans",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "San Diego Chargers",
        "years": "2004–2006",
        "sourceUrl": "https://pro-football-history.com/franchpos/15/8/los-angeles-chargers-defensive-coordinator-history",
        "note": "",
        "franchise": "Los Angeles Chargers (San Diego Chargers)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Los Angeles Rams",
        "years": "2017–2019",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "ロサンゼルス復帰後。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC",
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 2019,
    "sourceCount": 11,
    "verification": "partial"
  },
  {
    "id": "registry-walt-corey",
    "name": "Walt Corey",
    "records": [
      {
        "role": "DC",
        "team": "Buffalo Bills",
        "years": "1990–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/7/8/buffalo-bills-defensive-coordinator-history",
        "note": "原資料の在任期間は1987–1994。",
        "franchise": "Buffalo Bills",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1994,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-wayne-fontes",
    "name": "Wayne Fontes",
    "records": [
      {
        "role": "HC",
        "team": "Detroit Lions",
        "years": "1990–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/1/detroit-lions-head-coach-history",
        "note": "1990–1996は同一在任期間1989–1996を対象範囲に切り出したもの。",
        "franchise": "Detroit Lions",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 1990,
    "lastYear": 1996,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-wes-phillips",
    "name": "Wes Phillips",
    "records": [
      {
        "role": "OC",
        "team": "Minnesota Vikings",
        "years": "2022–2026",
        "sourceUrl": "https://www.vikings.com/team/coaches-roster/",
        "note": "公式スタッフ表で2026年もOC。",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2022,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-willie-shaw",
    "name": "Willie Shaw",
    "records": [
      {
        "role": "DC",
        "team": "Oakland Raiders",
        "years": "1998–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/17/8/las-vegas-raiders-defensive-coordinator-history",
        "note": "",
        "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "St. Louis Rams",
        "years": "1995–1996",
        "sourceUrl": "https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history",
        "note": "移転後名称。",
        "franchise": "Los Angeles Rams",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Minnesota Vikings",
        "years": "2002",
        "sourceUrl": "https://pro-football-history.com/franchpos/21/8/minnesota-vikings-defensive-coordinator-history",
        "note": "",
        "franchise": "Minnesota Vikings",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1995,
    "lastYear": 2002,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-willy-robinson",
    "name": "Willy Robinson",
    "records": [
      {
        "role": "DC",
        "team": "San Francisco 49ers",
        "years": "2004–2004",
        "sourceUrl": "https://pro-football-history.com/franchpos/1/8/san-francisco-49ers-defensive-coordinator-history",
        "note": "",
        "franchise": "San Francisco 49ers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2004,
    "lastYear": 2004,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-wink-martindale",
    "name": "Wink Martindale",
    "records": [
      {
        "role": "DC",
        "team": "Baltimore Ravens",
        "years": "2018–2021",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/8/baltimore-ravens-defensive-coordinator-history",
        "note": "別表記・通称としてWink Martindale。人物統合時はDon Martindale/Wink Martindaleを同一人物として扱う。",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "Denver Broncos",
        "years": "2010",
        "sourceUrl": "https://www.pro-football-reference.com/teams/den/coaches.htm",
        "note": "",
        "franchise": "Denver Broncos",
        "status": "source-linked"
      },
      {
        "role": "DC",
        "team": "New York Giants",
        "years": "2022–2023",
        "sourceUrl": "https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history",
        "note": "",
        "franchise": "New York Giants",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2010,
    "lastYear": 2023,
    "sourceCount": 3,
    "verification": "source-linked"
  },
  {
    "id": "registry-woody-widenhofer",
    "name": "Woody Widenhofer",
    "records": [
      {
        "role": "DC",
        "team": "Detroit Lions",
        "years": "1990–1992",
        "sourceUrl": "https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history",
        "note": "同ページの在任期間1989–1992を対象範囲に切り出し。歴史的肩書の一次資料による再確認が望ましい。",
        "franchise": "Detroit Lions",
        "status": "needs-review"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1990,
    "lastYear": 1992,
    "sourceCount": 1,
    "verification": "partial"
  },
  {
    "id": "registry-zac-robinson",
    "name": "Zac Robinson",
    "records": [
      {
        "role": "OC",
        "team": "Atlanta Falcons",
        "years": "2024–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/22/7/atlanta-falcons-offensive-coordinator-history",
        "note": "フランチャイズ内の表記統合対象なし",
        "franchise": "Atlanta Falcons",
        "status": "source-linked"
      },
      {
        "role": "OC",
        "team": "Tampa Bay Buccaneers",
        "years": "2026–2026",
        "sourceUrl": "https://www.buccaneers.com/team/coaches-roster/",
        "note": "2026シーズンの現職。",
        "franchise": "Tampa Bay Buccaneers",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 2024,
    "lastYear": 2026,
    "sourceCount": 2,
    "verification": "source-linked"
  },
  {
    "id": "registry-zac-taylor",
    "name": "Zac Taylor",
    "records": [
      {
        "role": "HC",
        "team": "Cincinnati Bengals",
        "years": "2019–2026",
        "sourceUrl": "https://pro-football-history.com/franchpos/2/1/cincinnati-bengals-head-coach-history",
        "note": "2026年公式スタッフ一覧でもHC。",
        "franchise": "Cincinnati Bengals",
        "status": "source-linked"
      }
    ],
    "roles": [
      "HC"
    ],
    "firstYear": 2019,
    "lastYear": 2026,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-zach-orr",
    "name": "Zach Orr",
    "records": [
      {
        "role": "DC",
        "team": "Baltimore Ravens",
        "years": "2024–2025",
        "sourceUrl": "https://pro-football-history.com/franchpos/28/8/baltimore-ravens-defensive-coordinator-history",
        "note": "",
        "franchise": "Baltimore Ravens",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 2024,
    "lastYear": 2025,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-zaven-yaralian",
    "name": "Zaven Yaralian",
    "records": [
      {
        "role": "DC",
        "team": "New Orleans Saints",
        "years": "1997–1999",
        "sourceUrl": "https://pro-football-history.com/franchpos/23/8/new-orleans-saints-defensive-coordinator-history",
        "note": "同データベースの表記。",
        "franchise": "New Orleans Saints",
        "status": "source-linked"
      }
    ],
    "roles": [
      "DC"
    ],
    "firstYear": 1997,
    "lastYear": 1999,
    "sourceCount": 1,
    "verification": "source-linked"
  },
  {
    "id": "registry-zeke-bratkowski",
    "name": "Zeke Bratkowski",
    "records": [
      {
        "role": "OC",
        "team": "Philadelphia Eagles",
        "years": "1993–1994",
        "sourceUrl": "https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history",
        "note": "",
        "franchise": "Philadelphia Eagles",
        "status": "source-linked"
      }
    ],
    "roles": [
      "OC"
    ],
    "firstYear": 1993,
    "lastYear": 1994,
    "sourceCount": 1,
    "verification": "source-linked"
  }
];

export const registryCoaches = allRegistryCoaches.filter((coach) => coach.roles.includes("HC") && coach.name !== "Darrell Bevell");

export const registryStats = {
  "people": registryCoaches.length,
  "roleRecords": registryCoaches.flatMap((coach) => coach.records).length,
  "sourceLinkedRoleRecords": registryCoaches.flatMap((coach) => coach.records).filter((record) => record.status === "source-linked").length,
  "sourceRowsBeforeDeduplication": registryCoaches.flatMap((coach) => coach.records).length,
  "needsReviewRows": registryCoaches.flatMap((coach) => coach.records).filter((record) => record.status === "needs-review").length,
  "franchises": 32,
  "generatedFrom": "2026-08-19"
} as const;

export const registryTeamAudit: RegistryTeamAudit[] = [
  {
    "franchise": "Arizona Cardinals",
    "confirmedRows": 38,
    "reviewRows": 1,
    "coverageNote": "1990年から2026年シーズン（2026年は現時点の現職・発表済み記録）を確認した。HCは公式Cardinals記事とPFR、OC/DCはPFR年次記録とフランチャイズ職位履歴を突合した。1997年OCのDick Jamieson、2000年HCのDave McGinnisは資料上の境界・暫定就任を注記した。2019–2022年のOCは正式なOCとして確認できず、攻撃担当・パスゲーム担当等をOCとして推測していない。共同コーディネーター、代理HC、未確認の役職は推測で補完していない。Phoenix Cardinals（1990–1993）とArizona Cardinals（1994–）は同一フランチャイズとして統合可能な注記を付した。",
    "sourceSummary": "主要原典はArizona Cardinals公式の歴代HCタイムライン（https://www.azcardinals.com/news/as-cardinals-coaching-search-continues-a-look-at-past-timelines）と現行コーチ名簿（https://www.azcardinals.com/team/coaches-roster/、https://www.azcardinals.com/team/coaches-roster/nick-rallis、https://www.azcardinals.com/team/coaches-roster/nathaniel-hackett）、Pro Football Referenceのチームコーチ一覧・年次チームページ（https://www.pro-football-reference.com/teams/crd/coaches.htm）、および職位別履歴の照合ページ（OC: https://pro-football-history.com/franchpos/50/7/arizona-cardinals-offensive-coordinator-history、DC: https://pro-football-history.com/franchpos/50/8/arizona-cardinals-defensive-coordinator-history）を使用した。Drew Petzingの2023–2025年はDetroit Lions公式発表（https://www.detroitlions.com/news/lions-hire-drew-petzing-as-offensive-coordinator）で補強した。"
  },
  {
    "franchise": "Atlanta Falcons",
    "confirmedRows": 38,
    "reviewRows": 0,
    "coverageNote": "1990〜2026年のHCは全シーズンを確認した。OCは1997〜2026年の在任記録を確認したが、1990〜1996年は提示した主要履歴原典で正式OCを確認できず要確認。DCは1994〜2026年を確認したが、1990〜1993年および1996年は同原典で正式DCを確認できず要確認。共同コーディネーター、代理HC、肩書がOC/DCと明示されない職は推測で補完していない。1990年代の空白は記録欠落の可能性があるため、未確認として扱った。",
    "sourceSummary": "主要な在任年・役職の根拠はPro Football HistoryのAtlanta Falcons head coach history（https://pro-football-history.com/franchpos/22/1/atlanta-falcons-head-coach-history）、offensive coordinator history（https://pro-football-history.com/franchpos/22/7/atlanta-falcons-offensive-coordinator-history）、defensive coordinator history（https://pro-football-history.com/franchpos/22/8/atlanta-falcons-defensive-coordinator-history）を使用した。PFRのチームコーチ表（https://www.pro-football-reference.com/teams/atl/coaches.htm）およびFalcons公式の現行コーチングスタッフ（https://www.atlantafalcons.com/team/coaches-roster/）を照合先として参照し、2026年のKevin Stefanski、Tommy Rees、Jeff Ulbrichの現職表記を確認した。"
  },
  {
    "franchise": "Baltimore Ravens",
    "confirmedRows": 25,
    "reviewRows": 0,
    "coverageNote": "1990–2026年NFLシーズンを対象に確認したが、Baltimore Ravensフランチャイズは1996年創設のため、1990–1995年のRavens記録は存在しない。HCは1996–2026、DCは1996–2026を確認。OCは1999–2026のみ、1996–1998年は公式・PFR等で正式なOC肩書を確認できず要確認とした。代理HC、共同コーディネーターとして別建てすべき記録は確認できなかった。2026年は現職のシーズン在任を記載したが、シーズン結果は未完了。",
    "sourceSummary": "主要原典は、年別コーチ欄を含む[Pro Football ReferenceのBaltimore Ravens Coaches](https://www.pro-football-reference.com/teams/rav/coaches.htm)、OCの継続在任一覧を示す[Pro Football HistoryのRavens offensive coordinator history](https://pro-football-history.com/franchpos/28/7/baltimore-ravens-offensive-coordinator-history)、DCの継続在任一覧を示す[同 defensive coordinator history](https://pro-football-history.com/franchpos/28/8/baltimore-ravens-defensive-coordinator-history)、および2026年現職を確認する[球団公式コーチ roster](https://www.baltimoreravens.com/team/coaches-roster/)である。これらを相互照合し、1990–1995年は球団創設前として除外した。"
  },
  {
    "franchise": "Buffalo Bills",
    "confirmedRows": 41,
    "reviewRows": 0,
    "coverageNote": "1990〜2026年の各シーズンを対象に、HC・OC・DCの正式肩書として一覧化できる在任期間を確認した。HCは全シーズンを連続して確認できたが、OCは1990–1991年がTed Marchibrodaの在任期間1989–1991の一部、DCは1990–1994年がWalt Coreyの在任期間1987–1994の一部である。2023年のDCは主要一覧で正式DC在任者を確認できないため未収録・要確認とし、代理HC、共同コーディネーター、肩書が不明確な人物は推測で補完していない。Joseph Brady／Joe Bradyは同一人物としてJoe Bradyに統合した。2026年はシーズン開始時点の公表スタッフを記録した。",
    "sourceSummary": "主要な在任期間の照合にはPro Football HistoryのBuffalo Bills HC史（https://pro-football-history.com/franchpos/7/1/buffalo-bills-head-coach-history）、OC史（https://pro-football-history.com/franchpos/7/7/buffalo-bills-offensive-coordinator-history）、DC史（https://pro-football-history.com/franchpos/7/8/buffalo-bills-defensive-coordinator-history）を使用し、チーム年別コーチ欄はPro Football Reference（https://www.pro-football-reference.com/teams/buf/coaches.htm、2026年欄の例：https://www.pro-football-reference.com/teams/buf/2026_draft.htm）で補助照合した。フランチャイズ公式の現行スタッフ・Joe Brady就任情報はBuffalo Bills公式（https://www.buffalobills.com/team/coaches-roster/、https://www.buffalobills.com/team/coaches-roster/joe-brady）で確認し、フランチャイズの歴史的背景と2026年HC就任はPro Football Hall of Fame（https://www.profootballhof.com/teams/buffalo-bills/team-history）でクロスチェックした。"
  },
  {
    "franchise": "Carolina Panthers",
    "confirmedRows": 33,
    "reviewRows": 1,
    "coverageNote": "1990〜1994年はCarolina PanthersがNFLシーズンを開始しておらず該当記録なし。1995〜2026年のHC・OC・DCをシーズン単位で確認し、暫定HC（Perry Fewell、Steve Wilks、Chris Tabor）と暫定DC（Al Holcomb）を別記した。2026年は2026年8月時点の現職情報でありシーズン終了後の確定記録ではない。OCのJoseph BradyはJoe Brady、Joe PendryはJoseph Pendryとして表記揺れを統合した。共同コーディネーター、play-caller、run/pass-game coordinator等は正式なOC/DCではないため原則除外した。",
    "sourceSummary": "HCの通算在任表および各年のスタッフ肩書はPro Football Historyのフランチャイズ史（https://pro-football-history.com/franchise/26/carolina-panthers-coaches）で照合し、OCは同サイトの歴代OC表（https://pro-football-history.com/franchpos/26/7/carolina-panthers-offensive-coordinator-history）、DCは歴代DC表（https://pro-football-history.com/franchpos/26/8/carolina-panthers-defensive-coordinator-history）を利用した。現職のDave Canales、Brad Idzik、Ejiro EveroはCarolina Panthers公式のコーチページ（https://www.panthers.com/team/coaches-roster/、https://www.panthers.com/team/coaches-roster/dave-canales、https://www.panthers.com/team/coaches-roster/brad-idzik、https://www.panthers.com/team/coaches-roster/ejiro-evero）で補強し、PFRのチームコーチページ（https://www.pro-football-reference.com/teams/car/coaches.htm）をチームの活動期間・シーズン範囲のクロスチェックに用いた。"
  },
  {
    "franchise": "Chicago Bears",
    "confirmedRows": 37,
    "reviewRows": 4,
    "coverageNote": "1990～2026年シーズンを対象に、HCは年別チーム履歴とPFR、OC・DCはPro Football Historyの役職別履歴を主軸に、2000年以降のOCはNBC Chicago、2025～2026年の現職はフランチャイズ公式サイトで照合した。Thomas Brownは2024年途中の代理HCとして別記し、Alan Williamsの2023年途中辞任、Greg Landryの1990～1992年OC肩書、2026年の現職記録は要確認とした。Chicago Bears、Chicago Staleys、Decatur Staleysは同一フランチャイズとして統合したが、対象期間中のチーム名はChicago Bearsである。",
    "sourceSummary": "主要原典はPFRのChicago Bearsコーチ履歴（https://www.pro-football-reference.com/teams/chi/coaches.htm、HCとフランチャイズ名の確認）、Chicago Bears公式コーチページ（https://www.chicagobears.com/team/coaches/、Ben Johnson・Dennis Allen・Press Taylorの現職確認）、Pro Football HistoryのOC履歴（https://pro-football-history.com/franchpos/46/7/chicago-bears-offensive-coordinator-history）とDC履歴（https://pro-football-history.com/franchpos/46/8/chicago-bears-defensive-coordinator-history、役職別在任年の確認）、NBC ChicagoのOC記録（https://www.nbcchicago.com/news/sports/nfl/chicago-bears/heres-a-record-of-the-bears-offensive-coordinators-since-2000/3323341/、2000年以降およびGary Crowtonの確認）、JT-SWの年別チーム履歴（https://www.jt-sw.com/football/pro/teams.nsf/histories/bears、1990～2025年のHC・シーズン区分の補助確認）を利用した。"
  },
  {
    "franchise": "Cincinnati Bengals",
    "confirmedRows": 26,
    "reviewRows": 2,
    "coverageNote": "1990–2026年の全NFLシーズンを確認した。HCはシーズン途中交代を含む。OCは1990–1992年に正式なOC在任者を確認できず、公式記事はSam Wycheが最後の2シーズンにOC肩書を置かずプレーコールを担当した旨を示すため未記載。1996年OCはBruce CosletからKen Andersonへのシーズン途中交代で、両者を要確認とした。DCは各年の連続在任記録を確認済み。Cincinnati Bengalsの移転前名称はなく、姓名の別表記は統合済み。",
    "sourceSummary": "主要原典は、[Pro Football ReferenceのBengalsコーチ一覧](https://www.pro-football-reference.com/teams/cin/coaches.htm)（チーム年別コーチの照合）、[公式Bengals記事](https://www.bengals.com/news/winds-of-change-approaching-pbs)（1990年代のOC不在・1996年途中交代の確認）、[公式2026年スタッフ発表](https://www.bengals.com/news/bengals-finalize-2026-coaching-staff)（Zac Taylor、Dan Pitcher、Al Goldenの2026年肩書の確認）、および役職別の整理表である[OC履歴](https://pro-football-history.com/franchpos/2/7/cincinnati-bengals-offensive-coordinator-history)と[DC履歴](https://pro-football-history.com/franchpos/2/8/cincinnati-bengals-defensive-coordinator-history)、[HC履歴](https://pro-football-history.com/franchpos/2/1/cincinnati-bengals-head-coach-history)を相互照合に利用した。"
  },
  {
    "franchise": "Cleveland Browns",
    "confirmedRows": 51,
    "reviewRows": 3,
    "coverageNote": "1990〜2026年のCleveland Browns NFLシーズンを確認した。HCは公式歴史ページで確認し、途中就任・代理HCは別レコード化した。OC/DCはPFRの参照先とPro Football Historyの年次一覧を照合し、公式ページまたは主要報道で補った。1996〜1998年はフランチャイズ休止期間でNFLシーズン記録なし。OCは1991〜1993、1996〜1998、2011、2016〜2017の正式肩書を今回の原典で確認できず、DCは1996〜1998の記録を確認できない。2018年DCはGregg WilliamsとinterimのBlake Williamsが重なるため要確認扱いとした。",
    "sourceSummary": "主要原典はCleveland Browns公式のHC歴史ページ https://www.clevelandbrowns.com/team/history/head-coaches（HCの在任年・interim注記）、公式コーチ roster https://www.clevelandbrowns.com/team/coaches-roster/（2026年のTodd Monken、Travis Switzer、Mike Rutenberg）、および公式報道 https://www.clevelandbrowns.com/news/todd-monken-named-browns-head-coach（Todd Monkenの2019年OC在任）である。年次OC一覧は https://pro-football-history.com/franchpos/32/7/cleveland-browns-offensive-coordinator-history、年次DC一覧は https://pro-football-history.com/franchpos/32/8/cleveland-browns-defensive-coordinator-history、2018年interim DCは https://pro-football-history.com/franchpos/32/498/cleveland-browns-interim-defensive-coordinator-history を利用した。PFRのチームコーチページ https://www.pro-football-reference.com/teams/cle/coaches.htm はフランチャイズのチーム年次コーチ照合先として確認したが、ページの広告・動的表示により当該役職表の全行を機械抽出できなかったため、正式役職が曖昧な行はneeds_reviewとした。"
  },
  {
    "franchise": "Dallas Cowboys",
    "confirmedRows": 34,
    "reviewRows": 1,
    "coverageNote": "1990〜2026年シーズンを確認した。HCは公式DallasCowboys.com、OC/DCはPro Football Historyのフランチャイズ職種履歴を主軸にし、2026年DCは公式チームページで補強した。公式職名として掲載されない年（OCの1998–1999、2005–2006、2011、DCの2009–2010のHC兼任・職務境界）は推測で補完せず要確認とした。2010年HCは途中交代のため在任が重複する。",
    "sourceSummary": "主要原典はDallas Cowboys公式のHC歴史記事（https://www.dallascowboys.com/news/rank-em-head-coaches-in-cowboys-history）とChristian Parker公式プロフィール（https://www.dallascowboys.com/team/coaches-roster/christian-parker）で、HCの在任期間と2026年DC就任を確認した。OCはPro Football HistoryのDallas Cowboys OC履歴（https://pro-football-history.com/franchpos/20/7/dallas-cowboys-offensive-coordinator-history）、DCは同DC履歴（https://pro-football-history.com/franchpos/20/8/dallas-cowboys-defensive-coordinator-history）を使用し、補足的にPFRのチームコーチページ（https://www.pro-football-reference.com/teams/dal/coaches.htm）およびESPNのZimmer報道（https://www.espn.com/nfl/story/_/id/39487438/mike-zimmer-rejoin-cowboys-defensive-coordinator-source-says）を参照した。"
  },
  {
    "franchise": "Denver Broncos",
    "confirmedRows": 32,
    "reviewRows": 12,
    "coverageNote": "1990〜2026年のDenver Broncos（移転前名称なし）を対象に、PFRのフランチャイズ・年次ページ、Denver Broncos公式のHC／スタッフ履歴、NFL主要報道を照合した。HCは暫定HC（Eric Studesville、Jerry Rosburg）を別記した。OC・DCは、正式なCoordinator肩書が年次資料で一貫しない時期、権限分担・共同体制の可能性がある時期、2026年の現行スタッフ掲載に依存する記録をneeds_reviewとした。1990年のOC Chan Gailey、1991年のOC Mike Shanahan、1992年のOC George Henshaw、1993年のOC Jim Fassel、1990〜1992年のDC Wade Phillipsは特に原典で確認できる。姓名の別表記（例：Ejiro Evero、Renaldo Hill）やDenver Broncosのフランチャイズ名は統合済み。",
    "sourceSummary": "主要原典は、PFRのDenver Broncosコーチ一覧 https://www.pro-football-reference.com/teams/den/coaches.htm と年次ページ（例：1993年 https://www.pro-football-reference.com/teams/den/1993.htm、2003年 https://www.pro-football-reference.com/teams/den/2003.htm）で、シーズンごとのHC・OC・DC欄を確認した。公式資料としてDenver BroncosのHC履歴 https://www.denverbroncos.com/photos/broncos-head-coach-history-14789403、現行スタッフ https://www.denverbroncos.com/team/coaches-roster/、Vance Josephの公式プロフィール https://www.denverbroncos.com/team/coaches-roster/vance-joseph、Wade Phillipsの公式記事 https://www.denverbroncos.com/news/phillips-to-be-defensive-coordinator-14857688 を利用した。補助的にNFLのJoe Lombardi在任終了報道 https://www.nfl.com/news/broncos-fire-offensive-coordinator-joe-lombardi-after-three-seasons-in-denver と19​​90年公式メディアガイド https://media.denverbroncos.com/wp-content/uploads/2019/01/1990.pdf を用いた。"
  },
  {
    "franchise": "Detroit Lions",
    "confirmedRows": 11,
    "reviewRows": 32,
    "coverageNote": "1990–2026年シーズンを確認した。HCは1990–1996のWayne Fontes、1997–2000 Bobby Ross、2001–2002 Marty Mornhinweg、2003–2005 Steve Mariucci、2006–2008 Rod Marinelli、2009–2013 Jim Schwartz、2014–2017 Jim Caldwell、2018–2020 Matt Patricia、2021–2026 Dan Campbellで連続して確認できる。OCは1990年と2001年の正式在任者が主要一覧で未確認、Dave Levyは1991・1994の非連続在任。代理HC、共同OC/DC、play-caller等の肩書は正式コーディネーター記録に含めず、歴史的OC/DCは一次資料未照合のため要確認とした。Detroit Lionsは1990–2026を通じて同一フランチャイズ名であり、移転前名称の統合注記は対象外。",
    "sourceSummary": "Pro Football ReferenceのDetroit Lionsフランチャイズ／コーチページ（https://www.pro-football-reference.com/teams/det/ と https://www.pro-football-reference.com/teams/det/coaches.htm）でフランチャイズ同一性と年次コーチ資料の基準を確認した。HCの在任期間はPro Football Historyの一覧（https://pro-football-history.com/franchpos/42/1/detroit-lions-head-coach-history）で照合し、OC（https://pro-football-history.com/franchpos/42/7/detroit-lions-offensive-coordinator-history）およびDC（https://pro-football-history.com/franchpos/42/8/detroit-lions-defensive-coordinator-history）は同サイトのシーズン別履歴を参照した。2026年のHC Dan Campbell、OC Drew Petzing、DC Kelvin SheppardはDetroit Lions公式発表（https://www.detroitlions.com/news/lions-announce-2026-coaching-staff）で確認した。"
  },
  {
    "franchise": "Green Bay Packers",
    "confirmedRows": 21,
    "reviewRows": 6,
    "coverageNote": "1990～2026年のNFLシーズンを対象に、Packers公式歴代コーチ・現行名簿、PFRのチーム年次／コーチページ、主要報道を照合した。HCは原則シーズン単位で統合し、Joe Philbinの2018年は代理・暫定HCとして区別した。OCは1990～91年の正式肩書が確認できず、2015年のPhilbin／Edgar Bennett重複、2016～18年のHackettを含む肩書例外は要確認とした。2026年は完了シーズンではなく現時点の在任記録である。姓名別表記はGelindo “Lindy” Infante／Lindy Infanteのように統合可能。",
    "sourceSummary": "主要原典はPackers公式歴代コーチ一覧 https://gb.packers.com/coaches（役職・年次）、Packers公式現行コーチ名簿 https://www.packers.com/team/coaches-roster/（2019年以降の現職と2026年DC）、PFRコーチ一覧 https://www.pro-football-reference.com/teams/gnb/coaches.htm と年次ページ例 https://www.pro-football-reference.com/teams/gnb/2025.htm（HC・OC・DCの年別確認）、Packers公式OC就任記事 https://www.packers.com/news/green-bay-tabs-jagodzinski-as-offensive-coordinator-2452561（Jagodzinski 2006、Lewis 1992–99、Rossley 2000–05）、主要報道のDC一覧 https://www.jsonline.com/story/sports/nfl/packers/2024/01/26/here-are-all-of-the-green-bay-packers-defensive-coordinators-in-history/72351007007/（1999年以降のDC系譜）を利用した。"
  },
  {
    "franchise": "Houston Texans",
    "confirmedRows": 26,
    "reviewRows": 2,
    "coverageNote": "Houston TexansはNFLフランチャイズとして2002年に創設されたため、1990–2001年に対象チームのHC・OC・DC記録はありません。2002–2026年のHC、OC、DCを確認し、OC/DCは履歴ページ、HCと2026年現職はPro Football ReferenceおよびTexans公式スタッフページで照合しました。代理HC（Wade Phillips、Romeo Crennel）、HC交代年（2013、2020）、および2013年のPhillipsのHC/DC兼務可能性は要確認として注記しています。",
    "sourceSummary": "主要原典は、Houston Texans公式スタッフ一覧（https://www.houstontexans.com/team/coaches-roster/）とNick Caley・Matt Burkeの公式略歴（https://www.houstontexans.com/team/coaches-roster/nick-caley、https://www.houstontexans.com/team/coaches-roster/matt-burke）で、2026年の現職と公式肩書・在任開始年を確認しました。Pro Football ReferenceのHouston Texansコーチ年表（https://www.pro-football-reference.com/teams/htx/coaches.htm）はHCを含むチーム年別コーチ記録の照合に使用しました。OC履歴（https://pro-football-history.com/franchpos/29/7/houston-texans-offensive-coordinator-history）およびDC履歴（https://pro-football-history.com/franchpos/29/8/houston-texans-defensive-coordinator-history）は、各コーディネーターのシーズン範囲を一覧化した補助的な主要データ源として使用しました。"
  },
  {
    "franchise": "Indianapolis Colts",
    "confirmedRows": 34,
    "reviewRows": 3,
    "coverageNote": "1990年から2026年シーズン（2026年は現行・未完了扱い）を対象に、HCは年別シーズン表とフランチャイズ履歴、OC/DCは役職履歴および公式現行スタッフで照合した。代理HC（1991年Rick Venturi、2012年Bruce Arians、2022年Jeff Saturday）を独立記録として含め、共同コーディネーターや肩書が不明確な期間は正式OC/DCとして推測で補わなかった。Indianapolis Coltsは1984年にBaltimore Coltsから移転した同一フランチャイズであり、人物名のJim E. Mora (Sr.)／Jim Moraなどの表記差は統合注記した。",
    "sourceSummary": "主要原典は、[Pro Football ReferenceのColtsコーチ一覧](https://www.pro-football-reference.com/teams/clt/coaches.htm)（フランチャイズ名称とコーチ記録の基準）、[Pro Football HistoryのColts HC履歴](https://pro-football-history.com/franchise/31/indianapolis-colts-coaches)（HCの在任年・シーズン別スタッフ）、[同OC履歴](https://pro-football-history.com/franchpos/31/7/indianapolis-colts-offensive-coordinator-history)（1990年以降のOC履歴）、[同DC履歴](https://pro-football-history.com/franchpos/31/8/indianapolis-colts-defensive-coordinator-history)（1990年以降のDC履歴）、[Colts公式コーチングスタッフ](https://www.colts.com/team/coaches-roster/)（2025–2026年の現行HC・OC・DC）、および[FootballDBの年別HC表](https://www.footballdb.com/teams/nfl/indianapolis-colts/coaches-by-season)（1990年以降のHC交代・代理HCのクロスチェック）である。"
  },
  {
    "franchise": "Jacksonville Jaguars",
    "confirmedRows": 36,
    "reviewRows": 3,
    "coverageNote": "1990–1994年はJacksonville JaguarsがNFLシーズンに参加しておらず、記録対象は実質1995–2026年。公式Jaguars発表、Pro Football Referenceの2025・2026年欄、Pro Football Historyの職位別履歴を照合した。HCは正式HCに加え、公式が明記する2011年Mel Tucker、2016年Doug Marrone、2021年Darrell Bevellのinterim HCを要確認として別レコード化した。2026年はシーズン進行中の現職であり、将来の交代は未確認。OC・DCについては共同コーディネーターや肩書が不明確な別職を推測で補わず、明示されたCoordinatorのみ収録した。",
    "sourceSummary": "主要原典は、公式JaguarsのLiam Coen就任・歴代HCおよびinterim HC明記ページ（https://www.jaguars.com/news/k000151-official-jaguars-name-liam-coen-head-coach）、公式コーチ名簿のLiam Coen（https://www.jaguars.com/team/coaches-roster/liam-coen）、Grant Udinski（https://www.jaguars.com/team/coaches-roster/grant-udinski）、Anthony Campanile（https://www.jaguars.com/team/coaches-roster/anthony-campanile）で現職と公式肩書を確認した。過去年の役職・シーズン範囲はPro Football HistoryのHC（https://pro-football-history.com/franchpos/27/1/jacksonville-jaguars-head-coach-history）、OC（https://pro-football-history.com/franchpos/27/7/jacksonville-jaguars-offensive-coordinator-history）、DC（https://pro-football-history.com/franchpos/27/8/jacksonville-jaguars-defensive-coordinator-history）を利用し、Pro Football Referenceの2025年（https://www.pro-football-reference.com/teams/jax/2025.htm）・2026年（https://www.pro-football-reference.com/teams/jax/2026_draft.htm）のチーム欄で現職3職をクロスチェックした。"
  },
  {
    "franchise": "Kansas City Chiefs",
    "confirmedRows": 30,
    "reviewRows": 2,
    "coverageNote": "1990〜2026年の各シーズンを確認し、同一人物の連続在任を統合した。Kansas City Chiefsは移転後の公式名称で、移転前のDallas Texans（1960〜1962）は対象外。2011年のRomeo Crennelは暫定HC、2016年のBrad ChildressはCo-Offensive Coordinator表記のため要確認。2009年は年別表に正式OC欄がなく、空白を推測で補っていない。2026年は現行シーズンの公式掲載で、完了後の再確認が必要。",
    "sourceSummary": "主資料は[Pro Football ReferenceのKansas City Chiefs Coaches年表](https://www.pro-football-reference.com/teams/kan/coaches.htm)で、シーズン別HC・OC・DC欄とコーチ年表の照合に利用した。補助的に[Pro Football Historyのフランチャイズ別コーチ年表](https://pro-football-history.com/franchise/9/kansas-city-chiefs-coaches)を各年の役職表記・例外確認に利用した。現行情報と任命事実は[Chiefs公式コーチ名簿](https://www.chiefs.com/team/coaches-roster/)および[Steve Spagnuolo公式プロフィール](https://www.chiefs.com/team/coaches-roster/steve-spagnuolo)、[Bob Sutton任命公式発表](https://www.chiefs.com/news/chiefs-name-bob-sutton-as-defensive-coordinator-9342416)で確認した。"
  },
  {
    "franchise": "Las Vegas Raiders (Oakland Raiders / Los Angeles Raiders)",
    "confirmedRows": 53,
    "reviewRows": 0,
    "coverageNote": "1990–2026 NFLシーズンを対象に、HCはレイダース公式歴史ページ、OC/DCはPro Football Historyのフランチャイズ職位履歴を軸に、2025–26年の変更はレイダース公式発表で補完した。公式・主要記録で正式なOC/DC名が連続的に確認できない1990年代前半のOC（1994–1996）、2009年のOC、2025年のDCは推測せず記録化していないため要確認。HCの代理在任（Tony Sparano、Rich Bisaccia、Antonio Pierce）と2025年OCのシーズン内交代（Chip Kelly→Greg Olson interim）は注記した。チーム名は移転前後を当時名称で表記し、Oakland／Los Angeles／Las Vegasは同一フランチャイズとして統合可能である。",
    "sourceSummary": "主要原典はレイダース公式HC歴史ページ https://www.raiders.com/history/coaching-history（1990年以降のHC在任年と代理HCを確認）、公式現行スタッフ https://www.raiders.com/team/coaches-roster/（2026年のKlint Kubiak、Andrew Janocko、Rob Leonardを確認）、公式2026年OC発表 https://www.raiders.com/news/raiders-name-andrew-janocko-offensive-coordinator（Janockoの就任日を確認）、公式2025年スタッフ資料 https://www.raiders.com/photos/pete-carroll-raiders-coaching-staff-2025-nfl-patrick-graham-chip-kelly（Chip Kelly、Patrick Grahamを確認）、公式2025年交代発表 https://www.raiders.com/news/raiders-greg-olson-interim-offensive-coordinator-pete-carroll-2025-coaching-staff（Greg Olsonのinterim OCを確認）、Pro Football History OC履歴 https://pro-football-history.com/franchpos/17/7/las-vegas-raiders-offensive-coordinator-history とDC履歴 https://pro-football-history.com/franchpos/17/8/las-vegas-raiders-defensive-coordinator-history（1990年代以降の職位別在任年を確認）、Pro Football Reference https://www.pro-football-reference.com/teams/rai/coaches.htm（Oakland／Los Angeles／Las Vegasが同一チーム履歴であることとシーズン範囲をクロスチェック）を利用した。"
  },
  {
    "franchise": "Los Angeles Chargers (San Diego Chargers)",
    "confirmedRows": 43,
    "reviewRows": 1,
    "coverageNote": "1990–2026年シーズンを確認した。HCは公式Chargers歴史ページを中心に、OC/DCはPro Football Historyの役職別履歴と2026年公式発表で照合した。HCのGiff Smithは2023年途中の暫定HCのため要確認扱い。1990年と1991年のHC・DC、ならびに1990年・1992–1993年のOCは、前任者の在任期間から対象年を切り出して記録した。2017年にSan Diego ChargersからLos Angeles Chargersへ名称変更したが、同一フランチャイズとして統合した。",
    "sourceSummary": "主要原典は、Chargers公式コーチ歴史ページ（https://www.chargers.com/team/history/coaching-history、HCの公式在任年）、Chargers公式2026年コーディネーター記事（https://www.chargers.com/news/mike-mcdaniel-chris-oleary-new-coordinator-2026、Mike McDanielとChris O'Learyの2026年肩書）、Pro Football Referenceのチームコーチページ（https://www.pro-football-reference.com/teams/sdg/coaches.htm、チーム名統合と年次コーチ表の確認）、Pro Football HistoryのOC履歴（https://pro-football-history.com/franchpos/15/7/los-angeles-chargers-offensive-coordinator-history）およびDC履歴（https://pro-football-history.com/franchpos/15/8/los-angeles-chargers-defensive-coordinator-history、1990年以降の役職別在任年）である。"
  },
  {
    "franchise": "Los Angeles Rams",
    "confirmedRows": 44,
    "reviewRows": 5,
    "coverageNote": "1990年から2026年シーズン（2026年は現時点の公式スタッフ掲載を含む）を対象に、HC・OC・DCを確認した。HCはフルタイム在任を基本とし、Joe Vitt（2005）とJohn Fassel（2016）は代理・暫定HCとして要確認扱いにした。OCは2015年のFrank Cignetti Jr.からRob Borasへのシーズン途中の交代を分割注記した。2018–2019年はSean McVayが攻撃を主導したものの、正式なOC肩書の資料間整理が不十分なため記録を推測で補わず未確認とした。1991年DCのJeff FisherもPFR年別ページの肩書確認に依存するため要確認とした。Rams、Los Angeles Rams、St. Louis Ramsは同一フランチャイズとして統合し、チーム名は当時名称で表示した。",
    "sourceSummary": "フランチャイズ全体のHC年表は[Pro Football HistoryのRams HC履歴](https://pro-football-history.com/franchpos/35/1/los-angeles-rams-head-coach-history)で照合し、OCは[同OC履歴](https://pro-football-history.com/franchpos/35/7/los-angeles-rams-offensive-coordinator-history)、DCは[同DC履歴](https://pro-football-history.com/franchpos/35/8/los-angeles-rams-defensive-coordinator-history)を基礎資料とした。PFRの[チームコーチページ](https://www.pro-football-reference.com/teams/ram/coaches.htm)および[1991年チーム年別ページ](https://www.pro-football-reference.com/teams/ram/1991/gamelog)でフランチャイズ統合、年別肩書、1991年のOC/DCを補完確認した。現行の2026年HC・OC・DCは[Rams公式コーチ名簿](https://www.therams.com/team/coaches-roster/)で確認し、代理HCと2015年終盤のOC交代は[FootballDBのHC記録](https://www.footballdb.com/teams/nfl/los-angeles-rams/head-coaches)および[NFL掲載Rob Boras資料](https://static.clubs.nfl.com/image/upload/bills/icolscg4klw4ivygs9ys)を参照した。"
  },
  {
    "franchise": "Miami Dolphins",
    "confirmedRows": 42,
    "reviewRows": 2,
    "coverageNote": "1990–2026年のNFLシーズンを確認し、HCは通常在任者に加えて2015年の代理HC Dan Campbellを収録した。OCは1990–1995のGary Stevens、1998年以降の履歴を確認できたが、1996–1997以外ではなく、2007年の正式OCは今回の主要原典で確認できなかったため未収録（要確認）。DCは1990–2026を確認したが、1995年はPFRのTom Olivadottiと履歴集約のGeorge Hillが競合し、要確認。Miami Dolphinsは名称変更・移転前名称による別フランチャイズではなく、全記録を同一フランチャイズとして統合した。",
    "sourceSummary": "主要原典は、PFRのMiami Dolphinsコーチ一覧（https://www.pro-football-reference.com/teams/mia/coaches.htm）と年別ページ（例：https://www.pro-football-reference.com/teams/mia/1990.htm、https://www.pro-football-reference.com/teams/mia/2007.htm）でHC・OC・DCの年次表記を確認した。OC/DCの連続在任期間はPro Football HistoryのOC履歴（https://pro-football-history.com/franchpos/19/7/miami-dolphins-offensive-coordinator-history）およびDC履歴（https://pro-football-history.com/franchpos/19/8/miami-dolphins-defensive-coordinator-history）で照合した。2026年スタッフはフランチャイズ公式ページ（https://www.miamidolphins.com/team/coaches-roster/）、Brian Flores期のOC/DCは公式発表（https://www.miamidolphins.com/news/brian-flores-staff-comes-into-focus-miami-dolphins）、2015年代理HCは主要報道（https://www.palmbeachpost.com/story/sports/nfl/dolphins/2025/01/17/miami-dolphins-dan-campbell-detroit-lions-nfl-playoffs/77777325007/）を利用した。"
  },
  {
    "franchise": "Minnesota Vikings",
    "confirmedRows": 37,
    "reviewRows": 2,
    "coverageNote": "1990〜2026年の各NFLシーズンを確認し、HC・OC・DCをシーズン単位で整理した。HCはJerry BurnsからKevin O'Connellまで、OCはBob SchnelkerからWes Phillipsまで、DCはFloyd PetersからBrian Floresまでを収録。Mike Ticeの2001年最終戦の代理HCとLeslie Frazierの2010年最終6試合のinterim HCは正式在任期間と区別し要確認とした。OC/DCについては共同コーディネーター表記を確認できた年を別人の推測で補わず、指定原典で明示された正式肩書のみを採用した。Minnesota Vikingsは移転前名称なし、姓名の表記統合上はBrian O'LearyではなくGeorge O'Leary、Jerry BurnsとJack Burnsは別人物である。",
    "sourceSummary": "HCの公式原典は https://www.vikings.com/history/coaching-history で、就任日・在任年・interim扱い・Frazierの2007–2010年DC兼務を確認した。2026年の現行スタッフは https://www.vikings.com/team/coaches-roster/ と https://www.vikings.com/news/2026-coaching-staff-updates-promotions-hires で確認した。OCの年次一覧は https://pro-football-history.com/franchpos/21/7/minnesota-vikings-offensive-coordinator-history、DCの年次一覧は https://pro-football-history.com/franchpos/21/8/minnesota-vikings-defensive-coordinator-history、HCのシーズン別突合は https://pro-football-history.com/franchpos/21/1/minnesota-vikings-head-coach-history、リーグ年別コーチ確認の補助原典は https://www.pro-football-reference.com/teams/min/coaches.htm を利用した。"
  },
  {
    "franchise": "New England Patriots",
    "confirmedRows": 7,
    "reviewRows": 22,
    "coverageNote": "1990–2026年の各シーズンを対象に、HCはPatriots公式歴史ページと役職史、OC・DCはPFRのチームコーチ情報を補完するPro Football Historyの役職別履歴で照合した。正式なOC/DCを置かなかった年（OCは少なくとも2005年・2009年・2010年・2022年、DCは2018–2023年の一部）は人物レコードに推測で追加していない。攻撃・守備のプレイコーラー、assistant coordinator、position coach、共同・代理肩書は正式OC/DCとして扱わず、各記録の公式肩書確認が十分でないものはneeds_review（要確認）とした。Boston PatriotsはNew England Patriotsの移転前名称であり、フランチャイズ内で統合した。",
    "sourceSummary": "主要原典はPatriots公式歴史ページ https://www.patriots.com/press-room/history （2024年のBelichick退任・Mayo就任、2025年のMayo解任・Vrabel就任、2026年シーズンの記載）と、Pro Football Referenceのチーム別コーチページ https://www.pro-football-reference.com/teams/nwe/coaches.htm （チーム名、シーズン範囲、フランチャイズの年別コーチ情報）である。役職別の在任年の補助照合にはPro Football HistoryのHC史 https://pro-football-history.com/franchpos/6/1/new-england-patriots-head-coach-history、OC史 https://pro-football-history.com/franchpos/6/7/new-england-patriots-offensive-coordinator-history、DC史 https://pro-football-history.com/franchpos/6/8/new-england-patriots-defensive-coordinator-history を利用した。OC不在方針の補助根拠としてESPN https://www.espn.com/nfl/story/_/id/34277506/new-england-patriots-not-naming-offensive-defensive-coordinators を参照した。"
  },
  {
    "franchise": "New Orleans Saints",
    "confirmedRows": 32,
    "reviewRows": 0,
    "coverageNote": "1990〜2026年シーズンを対象に、HCはSaints公式歴史ページ、OC・DCはPro Football Historyのフランチャイズ役職履歴を主軸に、公式現行スタッフページとPFRの2025年年別ページで照合した。1996年のJim Mora／Rick Venturi、2012年のAaron Kromer／Joe Vitt、2024年のDennis Allen／Darren Rizziはシーズン途中の交代・暫定HCのため同一シーズン内で重複する。1990〜2026年のHC・OC・DCについて、今回確認できた範囲では未確認年はないが、OCの一部はヘッドコーチが実質的にプレーコールを担当した時期や肩書の制度差があり、公式一次資料での逐年スタッフ名簿までは網羅できないため、厳密な肩書比較では要確認。",
    "sourceSummary": "主要原典はSaints公式の歴代HCページ https://www.neworleanssaints.com/team/history/head-coaches （HCの在任年・暫定HCを確認）と現行コーチ roster https://www.neworleanssaints.com/team/coaches-roster/ （2025〜2026年のKellen Moore、Doug Nussmeier、Brandon Staleyの肩書を確認）。役職別の通史照合には https://pro-football-history.com/franchpos/23/7/new-orleans-saints-offensive-coordinator-history と https://pro-football-history.com/franchpos/23/8/new-orleans-saints-defensive-coordinator-history を利用し、PFRのチームコーチ一覧 https://www.pro-football-reference.com/teams/nor/coaches.htm および2025年年別ページ https://www.pro-football-reference.com/teams/nor/2025.htm でチーム名・現行年の役職をクロスチェックした。"
  },
  {
    "franchise": "New York Giants",
    "confirmedRows": 39,
    "reviewRows": 2,
    "coverageNote": "1990–2026 NFLシーズンを対象に、HCはPFRの年別コーチ記録、OC/DCは役職史一覧と各年PFRチームページ、2026年および2025年終盤の例外はGiants公式発表・スタッフ原簿で照合した。1990年はBill Parcells／Ron Erhardt／Bill Belichick、2026年はJohn Harbaugh／Matt Nagy／Dennard Wilson。2025年はBrian Dabollの後任HCはなく、OCはMike Kafkaに加えてTim Kellyのinterim表記、DCはShane Bowenに加えてCharlie Bullenのinterim表記があり、両者の正確な兼務・交代日および公式シーズン内区分は要確認。Steve Spagnuoloは2007–2008と2015–2017の二期を分割記録した。",
    "sourceSummary": "主要原典は[Pro-Football-Reference Giants Coaches](https://www.pro-football-reference.com/teams/nyg/coaches.htm)（HCの年別記録）、[Giants 2024 roster](https://www.pro-football-reference.com/teams/nyg/2024.htm)、[Giants 2025 roster](https://www.pro-football-reference.com/teams/nyg/2025.htm)、[Giants 2026公式スタッフ発表](https://www.giants.com/news/john-harbaugh-announces-2026-coaching-staff-coordinators-matt-nagy-dennard-wilson-chris-horton)（当年の正式肩書）、[OC歴史一覧](https://pro-football-history.com/franchpos/4/7/new-york-giants-offensive-coordinator-history)および[DC歴史一覧](https://pro-football-history.com/franchpos/4/8/new-york-giants-defensive-coordinator-history)（1990年以降の役職継続年）である。2025年のinterim OC/DCと姓名・肩書の補助確認には[BigBlueInteractiveスタッフ原簿](https://bigblueinteractive.com/information-pages/new-york-giants-coaching-staff/)を用いた。"
  },
  {
    "franchise": "New York Jets",
    "confirmedRows": 42,
    "reviewRows": 1,
    "coverageNote": "1990〜2026年シーズンを確認した。HCは公式Jetsの歴史ページと主要年次記録を優先し、2024年のJeff Ulbrichは代理HCとして別記した。OC・DCはPFR年次欄およびPro Football Historyの役職履歴で照合した。OCは1990〜1993年および1995年、DCは1994年について、今回確認できた主要一覧に正式コーディネーター名がなく未確認。Jim VechiarellaのDC表記は姓名・同時代肩書の追加確認が必要。移転前名称はなく、New York Titans（1960〜1962）からNew York Jets（1963〜）への改称は対象期間外。",
    "sourceSummary": "フランチャイズ公式HC歴は https://www.newyorkjets.com/history/coaching-history/ を使用し、Bruce Coslet以降のHC在任年を確認した。代理HCの位置づけは https://www.newyorkjets.com/news/inside-the-numbers-jeff-ulbrich-jets-interim-head-coach を参照した。PFRのフランチャイズ・コーチ一覧 https://www.pro-football-reference.com/teams/nyj/coaches.htm と2026年年次コーチ欄 https://www.pro-football-reference.com/teams/nyj/2026_draft.htm を用いて現行年および年次記録を照合した。OC履歴は https://pro-football-history.com/franchpos/3/7/new-york-jets-offensive-coordinator-history、DC履歴は https://pro-football-history.com/franchpos/3/8/new-york-jets-defensive-coordinator-history を利用した。"
  },
  {
    "franchise": "Philadelphia Eagles",
    "confirmedRows": 32,
    "reviewRows": 2,
    "coverageNote": "1990〜2026年シーズンを対象に、HC・OC・DCの歴代年表を確認した。1990年はBuddy Ryan、Rich Kotite、Jeff Fisherの各在任期間に含まれる。OCは同原典上2004年にBrad ChildressとMarty Mornhinwegが重複し、2000年代の正式な単独・共同コーディネーター肩書は要確認。また、2020年のOCは確認できず、2026年はシーズン進行前の現職記載であるため、年次実績ではなく在任予定を含む。人物名は原典の英語表記を採用し、移転前名称・別フランチャイズ名の混在はなく、Philadelphia Eaglesとして統合した。",
    "sourceSummary": "主原典はPhiladelphia Eagles公式コーチページ（https://www.philadelphiaeagles.com/team/coaches/）で現職情報を確認し、Pro Football Referenceのチームコーチ年表（https://www.pro-football-reference.com/teams/phi/coaches.htm）をチーム年次記録の基準として参照した。役職別の継続年・過去在任者はPro Football HistoryのHC（https://pro-football-history.com/franchpos/114/1/philadelphia-eagles-head-coach-history）、OC（https://pro-football-history.com/franchpos/114/7/philadelphia-eagles-offensive-coordinator-history）、DC（https://pro-football-history.com/franchpos/114/8/philadelphia-eagles-defensive-coordinator-history）で突合した。2004年OCの重複、2020年OCの欠落、2026年の現職扱いは推測せず要確認として注記した。"
  },
  {
    "franchise": "Pittsburgh Steelers",
    "confirmedRows": 26,
    "reviewRows": 0,
    "coverageNote": "1990～2026年の各NFLシーズンを確認した。HCはChuck Noll、Bill Cowher、Mike Tomlin、Mike McCarthyの4名、OCは公式Steelers記事の歴代列挙と在任年データ、DCは在任年データおよび2026年公式名簿で照合した。1990～2026年について、共同コーディネーター・代理HC・正式肩書が不明確な空白年は確認されなかった。Dick LeBeauは1995–1996年と2004–2014年の二期在任であり、Pittsburgh Pirates等の移転前名称は同一フランチャイズとしてPittsburgh Steelersに統合した。2026年はシーズン進行中のため、年表上は2026–2026とした。",
    "sourceSummary": "主要原典は、[PFRのPittsburgh Steelers Coaches](https://www.pro-football-reference.com/teams/pit/coaches.htm)（HCのチーム年別在任確認）、[Steelers公式コーチ名簿](https://www.steelers.com/team/coaches-roster/)および[Steelers公式2026年コーチングスタッフ発表](https://www.steelers.com/news/steelers-complete-2026-coaching-staff)（2026年のMike McCarthy、Brian Angelichio、Patrick Grahamの正式肩書確認）、[Steelers公式Asked and Answered: July 5](https://www.steelers.com/news/asked-and-answered-july-5)（OC歴代名の公式列挙）、[Pro Football HistoryのSteelers OC履歴](https://pro-football-history.com/franchpos/37/7/pittsburgh-steelers-offensive-coordinator-history)（OC各人の在任年）、[同DC履歴](https://pro-football-history.com/franchpos/37/8/pittsburgh-steelers-defensive-coordinator-history)（DC各人の在任年）である。"
  },
  {
    "franchise": "San Francisco 49ers",
    "confirmedRows": 41,
    "reviewRows": 1,
    "coverageNote": "1990–2026 NFLシーズンを確認し、HCは全シーズンを連続的に確認した。OCは主要原典で正式肩書が確認できた1990–2016、2021、2025–2026を収録し、2017–2020および2022–2024はヘッドコーチ兼任・プレーコール担当・肩書の変動を含むため正式OCとして未確定、要確認とした。DCは1990–2026を収録したが、Robert Salehの2025年再任は主要原典間の扱いに差があるため要確認とした。Jim L. MoraはJim Mora Jr.等の別表記を統合し、移転前名称は対象期間内にないためチーム名をSan Francisco 49ersに統一した。",
    "sourceSummary": "主要原典は、49ers公式のDC年代別記事（https://www.49ers.com/news/every-49ers-defensive-coordinator-since-george-seifert-14857597）で1990–2015年のDCを確認し、Pro Football Referenceの49ers年別ページ（1990年: https://www.pro-football-reference.com/teams/sfo/1990.htm、2026年: https://www.pro-football-reference.com/teams/sfo/2026_draft.htm）で年別HC・OC・DC表記を確認した。連続在任期間の整理とHC・OC・DCの補完照合にはPro Football Historyの役職別ページ（HC: https://pro-football-history.com/franchpos/1/1/san-francisco-49ers-head-coach-history、OC: https://pro-football-history.com/franchpos/1/7/san-francisco-49ers-offensive-coordinator-history、DC: https://pro-football-history.com/franchpos/1/8/san-francisco-49ers-defensive-coordinator-history）を利用した。"
  },
  {
    "franchise": "Seattle Seahawks",
    "confirmedRows": 32,
    "reviewRows": 1,
    "coverageNote": "1990–2026の各NFLシーズンを確認し、HCは公式の歴代コーチ一覧、OC/DCは年別コーチ履歴と公式現行スタッフを突合した。1990–1991の長期在任者は対象期間に切り出して記載。確認できた範囲では代理HC・共同OC/DCは別記されていないが、2000–2008年のGil Haskellは正式なOC肩書と実務上のプレーコール担当の区別が要確認。2026年はシーズン現職を含む。",
    "sourceSummary": "Seattle Seahawks公式の歴代コーチ一覧（https://www.seahawks.com/team/coaches-roster/all-time/）でHCの在任年を確認し、公式現行コーチページ（https://www.seahawks.com/team/coaches-roster/）で2024–2026年の現職肩書を確認した。OCの年次履歴はPro Football History（https://pro-football-history.com/franchpos/24/7/seattle-seahawks-offensive-coordinator-history）、DCの年次履歴は同サイト（https://pro-football-history.com/franchpos/24/8/seattle-seahawks-defensive-coordinator-history）で確認し、横断的なチームコーチ資料としてPro Football Reference（https://www.pro-football-reference.com/teams/sea/coaches.htm）も参照した。"
  },
  {
    "franchise": "Tampa Bay Buccaneers",
    "confirmedRows": 36,
    "reviewRows": 1,
    "coverageNote": "1990–2026年のNFLシーズンを確認した。HCは1990年のRay Perkinsと同年途中の代理HC Richard Williamsonを重複記録し、OCは1990年のWilliamsonのみ肩書境界を要確認とした。DCは1990–2021の継続的な肩書記録と2026年のGeorge Edwardsを確認したが、2022–2025年は正式なDC不在または別称の分業制で、HC・OC・DCとして確定できる記録は追加していない。2026年は進行中シーズンである。",
    "sourceSummary": "フランチャイズ全体のHC年次表および1990年代以降の年次スタッフはPro Football Historyのhttps://pro-football-history.com/franchise/25/tampa-bay-buccaneers-coachesで照合した。OCは同サイトのhttps://pro-football-history.com/franchpos/25/7/tampa-bay-buccaneers-offensive-coordinator-history、DCはhttps://pro-football-history.com/franchpos/25/8/tampa-bay-buccaneers-defensive-coordinator-historyを基礎資料とし、公式のHC・コーチ在籍情報はhttps://www.buccaneers.com/team/coaches-roster/、https://www.buccaneers.com/team/ring-of-honor/jon-gruden、https://www.buccaneers.com/team/ring-of-honor/monte-kiffin、2026年の役職表記はPro Football Referenceのhttps://www.pro-football-reference.com/teams/tam/2026.htmで確認した。"
  },
  {
    "franchise": "Tennessee Titans (Houston Oilers)",
    "confirmedRows": 36,
    "reviewRows": 3,
    "coverageNote": "1990–2026年のNFLシーズンを対象に、HC・OC・DCのシーズン単位の在任記録を確認した。Houston Oilers、Tennessee Oilers、Tennessee Titansは同一フランチャイズとして統合した。1994年のOCはKevin GilbrideとDick Couryの重複、1994年のDCはJeff Fisherの暫定HC移行、2020年の正式DC肩書は資料間で未確認のため要確認とした。2026年はシーズン途中の現行スタッフを含む。",
    "sourceSummary": "主要原典はPro Football Referenceのチーム・コーチ履歴（https://www.pro-football-reference.com/teams/oti/coaches.htm）で、フランチャイズ名とシーズン履歴の基準に使用した。役職別の連続在任年はPro-Football-HistoryのHC（https://pro-football-history.com/franchpos/13/1/tennessee-titans-head-coach-history）、OC（https://pro-football-history.com/franchpos/13/7/tennessee-titans-offensive-coordinator-history）、DC（https://pro-football-history.com/franchpos/13/8/tennessee-titans-defensive-coordinator-history）を照合に使用した。移転・改称と1994年の暫定HCはPro Football Hall of Fameのチーム史（https://www.profootballhof.com/teams/tennessee-titans/team-history）で確認し、2026年の現行HC・OC・DCはTitans公式スタッフページ（https://www.tennesseetitans.com/team/coaches-roster/）およびGus Bradley公式プロフィール（https://www.tennesseetitans.com/team/coaches-roster/gus-bradley）で確認した。"
  },
  {
    "franchise": "Washington Commanders",
    "confirmedRows": 42,
    "reviewRows": 3,
    "coverageNote": "1990–2026年のNFLシーズンを対象に、PFRのWashingtonフランチャイズ年別・コーチ情報とPro Football HistoryのHC・OC・DC履歴を照合した。チーム名はRedskins（1990–2019）、Football Team（2020–2021）、Commanders（2022–2026）として記録し、Joe Gibbs、Ron Rivera、Scott Turner、Jack Del Rioなどの名称変更期間を人物単位で統合可能な形にした。OCは正式に掲載された年のみ収録し、1992、1994–2000、2002年などの正式OC不在・肩書不明年は推測せず要確認とした。DCも1995–1996年および2004–2007年は同様に要確認。Terry RobiskieとBill Callahanは代理HCとして注記し、2026年の現行表示記録はシーズン確定前のため要確認とした。",
    "sourceSummary": "主要原典は、Pro Football ReferenceのWashingtonチーム年鑑・コーチ一覧（https://www.pro-football-reference.com/teams/was/coaches.htm および https://www.pro-football-reference.com/teams/was/index.htm）で、フランチャイズ名称、年別HCおよびシーズン別スタッフ表記を確認した。役職別の連続在任期間と人物名はPro Football HistoryのHC履歴（https://pro-football-history.com/franchise/40/washington-commanders-coaches）、OC履歴（https://pro-football-history.com/franchpos/40/7/washington-commanders-offensive-coordinator-history）、DC履歴（https://pro-football-history.com/franchpos/40/8/washington-commanders-defensive-coordinator-history）で照合した。公式現行スタッフの肩書確認にはWashington Commanders公式コーチ roster（https://www.commanders.com/team/coaches-roster/）も参照した。"
  }
];
