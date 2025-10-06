"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Sparkles } from "lucide-react"

interface StoryOptionsProps {
  options: {
    genres: string[]
    tones: string[]
    lengths: string[]
    characters: string[]
    settings: string[]
  }
  prompt: string
  onGenerate: (selectedParams: any) => void
  onBack: () => void
}

export function StoryOptions({ options, prompt, onGenerate, onBack }: StoryOptionsProps) {
  const [selectedParams, setSelectedParams] = useState({
    genre: "",
    tone: "",
    length: "",
    characters: "",
    setting: "",
  })

  const handleSelectOption = (category: string, value: string) => {
    setSelectedParams(prev => ({
      ...prev,
      [category]: value,
    }))
  }

  const handleGenerate = () => {
    // Filter out empty selections
    const params = Object.fromEntries(
      Object.entries(selectedParams).filter(([_, value]) => value !== "")
    )
    onGenerate(params)
  }

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">Customize Your Story</CardTitle>
            <CardDescription className="text-base">
              Your prompt: <span className="italic font-medium">"{prompt}"</span>
            </CardDescription>
            <CardDescription className="mt-2">
              Select options to customize your story, or skip any to let AI decide.
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Genre */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Genre</Label>
          <RadioGroup
            value={selectedParams.genre}
            onValueChange={(value: string) => handleSelectOption("genre", value)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.genres.map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <RadioGroupItem value={genre} id={`genre-${genre}`} />
                  <Label htmlFor={`genre-${genre}`} className="cursor-pointer font-normal">
                    {genre}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Tone */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Tone</Label>
          <RadioGroup
            value={selectedParams.tone}
            onValueChange={(value: string) => handleSelectOption("tone", value)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.tones.map((tone) => (
                <div key={tone} className="flex items-center space-x-2">
                  <RadioGroupItem value={tone} id={`tone-${tone}`} />
                  <Label htmlFor={`tone-${tone}`} className="cursor-pointer font-normal">
                    {tone}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Length */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Length</Label>
          <RadioGroup
            value={selectedParams.length}
            onValueChange={(value: string) => handleSelectOption("length", value)}
          >
            <div className="grid grid-cols-3 gap-3">
              {options.lengths.map((length) => (
                <div key={length} className="flex items-center space-x-2">
                  <RadioGroupItem value={length} id={`length-${length}`} />
                  <Label htmlFor={`length-${length}`} className="cursor-pointer font-normal capitalize">
                    {length}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Characters */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Character Type (Optional)</Label>
          <RadioGroup
            value={selectedParams.characters}
            onValueChange={(value: string) => handleSelectOption("characters", value)}
          >
            <div className="grid grid-cols-1 gap-3">
              {options.characters.map((character) => (
                <div key={character} className="flex items-center space-x-2">
                  <RadioGroupItem value={character} id={`char-${character}`} />
                  <Label htmlFor={`char-${character}`} className="cursor-pointer font-normal">
                    {character}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Setting */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Setting</Label>
          <RadioGroup
            value={selectedParams.setting}
            onValueChange={(value: string) => handleSelectOption("setting", value)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.settings.map((setting) => (
                <div key={setting} className="flex items-center space-x-2">
                  <RadioGroupItem value={setting} id={`setting-${setting}`} />
                  <Label htmlFor={`setting-${setting}`} className="cursor-pointer font-normal">
                    {setting}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Generate Button */}
        <div className="pt-4">
          <Button 
            onClick={handleGenerate} 
            className="w-full" 
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Story
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}