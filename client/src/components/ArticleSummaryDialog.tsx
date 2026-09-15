import React, { useState } from "react";
import { ExternalLink, Sparkles, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export interface SummaryArticle {
  id: number;
  title: string;
  summary: string | null;
  japaneseSummary?: string | null;
  englishSummary?: string | null;
  sourceUrl: string;
  sourceName: string;
  sourceKind: string;
  publishedAt: Date;
}

interface ArticleSummaryDialogProps {
  article: SummaryArticle | null;
  open: boolean;
  onClose: () => void;
}

export function ArticleSummaryDialog({
  article,
  open,
  onClose,
}: ArticleSummaryDialogProps) {
  const [activeTab, setActiveTab] = useState<"ja" | "en">("ja");

  if (!article) return null;

  const jaText =
    article.japaneseSummary ||
    article.summary ||
    "日本語の要約は準備中です。下のボタンから元記事をご確認ください。";
  const enText =
    article.englishSummary ||
    article.summary ||
    "English summary is currently being prepared. Please view the original article below.";

  const formattedDate = `${new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(new Date(article.publishedAt))} JST`;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white border border-[#ded8cc] shadow-2xl rounded-xl">
        <div className="p-5 border-b border-[#eeeae1] bg-[#fcfbf9]">
          <div className="flex items-center gap-2 mb-2 font-mono text-[10px] font-semibold text-[#64748b]">
            <span className="px-1.5 py-0.5 bg-[#10213a] text-white font-bold tracking-wider uppercase text-[9px]">
              {article.sourceName || article.sourceKind}
            </span>
            <span>{formattedDate}</span>
          </div>
          <DialogTitle className="font-display text-lg sm:text-xl font-bold text-[#10213a] leading-snug">
            {article.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            記事要約モーダル
          </DialogDescription>
        </div>

        {/* 日英切り替えタブ */}
        <div className="flex border-b border-[#eeeae1] bg-[#f8f6f0] px-5 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("ja")}
            className={`flex items-center gap-1.5 px-4 py-2 font-mono text-xs font-bold transition-colors border-b-2 ${
              activeTab === "ja"
                ? "border-[#e85d2a] text-[#10213a] bg-white rounded-t-md"
                : "border-transparent text-[#64748b] hover:text-[#10213a]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e85d2a]" />
            日本語要約
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("en")}
            className={`flex items-center gap-1.5 px-4 py-2 font-mono text-xs font-bold transition-colors border-b-2 ${
              activeTab === "en"
                ? "border-[#e85d2a] text-[#10213a] bg-white rounded-t-md"
                : "border-transparent text-[#64748b] hover:text-[#10213a]"
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-[#526173]" />
            English Summary
          </button>
        </div>

        {/* 要約本文エリア */}
        <div className="p-5 max-h-[45vh] overflow-y-auto">
          <div className="text-sm leading-relaxed text-[#334155] whitespace-pre-wrap font-sans">
            {activeTab === "ja" ? jaText : enText}
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-4 border-t border-[#eeeae1] bg-[#fcfbf9]">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="font-mono text-xs font-bold text-[#64748b] hover:text-[#10213a]"
          >
            閉じる
          </Button>
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#10213a] hover:bg-[#e85d2a] rounded-md transition-colors shadow-sm"
          >
            元記事を読む
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
