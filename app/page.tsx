"use client"

import { useState } from "react"
import { StoryInput } from "@/components/story-input"
import { StoryOutput } from "@/components/story-output"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sparkles } from "lucide-react"

export default function Home() {
  const [story, setStory] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateStory = async (prompt: string) => {
    setIsGenerating(true)
    setStory("")

    try {
      const response = await fetch("/api/story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate story")
      }

      const data = await response.json()
      setStory(data.story)
    } catch (error) {
      console.error("[v0] Error generating story:", error)
      setStory("Sorry, there was an error generating your story. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen grid-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-primary" />
            <h1 className="text-5xl font-bold text-balance">Story Weaver</h1>
          </div>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Transform your ideas into captivating narratives. Type or speak your prompt, and watch as AI crafts a unique
            story just for you.
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          <StoryInput onGenerate={handleGenerateStory} isGenerating={isGenerating} />
        </div>

        {/* Output Section */}
        {(story || isGenerating) && <StoryOutput story={story} isGenerating={isGenerating} />}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-muted-foreground">
        <p>Powered by Gemini AI • Built with Next.js</p>
      </footer>
    </div>
  )
}
