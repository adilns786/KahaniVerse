import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, step, selectedParams } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid prompt provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.error("[v0] GEMINI_API_KEY is not set");
      return NextResponse.json(
        {
          error:
            "API key not configured. Please add GEMINI_API_KEY to your environment variables.",
        },
        { status: 500 }
      );
    }

    // Step 1: Get structured parameter options
    if (step === "get-options" || !step) {
      const structurePrompt = `Analyze this story prompt and suggest options for the user to choose from:
Prompt: "${prompt}"

Provide MULTIPLE OPTIONS for each category in JSON format:
{
  "genres": ["option1", "option2", "option3"],
  "tones": ["option1", "option2", "option3"],
  "lengths": ["short", "medium", "long"],
  "characters": ["suggestion1", "suggestion2", "suggestion3"],
  "settings": ["option1", "option2", "option3"]
}

Make sure it's valid JSON with at least 3 options per category. Base suggestions on the prompt context.`;

      const structureResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: structurePrompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!structureResponse.ok) {
        const errorText = await structureResponse.text();
        throw new Error(`Failed to get parameter options: ${errorText}`);
      }

      const structureData = await structureResponse.json();
      const rawResponse =
        structureData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      console.log("[v0] Raw options response:", rawResponse);

      // Parse JSON from the response (handle markdown code blocks if present)
      let options;
      try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : rawResponse;
        options = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("[v0] Failed to parse options JSON:", parseError);
        // Provide default options if parsing fails
        options = {
          genres: ["Fantasy", "Science Fiction", "Mystery"],
          tones: ["Dramatic", "Humorous", "Suspenseful"],
          lengths: ["short", "medium", "long"],
          characters: ["Protagonist with hidden past", "Unlikely hero", "Mentor figure"],
          settings: ["Urban city", "Fantasy realm", "Futuristic world"],
        };
      }

      return NextResponse.json({ options });
    }

    // Step 2: Generate the story with selected parameters
    if (step === "generate-story") {
      if (!selectedParams) {
        return NextResponse.json(
          { error: "Selected parameters are required for story generation" },
          { status: 400 }
        );
      }

      const paramsDescription = Object.entries(selectedParams)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

      const storyPrompt = `Write a complete story based on this prompt: "${prompt}"

User-selected parameters:
${paramsDescription || "No specific parameters selected - use your creative judgment"}

Requirements:
- A clear beginning, middle, and end
- Vivid descriptions and engaging dialogue
- Character development
- A satisfying narrative arc
- Match the selected tone and genre
- Appropriate length based on selection

Write the complete story now:`;

      const storyResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: storyPrompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!storyResponse.ok) {
        throw new Error("Failed to generate story");
      }

      const storyData = await storyResponse.json();
      const story =
        storyData.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No story generated.";

      return NextResponse.json({ story });
    }

    return NextResponse.json(
      { error: "Invalid step parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[v0] Error in story generation:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}