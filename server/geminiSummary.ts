interface SummaryResult {
  japaneseSummary: string;
  englishSummary: string;
}

export async function generateBilingualSummary(title: string, rawText: string): Promise<SummaryResult | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[Gemini API] GEMINI_API_KEY is not set.");
    return null;
  }

  const prompt = `You are an expert NFL analyst and bilingual editor.
Based on the following NFL article title and snippet, produce two summaries:
1. "japaneseSummary": 2 to 3 concise, clear Japanese bullet points explaining the core news to a Japanese NFL fan.
2. "englishSummary": 2 to 3 concise, clear English bullet points explaining the core news.

Output MUST be strictly valid JSON matching this structure:
{
  "japaneseSummary": "・要点1\\n・要点2\\n・要点3",
  "englishSummary": "• Key takeaway 1\\n• Key takeaway 2\\n• Key takeaway 3"
}

Article Title: ${title}
Article Snippet: ${rawText.slice(0, 1000)}`;

  const model = "gemini-3.6-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // 503（一時的過負荷）対策として最大2回試行
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

      const parsed = JSON.parse(contentText);
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
