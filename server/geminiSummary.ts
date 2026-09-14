interface SummaryResult {
  japaneseSummary: string;
  englishSummary: string;
}

/**
 * Google AI Studio の Gemini API を使用して、記事のタイトルと概要から日英の3行要約を生成する
 */
export async function generateBilingualSummary(title: string, rawText: string): Promise<SummaryResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
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

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
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

    if (!response.ok) {
      console.warn(`[Gemini API] Failed to generate summary: ${response.status}`);
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
    console.warn("[Gemini API] Error during summary generation:", error instanceof Error ? error.message : error);
    return null;
  }
}
