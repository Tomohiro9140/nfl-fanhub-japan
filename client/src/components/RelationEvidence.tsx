/**
 * Archive Atlas visual reminder: relation records favor concise, readable staff-period summaries.
 */
import { ArrowUpRight, Network } from "lucide-react";
import type { LineageEdge } from "@/data/coaches";

export function RelationEvidence({ edge, fromName, toName, fromRole: _fromRole, toRole: _toRole, onOpenCoach, onOpenStaff, compact = false }: { edge: LineageEdge; fromName?: string; toName?: string; fromRole: string; toRole: string; onOpenCoach: (id: string) => void; onOpenStaff?: () => void; compact?: boolean }) {
  if (compact) return <section className="relation-detail is-compact"><div className="relation-team"><strong>{edge.team}</strong><span>{edge.years}</span></div><p className="relation-compact-line"><b>{fromName ?? edge.from} <em>↔</em> {toName ?? edge.to}</b><span>{edge.note}</span></p></section>;
  return <section className="relation-detail"><div className="relation-detail-head"><Network size={16} /><span><b>RELATION RECORD</b><small>選択した線のスタッフ期</small></span></div><div className="relation-team"><strong>{edge.team}</strong><span>{edge.years}</span></div><div className="relation-pair"><button type="button" onClick={() => onOpenCoach(edge.from)}><b>{fromName ?? edge.from}</b></button><i>↔</i><button type="button" onClick={() => onOpenCoach(edge.to)}><b>{toName ?? edge.to}</b></button></div><p>{edge.note}</p>{onOpenStaff ? <button className="relation-season-link" onClick={onOpenStaff}>このスタッフ期を年鑑で開く <ArrowUpRight size={14} /></button> : <span className="relation-source-note">該当するスタッフ年鑑レコードは順次追加します。</span>}</section>;
}
