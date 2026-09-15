interface SummaryResult {
  japaneseSummary: string;
  englishSummary: string;
}

export async function generateBilingualSummary(
  title: string,
  rawText: string
): Promise<SummaryResult | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[Gemini API] GEMINI_API_KEY is not set.");
    return null;
  }

  // 記事の中身を最大4,000文字まで渡す
  const articleBody = rawText.slice(0, 4000);

  const prompt = `You are a professional NFL analyst writing for passionate Japanese NFL fans.
Analyze the following article carefully and provide a comprehensive, substantive bilingual summary focusing directly on the facts, specific plays, tactical details, roster decisions, and performance breakdowns.

[Rules for japaneseSummary]
- Target length: 350 to 450 Japanese characters.
- DO NOT use meta-phrases such as "〜についての記事", "〜を掲載している", "〜を分析している", or "〜のレビュー".
- Directly describe WHAT happened, WHO did what, HOW players/teams performed, and WHAT the tactical takeaways are.
- Provide concrete substance, player names, tactical strengths/weaknesses, or game context.

[Rules for englishSummary]
- Provide 3 to 4 detailed bullet points or paragraphs covering the core takeaways, facts, and film breakdown points.
- Avoid generic meta-announcements.

Article Title: ${title}
Article Body:
${articleBody}`;

  const model = "gemini-3.6-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            // Structured Outputs: JSONの型スキーマを厳格に強制
            responseSchema: {
              type: "OBJECT",
              properties: {
                japaneseSummary: {
                  type: "STRING",
                  description: "350〜450字の具体的な分析・事実・試合展開を記述した日本語要約",
                },
                englishSummary: {
                  type: "STRING",
                  description: "Detailed takeaways, facts, and film breakdown points in English",
                },
              },
              required: ["japaneseSummary", "englishSummary"],
            },
            temperature: 0.2,
            maxOutputTokens: 2500,
          },
        }),
      });

      if (response.status === 503 && attempt === 1) {
        console.warn(`[Gemini API] 503 high demand on attempt 1. Retrying in 2s...`);
        await new Promise((res) => setTimeout(res, 2000));
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[Gemini API] ${model} returned ${response.status}: ${errText}`);
        return null;
      }

      const data = await response.json();
      const contentText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!contentText) return null;

      let cleaned = contentText.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(cleaned);
      return {
        japaneseSummary: parsed.japaneseSummary?.trim() || "",
        englishSummary: parsed.englishSummary?.trim() || "",
      };
    } catch (error) {
      console.warn(`[Gemini API] Error on attempt ${attempt}:`, error instanceof Error ? error.message : error);
    }
  }

  return null;
}
