/**
 * Archive Atlas data reminder: STC appointments are display-only career history.
 * They do not create new lineage nodes or route edges.
 */
import type { Appointment } from "./coaches";

export const stcHistories: Record<string, Appointment[]> = {
  "joe judge": [
    { years: "2015–2018", team: "New England Patriots", role: "STC", sourceUrl: "https://www.giants.com/news/joe-judge-head-coach-5-things-to-know-patriots-special-teams-coordinator" },
    { years: "2019", team: "New England Patriots", role: "STC", sourceUrl: "https://www.patriots.com/news/patriots-hire-joe-judge-as-offensive-assistant" },
  ],
  "john harbaugh": [
    { years: "1998–2006", team: "Philadelphia Eagles", role: "STC", sourceUrl: "https://www.baltimoreravens.com/news/john-harbaugh-bio-7748188" },
  ],
  "ken whisenhunt": [
    { years: "1999", team: "Cleveland Browns", role: "STC", sourceUrl: "https://www.clevelandbrowns.com/news/what-they-re-saying-about-phil-dawson-quotes-from-joe-thomas-josh-cribbs-and-mor" },
  ],
};
