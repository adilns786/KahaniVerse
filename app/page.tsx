"use client"

import { useState } from "react"
import { StoryInput } from "@/components/story-input"
import { StoryOutput } from "@/components/story-output"
import { StoryOptions } from "@/components/story-options"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sparkles } from "lucide-react"

interface StoryOptionsData {
  genres: string[]
  tones: string[]
  lengths: string[]
  characters: string[]
  settings: string[]
}

interface SelectedParams {
  genre?: string
  tone?: string
  length?: string
  characters?: string
  setting?: string
}

export default function Home() {
  const [story, setStory] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState<string>("")
  const [options, setOptions] = useState<StoryOptionsData | null>(null)
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

  const handleGetOptions = async (prompt: string) => {
    setIsLoadingOptions(true)
    setOptions(null)
    setStory("")
    setCurrentPrompt(prompt)

    try {
      const response = await fetch("/api/story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt, 
          step: "get-options" 
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get story options")
      }

      const data = await response.json()
      setOptions(data.options)
    } catch (error) {
      console.error("[v0] Error getting options:", error)
      setStory("Sorry, there was an error getting story options. Please try again.")
    } finally {
      setIsLoadingOptions(false)
    }
  }

  const handleGenerateStory = async (selectedParams: SelectedParams) => {
    setIsGenerating(true)
    setStory("")

    try {
      const response = await fetch("/api/story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt: currentPrompt,
          step: "generate-story",
          selectedParams 
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate story")
      }

      const data = await response.json()
      setStory(data.story)
      setOptions(null) // Clear options after generating story
    } catch (error) {
      console.error("[v0] Error generating story:", error)
      setStory("Sorry, there was an error generating your story. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setOptions(null)
    setStory("")
    setCurrentPrompt("")
  }

  return (
    <div className="min-h-screen grid-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header ...*/}
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

        {/* Input Section - Only show if no options are displayed */}
        {!options && (
          <div className="mb-8">
            <StoryInput 
              onGenerate={handleGetOptions} 
              isGenerating={isLoadingOptions} 
            />
          </div>
        )}

        {/* Options Section */}
        {options && !story && !isGenerating && (
          <div className="mb-8">
            <StoryOptions 
              options={options}
              prompt={currentPrompt}
              onGenerate={handleGenerateStory}
              onBack={handleReset}
            />
          </div>
        )}

        {/* Output Section */}
        {(story || isGenerating) && (
          <StoryOutput 
            story={story} 
            isGenerating={isGenerating}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-muted-foreground">
        <p>Powered by Gemini AI • Built with Next.js</p>
      </footer>
    </div>
  )
}