import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function analyzeContentSentiment(content: string): Promise<{
  sentiment: "positive" | "neutral" | "negative";
  score: number;
  analysis: string;
  flagged: boolean;
  flagReason?: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a content moderation AI. Analyze the given blog content for:
1. Overall sentiment (positive, neutral, negative)
2. Quality score (0-100 based on writing quality, coherence, value)
3. Content appropriateness (flag inappropriate content)
4. Brief analysis summary

Respond with JSON in this exact format:
{
  "sentiment": "positive|neutral|negative",
  "score": number_0_to_100,
  "analysis": "brief analysis summary",
  "flagged": boolean,
  "flagReason": "reason if flagged, null otherwise"
}`,
        },
        {
          role: "user",
          content: content,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      sentiment: result.sentiment || "neutral",
      score: Math.max(0, Math.min(100, result.score || 50)),
      analysis: result.analysis || "Content analyzed",
      flagged: result.flagged || false,
      flagReason: result.flagReason || undefined,
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    return {
      sentiment: "neutral",
      score: 50,
      analysis: "AI analysis unavailable",
      flagged: false,
    };
  }
}

export async function generateExcerpt(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "Generate a compelling 2-3 sentence excerpt from the given blog content that would encourage readers to click and read more. Keep it under 150 characters.",
        },
        {
          role: "user",
          content: content,
        },
      ],
    });

    return response.choices[0].message.content || content.substring(0, 150) + "...";
  } catch (error) {
    console.error("Excerpt generation failed:", error);
    return content.substring(0, 150) + "...";
  }
}

export async function suggestImprovements(content: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `Analyze the blog content and provide 3-5 specific, actionable suggestions for improvement. 
Respond with JSON in this format:
{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`,
        },
        {
          role: "user",
          content: content,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.suggestions || [];
  } catch (error) {
    console.error("Suggestion generation failed:", error);
    return [];
  }
}
