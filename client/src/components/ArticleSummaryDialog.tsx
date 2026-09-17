import React, { useEffect, useState } from "react";
import { ExternalLink, Sparkles, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
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

/**
 * 要約テキストを解析し、改行がない場合でも文脈・句点に応じて
 * 自動的に読みやすい段落（空行）に分割してレンダリングするフォーマッター
 */
function FormattedSummaryContent({ content }: { content?: string | null }) {
  if (!content) {
    return <p className="text-sm text-[#64748b]">要約がありません。「もう一度要約を試す」を押してください。</p>;
  }

  // 1. すでに改行コード（\n）が含まれている場合は、改行ごとに段落化
  if (content.includes("\n")) {
    const paragraphs = content
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    return (
      <div className="space-y-3.5">
        {paragraphs.map((para, idx) => (
          <p key={idx} className="leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    );
  }

  // 2. 改行がないベタテキストの場合：句点（。）で文を分割し、1〜2文（80〜120文字程度）ごとに自然な段落を作る
  const rawSentences = content.match(/[^。！？]+[。！？]?/g) || [content];
  const sentences = rawSentences.map((s) => s.trim()).filter(Boolean);

  if (sentences.length <= 1) {
    return <p className="leading-relaxed">{content}</p>;
  }

  const paragraphs: string[] = [];
  let currentParagraph = "";

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    if (!currentParagraph) {
      currentParagraph = s;
    } else {
      // 現在の段落が一定の長さ（約80文字以上）に達したら新しい段落へ分ける
      if (currentParagraph.length >= 80) {
        paragraphs.push(currentParagraph);
        currentParagraph = s;
      } else {
        currentParagraph += s;
      }
    }
  }
  if (currentParagraph) {
    paragraphs.push(currentParagraph);
  }

  return (
    <div className="space-y-3.5">
      {paragraphs.map((para, idx) => (
        <p key={idx} className="leading-relaxed">
          {para}
        </p>
      ))}
    </div>
  );
}

export function ArticleSummaryDialog({
  article,
  open,
  onClose,
}: ArticleSummaryDialogProps) {
  const [sessionSummaries, setSessionSummaries] = useState<Record<number, string>>({});
  const [hasFailed, setHasFailed] = useState(false);

  const summaryMutation = trpc.officialFeed.japaneseSummary.useMutation({
    onSuccess: (data) => {
      if (data?.generated && data.summary) {
        setSessionSummaries((prev) => ({
          ...prev,
          [data.itemId]: data.summary,
        }));
        setHasFailed(false);
      } else {
        setHasFailed(true);
      }
    },
    onError: () => {
      setHasFailed(true);
    },
  });

  const requestSummary = () => {
    if (!article) return;
    setHasFailed(false);
    summaryMutation.mutate({ itemId: article.id });
  };

  useEffect(() => {
    if (!open || !article) {
      setHasFailed(false);
      return;
    }

    const currentSummary = sessionSummaries[article.id] ?? article.japaneseSummary;
    if (!currentSummary && !summaryMutation.isPending) {
      requestSummary();
    }
  }, [open, article?.id]);

  if (!article) return null;

  const currentSummary = sessionSummaries[article.id] ?? article.japaneseSummary;
  const isGenerating = summaryMutation.isPending && !currentSummary;

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

        {/* 要約ヘッダー */}
        <div className="flex items-center gap-1.5 border-b border-[#eeeae1] bg-[#f8f6f0] px-5 py-2.5">
          <Sparkles className="w-3.5 h-3.5 text-[#e85d2a]" />
          <span className="font-mono text-xs font-bold text-[#10213a]">AI要約</span>
        </div>

        {/* 要約本文エリア */}
        <div className="p-5 max-h-[48vh] min-h-[140px] overflow-y-auto">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#e85d2a]" />
              <p className="font-mono text-xs font-semibold text-[#64748b]">
                Gemini AI が要約を生成中…
              </p>
            </div>
          ) : hasFailed && !currentSummary ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 bg-[#fff8f6] rounded-lg border border-[#fbdad4] p-4">
              <AlertCircle className="w-5 h-5 text-[#e85d2a]" />
              <p className="text-xs text-[#842e1b] font-medium leading-relaxed">
                要約の取得に失敗しました。一時的な混雑の可能性があります。
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={requestSummary}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e85d2a] border-[#e85d2a] hover:bg-[#fff0eb]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                もう一度要約を試す
              </Button>
            </div>
          ) : (
            <div className="text-sm text-[#334155] font-sans">
              <FormattedSummaryContent content={currentSummary} />
            </div>
          )}
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
