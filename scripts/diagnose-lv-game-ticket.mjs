import { getOfficialTeamSnapshot } from "../server/db.ts";

const snapshot = await getOfficialTeamSnapshot("LV");
console.log(JSON.stringify({
  team: "LV",
  nextGame: snapshot?.nextGame,
  lastGame: snapshot?.lastGame,
  ticketGame: snapshot?.ticketGame,
  scoreboardGames: snapshot?.scoreboardGames?.filter((game) => game.awayCode === "LV" || game.homeCode === "LV"),
}, null, 2));
