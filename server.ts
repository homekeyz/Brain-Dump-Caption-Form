import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize GoogleGenAI client to avoid crashing on start if the key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please add it via the Settings > Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for structuring drafts
app.post('/api/generate-caption', async (req, res) => {
  try {
    const { brainDump, tone, platform, ctaText } = req.body;

    if (!brainDump || brainDump.trim() === '') {
      res.status(400).json({ error: "Brain-dump text is required" });
      return;
    }

    const ai = getGeminiClient();

    const promptMessage = `
Input Brain-dump:
"""
${brainDump}
"""

Instructions:
- Tone slider value/description: ${tone} (Adjust word choice, sentence structure, punctuation, and style to match this tone precisely)
- Social Platform format: ${platform}
- Desired Call to Action (CTA) details: ${ctaText}

Build a gorgeous social caption with Hook, Value, CTA. Output structured JSON.
`;

// 1. Hook, Value, CTA, and Hashtags configuration
    const systemInstruction = `You are an elite copywriting expert and conversion optimization specialist who turns chaotic brain-dumps of thoughts into high-performing, scroll-stopping social media posts using the 'Hook, Value, CTA' (HVC) framework.

When given a brain-dump of messy notes, a tone description, a target platform, and a CTA objective:
1. De-clutter, distill, and coordinate the notes.
2. Create a striking Hook (the very first line) that stops the scroll. Make it high-impact, curiosity-driven, problem-centric, or high-conviction.
3. Formulate the Value section with generous whitespace (double linebreaks) and clean spacing. Convert clusters of messy words into crystal-clear bullet points or readable, brief paragraphs.
4. Integrate a highly natural CTA based on the requested CTA motive.
5. Setup 'fullFormattedText' as the combined post incorporating the Hook, Value, and CTA. Make sure it uses appropriate emojis and spacing typical of the target platform and tone.
6. Deliver precisely three 'alternativeHooks' representing different marketing angles (e.g., questions, facts, personal stories, or extreme counter-statements).
7. Provide a concise 'analysis' highlighting why this copy converts and tips for post delivery.
8. Suggest a list of 5 to 10 highly relevant and trending hashtags based on the keywords and the overall topic of the caption in 'suggestedHashtags'.`;

    const captionSchema = {
      type: Type.OBJECT,
      properties: {
        caption: {
          type: Type.OBJECT,
          properties: {
            hook: {
              type: Type.STRING,
              description: "The scroll-stopping opening line of the caption.",
            },
            value: {
              type: Type.STRING,
              description: "The body copy of the caption, containing the main value, written in a clear, punctuated format.",
            },
            cta: {
              type: Type.STRING,
              description: "The closing Call to Action line.",
            },
            fullFormattedText: {
              type: Type.STRING,
              description: "The complete caption combining hook, value, and CTA with perfect line breaks, paragraph spacing, and emoji design.",
            },
          },
          required: ["hook", "value", "cta", "fullFormattedText"],
        },
        analysis: {
          type: Type.OBJECT,
          properties: {
            hookStrength: {
              type: Type.STRING,
              description: "Short classification and rating of the hook (e.g. 'Strong (Curiosity Angle)').",
            },
            whyItWorks: {
              type: Type.STRING,
              description: "A quick explanation of why this structured layout gets attention and builds engagement.",
            },
            readabilityTips: {
              type: Type.STRING,
              description: "Actionable layout, hashtags, or formatting tips.",
            },
          },
          required: ["hookStrength", "whyItWorks", "readabilityTips"],
        },
        alternativeHooks: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: "Precisely three alternative hooks targeting unique psychological angles.",
        },
        suggestedHashtags: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: "A list of 5 to 10 highly relevant and trending social media hashtags.",
        },
      },
      required: ["caption", "analysis", "alternativeHooks", "suggestedHashtags"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: captionSchema,
        temperature: 0.8,
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);

  } catch (error: any) {
    console.error("Error in /api/generate-caption:", error);
    res.status(500).json({ 
      error: error.message || "An unexpected error occurred while processing with Gemini" 
    });
  }
});

// Configure Vite or Serve static build folder
async function initializeApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
  });
}

initializeApp().catch((err) => {
  console.error("Failed to start server:", err);
});
