import { coaches as coreCoaches, lineageEdges as coreEdges, sources as coreSources, staffRooms as coreStaffRooms } from "./coaches";
import { expandedCoaches, expandedLineageEdges, expandedStaffRooms } from "./networkExpansion";

export const coaches = [...coreCoaches, ...expandedCoaches];
export const lineageEdges = [...coreEdges, ...expandedLineageEdges];
export const staffRooms = [...coreStaffRooms, ...expandedStaffRooms];
export const sources = [
  ...coreSources,
  { label: "Seattle Seahawks — Pete Carroll’s Coaching Tree", url: "https://www.seahawks.com/news/pete-carroll-s-coaching-tree-continues-to-grow-in-nfl-183261", detail: "Carroll、Quinn、Saleh、Bradleyのスタッフ期を確認" },
  { label: "Pittsburgh Steelers — Bill Cowher", url: "https://www.steelers.com/history/bios/cowher_bill", detail: "CowherのSteelers HC在任期間を確認" },
];
