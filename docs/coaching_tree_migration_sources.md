# Coaching Tree Migration — Source Inventory

## Referenced task

The user requested a faithful migration from the owned referenced task **NFLコーチングツリー 未実装** (`36KM4WfNwB7lLutCdhqxlB`). Its associated project is **NFL Coaching Tree Atlas**.

## Confirmed migration assets

| Asset | Purpose in source project |
|---|---|
| `coachRegistry.ts` | Coach directory and primary coaching-tree data |
| `completeStaffAlmanac.ts` | Staff almanac data view |
| `profileCareerData.ts` / `profileCareer2026Overrides.ts` | Coach career profiles and current-season overrides |
| `userVerifiedLineageRelations.ts` / `hc2000IntakeRelations.ts` | Audited coach relationship data |
| `completeStaffAlmanac.css` / `mobileLineageMap.css` / `expandedMapCanvas.css` | Desktop and mobile presentation rules |
| `audited_tree_desktop.png` / `audited_tree_mobile.png` | Main lineage-map visual reference |
| `complete_staff_desktop.png` / `complete_staff_mobile.png` | Staff almanac visual reference |
| `profile_careers_desktop.png` / `profile_careers_mobile.png` | Coach profile visual reference |

## Observed source behavior

The source task records an interactive lineage atlas with coach-node selection, relationship highlighting, expanded-map controls, staff/almanac views, coach career records, and mobile-specific layouts. It explicitly treats the main coaching-tree map as the product’s core and preserves only relationships with a stated supporting basis.

The final reference screens use an editorial warm-paper canvas, a dark-navy typographic system, fine ruled lines, square evidence labels, colored coaching-role dots, and thin curved relationship paths. The desktop lineage plate is a wide map with a left-rooted tree. The mobile layout retains the same map hierarchy in a taller, horizontally explorable atlas canvas with the controls and coach profile following the map rather than replacing it.

## Required dependency closure

The final `Home.tsx` additionally depends on the coaching data modules `coaches`, `networkData`, `networkExpansion`, `multiGenerationLineages`, `directStaffLineages`, `stcHistories`, `verifiedRoleHistories`, `lineageAtlas`, `completeStaffAlmanac`, `allHcStaffAlmanac`, `profileCareerData`, and the audited relationship modules. It imports the companion `RelationEvidence` component and map, profile, staff archive, relationship, directory, and pathfinder stylesheet modules. The migration must copy this dependency closure rather than recreate a visually similar subset.

The original temporary preview could not be reopened without a separate Manus login, so final visual comparison uses the task’s retained mobile and desktop reference captures plus the recovered final source. The HC staff-almanac source was regenerated from the original task’s retained 200-subject research input and 983-season coverage input, reproducing its 942 generated team-season records.

## Integration visual check

The integrated `/coaching-tree/` view was checked at desktop (1280px) and mobile (390px) widths. Both preserve the source’s cream atlas canvas, three-part desktop arrangement, mobile ordering of Index → Map → Profile, role markers, searchable coach index, lineage plates, map controls, and curved relationship lines. The FAN/HUB navigation is deliberately the only additive overlay so that the route can return to Home without changing the imported atlas content.

An interactive browser check selected Andy Reid from the coach index. The selected lineage changed to the Andy Reid plate; its map rendered 31 nodes and 33 relationships; the profile synchronized to Andy Reid and showed the Philadelphia Eagles and Kansas City Chiefs HC appointments. This confirms the imported index, lineage, profile, and HC staff-almanac data are connected in the FAN/HUB route.

The embedded menu was opened on the Coaching Tree route and its HOME item navigated successfully to the FAN/HUB top page. The top page’s primary navigation also exposes the reciprocal COACHING TREE route alongside ATLAS and FIELDLINE.

## Provenance

The above files and screenshots are user-authorized artifacts from the referenced task, retrieved on 2026-08-27 through the task’s artifact inventory. Source downloads expire, so imported project copies must be retained in this project once retrieved.
