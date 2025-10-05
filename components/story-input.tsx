"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StoryInputProps {
  onGenerate: (prompt: string) => void
  isGenerating: boolean
}

export function StoryInput({ onGenerate, isGenerating }: StoryInputProps) {
  const [prompt, setPrompt] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<any>(null)
  const hasInitErrorRef = useRef(false)
  const { toast } = useToast()

  const initializeSpeechRecognition = () => {
    // If already initialized or had an error, return existing instance
    if (recognitionRef.current || hasInitErrorRef.current) {
      return recognitionRef.current
    }

    // Check if speech recognition is supported
    if (typeof window === "undefined" || (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window))) {
      hasInitErrorRef.current = true
      return null
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = "en-US"

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " "
          }
        }

        if (finalTranscript) {
          setPrompt((prev) => prev + finalTranscript)
        }
      }

      recognitionInstance.onerror = (event: any) => {
        if (event.error === "network") {
          setIsRecording(false)
          hasInitErrorRef.current = true
          toast({
            title: "Speech Recognition Unavailable",
            description: "The speech service is not available in this environment. Please type your prompt instead.",
            variant: "destructive",
          })
          return
        }

        setIsRecording(false)

        // Handle other errors with appropriate messages
        switch (event.error) {
          case "not-allowed":
          case "permission-denied":
            toast({
              title: "Permission Denied",
              description: "Microphone access was denied. Please allow microphone permissions and try again.",
              variant: "destructive",
            })
            break
          case "no-speech":
            // Don't show error for no speech, just stop
            return
          case "audio-capture":
            toast({
              title: "Microphone Error",
              description: "No microphone was found. Please connect a microphone and try again.",
              variant: "destructive",
            })
            break
          case "aborted":
            // User stopped recording, no error needed
            return
        }
      }

      recognitionInstance.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognitionInstance
      return recognitionInstance
    } catch (error) {
      hasInitErrorRef.current = true
      return null
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
      } catch (error) {
        // Silently handle stop errors
      }
      setIsRecording(false)
      return
    }

    const recognition = initializeSpeechRecognition()

    if (!recognition) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not available. Please type your prompt instead.",
        variant: "destructive",
      })
      return
    }

    // Check microphone permission
    try {
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({ name: "microphone" as PermissionName })
        if (permissionStatus.state === "denied") {
          toast({
            title: "Permission Denied",
            description: "Microphone access is blocked. Please enable it in your browser settings.",
            variant: "destructive",
          })
          return
        }
      }
    } catch (error) {
      // Permission API might not be available, continue anyway
    }

    // Start recording
    try {
      recognition.start()
      setIsRecording(true)
      toast({
        title: "Recording Started",
        description: "Speak your story prompt clearly...",
      })
    } catch (error: any) {
      setIsRecording(false)
      toast({
        title: "Recording Failed",
        description: "Could not start recording. Please type your prompt instead.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter or speak a story prompt.",
        variant: "destructive",
      })
      return
    }

    onGenerate(prompt.trim())
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="space-y-4">
        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your story prompt... (e.g., 'A detective in a futuristic city discovers a hidden secret')"
            className="min-h-[150px] resize-none text-base bg-background/50 pr-14"
            disabled={isGenerating}
          />
          <Button
            size="icon"
            variant={isRecording ? "destructive" : "secondary"}
            className="absolute bottom-3 right-3"
            onClick={toggleRecording}
            disabled={isGenerating}
            type="button"
          >
            {isRecording ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isRecording ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                Recording...
              </span>
            ) : (
              "Type your prompt or click the microphone to speak"
            )}
          </p>
          <Button onClick={handleSubmit} disabled={isGenerating || !prompt.trim()} className="gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Story
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
