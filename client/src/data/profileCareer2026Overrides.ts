/* Archive Atlas reminder: 2026 new-HC Profile overrides retain every sourced NFL coaching post; only formal HC/OC/DC/STC receive glyphs. */
import type { Appointment } from "./coaches";

const post = (years: string, team: string, role: Appointment["role"], title: string, sourceUrl: string): Appointment => ({ years, team, role, title, sourceUrl });

export const profileCareer2026Overrides: Record<string, Appointment[]> = {
  jeffhafley: [
    post("2012", "Tampa Bay Buccaneers", "OTHER", "Assistant Defensive Backs Coach", "https://www.packers.com/news/packers-name-jeff-hafley-defensive-coordinator"),
    post("2013", "Tampa Bay Buccaneers", "OTHER", "Secondary / Safeties Coach", "https://www.packers.com/news/packers-name-jeff-hafley-defensive-coordinator"),
    post("2014–2015", "Cleveland Browns", "OTHER", "Defensive Backs Coach", "https://www.packers.com/news/packers-name-jeff-hafley-defensive-coordinator"),
    post("2016–2018", "San Francisco 49ers", "OTHER", "Defensive Backs Coach", "https://www.packers.com/news/packers-name-jeff-hafley-defensive-coordinator"),
    post("2024–2025", "Green Bay Packers", "DC", "Defensive Coordinator", "https://www.packers.com/news/packers-name-jeff-hafley-defensive-coordinator"),
    post("2026–", "Miami Dolphins", "HC", "Head Coach", "https://www.miamidolphins.com/team/coaches-roster/"),
  ],
  jesseminter: [
    post("2017–2018", "Baltimore Ravens", "OTHER", "Defensive Assistant", "https://www.baltimoreravens.com/news/jesse-minter-ravens-hired-head-coaching-history-timeline"),
    post("2019", "Baltimore Ravens", "OTHER", "Assistant Defensive Backs Coach", "https://www.baltimoreravens.com/news/jesse-minter-ravens-hired-head-coaching-history-timeline"),
    post("2020", "Baltimore Ravens", "OTHER", "Defensive Backs Coach", "https://www.baltimoreravens.com/news/jesse-minter-ravens-hired-head-coaching-history-timeline"),
    post("2024–2025", "Los Angeles Chargers", "DC", "Defensive Coordinator", "https://www.chargers.com/news/los-angeles-chargers-name-jesse-minter-defensive-coordinator-2024"),
    post("2026–", "Baltimore Ravens", "HC", "Head Coach", "https://www.baltimoreravens.com/team/coaches-roster/jesse-minter"),
  ],
  joebrady: [
    post("2017–2018", "New Orleans Saints", "OTHER", "Offensive Assistant", "https://static.clubs.nfl.com/image/upload/bills/ms51runewd1ps7h5llrf"),
    post("2020–2021", "Carolina Panthers", "OC", "Offensive Coordinator", "https://static.clubs.nfl.com/image/upload/bills/ms51runewd1ps7h5llrf"),
    post("2022–2023", "Buffalo Bills", "OTHER", "Quarterbacks Coach", "https://static.clubs.nfl.com/image/upload/bills/ms51runewd1ps7h5llrf"),
    post("2023", "Buffalo Bills", "OC", "Interim Offensive Coordinator", "https://static.clubs.nfl.com/image/upload/bills/ms51runewd1ps7h5llrf"),
    post("2024–2025", "Buffalo Bills", "OC", "Offensive Coordinator", "https://static.clubs.nfl.com/image/upload/bills/ms51runewd1ps7h5llrf"),
    post("2026–", "Buffalo Bills", "HC", "Head Coach", "https://www.buffalobills.com/team/coaches-roster/"),
  ],
  klintkubiak: [
    post("2013–2014", "Minnesota Vikings", "OTHER", "Quality Control / Assistant Wide Receivers Coach", "https://www.raiders.com/news/klint-kubiak-named-head-coach-of-the-las-vegas-raiders"),
    post("2016–2018", "Denver Broncos", "OTHER", "Offensive Assistant / Quarterbacks Coach", "https://www.raiders.com/news/klint-kubiak-named-head-coach-of-the-las-vegas-raiders"),
    post("2019–2020", "Minnesota Vikings", "OTHER", "Quarterbacks Coach", "https://www.raiders.com/news/klint-kubiak-named-head-coach-of-the-las-vegas-raiders"),
    post("2021", "Minnesota Vikings", "OC", "Offensive Coordinator", "https://www.raiders.com/news/klint-kubiak-named-head-coach-of-the-las-vegas-raiders"),
    post("2022", "Denver Broncos", "OTHER", "Offensive Passing Game Coordinator / Quarterbacks Coach", "https://www.raiders.com/news/klint-kubiak-named-head-coach-of-the-las-vegas-raiders"),
    post("2023", "San Francisco 49ers", "OTHER", "Offensive Passing Game Specialist", "https://www.raiders.com/news/klint-kubiak-named-head-coach-of-the-las-vegas-raiders"),
    post("2024", "New Orleans Saints", "OC", "Offensive Coordinator", "https://www.raiders.com/news/klint-kubiak-named-head-coach-of-the-las-vegas-raiders"),
    post("2025", "Seattle Seahawks", "OC", "Offensive Coordinator", "https://www.raiders.com/news/klint-kubiak-named-head-coach-of-the-las-vegas-raiders"),
    post("2026–", "Las Vegas Raiders", "HC", "Head Coach", "https://www.raiders.com/news/raiders-announce-2026-coaching-staff"),
  ],
  mikelafleur: [
    post("2014", "Cleveland Browns", "OTHER", "Offensive Intern (Offensive Line)", "https://www.therams.com/news/rams-hire-mike-lafleur-as-offensive-coordinator"),
    post("2015", "Atlanta Falcons", "OTHER", "Offensive Assistant / Tight Ends", "https://www.therams.com/news/rams-hire-mike-lafleur-as-offensive-coordinator"),
    post("2016", "Atlanta Falcons", "OTHER", "Offensive Assistant / Wide Receivers", "https://www.therams.com/news/rams-hire-mike-lafleur-as-offensive-coordinator"),
    post("2017", "San Francisco 49ers", "OTHER", "Passing Game Specialist / Wide Receivers Coach", "https://www.therams.com/news/rams-hire-mike-lafleur-as-offensive-coordinator"),
    post("2018", "San Francisco 49ers", "OTHER", "Passing Game Coordinator / Wide Receivers Coach", "https://www.therams.com/news/rams-hire-mike-lafleur-as-offensive-coordinator"),
    post("2019–2020", "San Francisco 49ers", "OTHER", "Passing Game Coordinator", "https://www.therams.com/news/rams-hire-mike-lafleur-as-offensive-coordinator"),
    post("2021–2022", "New York Jets", "OC", "Offensive Coordinator", "https://www.newyorkjets.com/news/jets-offensive-coaching-staff-hires"),
    post("2023–2025", "Los Angeles Rams", "OC", "Offensive Coordinator", "https://www.therams.com/news/rams-hire-mike-lafleur-as-offensive-coordinator"),
    post("2026–", "Arizona Cardinals", "HC", "Head Coach", "https://www.azcardinals.com/team/coaches-roster/mike-lafleur"),
  ],
  toddmonken: [
    post("2007–2010", "Jacksonville Jaguars", "OTHER", "Wide Receivers Coach", "https://browns.1rmg.com/press-releases/todd-monken-named-browns-head-coach-1-28-26/"),
    post("2016–2017", "Tampa Bay Buccaneers", "OC", "Offensive Coordinator / Wide Receivers Coach", "https://www.baltimoreravens.com/news/todd-monken-hired-offensive-coordinator"),
    post("2018", "Tampa Bay Buccaneers", "OC", "Offensive Coordinator", "https://www.baltimoreravens.com/news/todd-monken-hired-offensive-coordinator"),
    post("2019", "Cleveland Browns", "OC", "Offensive Coordinator", "https://www.baltimoreravens.com/news/todd-monken-hired-offensive-coordinator"),
    post("2023–2025", "Baltimore Ravens", "OC", "Offensive Coordinator", "https://www.baltimoreravens.com/news/todd-monken-hired-offensive-coordinator"),
    post("2026–", "Cleveland Browns", "HC", "Head Coach", "https://browns.1rmg.com/press-releases/todd-monken-named-browns-head-coach-1-28-26/"),
  ],
};
