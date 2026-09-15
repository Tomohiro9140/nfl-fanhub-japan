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

  // 記事の中身をより多く渡す（最大4,000文字）
  const articleBody = rawText.slice(0, 4000);

  const prompt = `You are a professional NFL beat writer and expert analyst for Japanese NFL fans.
Read the following NFL article title and text carefully. Then, provide a detailed, substantive summary that explains the ACTUAL CONTENT, facts, performance evaluations, and tactical takeaways of the article.

[CRITICAL INSTRUCTIONS FOR "japaneseSummary"]
1. DO NOT write meta-summaries or table-of-contents introductions such as "〜についての記事" (Article about...), "〜を掲載している" (Features...), "〜を解説" (Explains...), or "〜のレビュー".
2. Write the ACTUAL SUBSTANCE and analysis directly (e.g., what specific plays worked, player performance details, coach comments, tactical strengths/weaknesses, statistical context).
3. Target length: approximately 350 to 450 Japanese characters.
4. Format: Either a well-structured multi-point breakdown or 2-3 substantive analytical paragraphs explaining the core story in depth.

[CRITICAL INSTRUCTIONS FOR "englishSummary"]
1. Provide a clear, substantive English summary (3 to 4 detailed bullet points or 1-2 analytical paragraphs) focusing on concrete takeaways, facts, and film breakdown points.
2. Avoid generic meta-statements like "This article discusses...".

Output MUST be strictly valid JSON matching this schema:
{
  "japaneseSummary": "記事の具体的な事実や分析内容を直接記述した400字前後の詳細要約",
  "englishSummary": "Substantive takeaway 1\\nSubstantive takeaway 2\\nSubstantive takeaway 3"
}

Article Title: ${title}
Article Content:
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
            temperature: 0.2,
            maxOutputTokens: 1500, // 400字以上の長文でも途切れないよう拡張
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

      // JSON パース（前後の空白や余分な改行をトリム）
      const parsed = JSON.parse(contentText.trim());
      return {
        japaneseSummary: parsed.japaneseSummary || "",
        englishSummary: parsed.englishSummary || "",
      };
    } catch (error) {
      console.warn(`[Gemini API] Error on attempt ${attempt}:`, error instanceof Error ? error.message : error);
    }
  }

  return null;
}
