"use client"

import { Card } from "@/components/ui/card"
import { Loader2, BookOpen } from "lucide-react"

interface StoryOutputProps {
  story: string
  isGenerating: boolean
}

export function StoryOutput({ story, isGenerating }: StoryOutputProps) {
  return (
    <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
        <BookOpen className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Your Story</h2>
      </div>

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Crafting your story...</p>
        </div>
      ) : (
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="text-foreground leading-relaxed whitespace-pre-wrap">{story}</div>
        </div>
      )}
    </Card>
  )
}
