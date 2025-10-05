import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt provided" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error("[v0] GEMINI_API_KEY is not set")
      return NextResponse.json(
        { error: "API key not configured. Please add GEMINI_API_KEY to your environment variables." },
        { status: 500 },
      )
    }

    // Step 1: Structure the story parameters
    const structurePrompt = `Analyze this story prompt and provide a structured specification:
Prompt: "${prompt}"

Provide the following in a clear format:
- Genre
- Main characters (brief descriptions)
- Setting
- Tone (e.g., dramatic, humorous, mysterious)
- Suggested length (short, medium, long)

Keep it concise and focused.`

    const structureResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
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
      },
    )

    if (!structureResponse.ok) {
      throw new Error("Failed to structure story parameters")
    }

    const structureData = await structureResponse.json()
    const structuredParams = structureData.candidates?.[0]?.content?.parts?.[0]?.text || ""

    console.log("[v0] Structured parameters:", structuredParams)

    // Step 2: Generate the actual story
    const storyPrompt = `Based on this prompt: "${prompt}"

And these structured parameters:
${structuredParams}

Write a compelling, well-structured story with:
- A clear beginning, middle, and end
- Vivid descriptions and engaging dialogue
- Character development
- A satisfying narrative arc

Make it creative, original, and captivating. Write the complete story now:`

    const storyResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
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
      },
    )

    if (!storyResponse.ok) {
      throw new Error("Failed to generate story")
    }

    const storyData = await storyResponse.json()
    const story = storyData.candidates?.[0]?.content?.parts?.[0]?.text || "No story generated."

    return NextResponse.json({ story })
  } catch (error) {
    console.error("[v0] Error in story generation:", error)
    return NextResponse.json({ error: "Failed to generate story. Please try again." }, { status: 500 })
  }
}
