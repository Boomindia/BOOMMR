"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, HelpCircle, Camera, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"

const preferences = [
  { id: "education", label: "Education", icon: "📚" },
  { id: "entertainment", label: "Entertainment", icon: "🎬" },
  { id: "technology", label: "Technology", icon: "💻" },
  { id: "business", label: "Business", icon: "💼" },
  { id: "lifestyle", label: "Lifestyle", icon: "🌟" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "cooking", label: "Cooking", icon: "👨‍🍳" },
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "fitness", label: "Fitness", icon: "💪" },
]

const languages = [
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ta", name: "Tamil", flag: "🇮🇳" },
  { code: "te", name: "Telugu", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", flag: "🇮🇳" },
]

export default function AuthPage() {
  const [step, setStep] = useState<"welcome" | "signup" | "register">("welcome")
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Registration form data
  const [registrationData, setRegistrationData] = useState({
    name: "",
    username: "",
    gender: "",
    profilePhoto: null as File | null,
    selectedPreferences: [] as string[],
    selectedLanguages: [] as string[],
    location: "",
  })

  const { handleSocialLogin } = useAuthStore()
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return

    if (status === "authenticated") {
      if (session.needsRegistration) {
        setStep("register")
        setRegistrationData((prev) => ({
          ...prev,
          name: session.registrationData?.name || "",
        }))
      } else {
        router.push("/")
      }
    }
  }, [session, status, router])

  const handlePreferenceToggle = (preferenceId: string) => {
    setRegistrationData((prev) => ({
      ...prev,
      selectedPreferences: prev.selectedPreferences.includes(preferenceId)
        ? prev.selectedPreferences.filter((id) => id !== preferenceId)
        : [...prev.selectedPreferences, preferenceId],
    }))
  }

  const handleLanguageToggle = (languageCode: string) => {
    setRegistrationData((prev) => ({
      ...prev,
      selectedLanguages: prev.selectedLanguages.includes(languageCode)
        ? prev.selectedLanguages.filter((code) => code !== languageCode)
        : [...prev.selectedLanguages, languageCode],
    }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setRegistrationData((prev) => ({ ...prev, profilePhoto: file }))
    }
  }

  const handleRegistrationComplete = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...registrationData,
          email: session?.user?.email,
          provider: session?.registrationData?.provider,
          providerAccountId: session?.registrationData?.providerAccountId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to register user")
      }

      router.push("/")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to register")
    } finally {
      setLoading(false)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return (
          registrationData.name.trim() !== "" &&
          registrationData.username.trim() !== "" &&
          registrationData.gender !== ""
        )
      case 2:
        return registrationData.selectedPreferences.length > 0
      case 3:
        return registrationData.selectedLanguages.length > 0
      default:
        return true
    }
  }

  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-red-500 flex flex-col items-center justify-center px-6">
        <div className="w-40 h-40 mb-16 bg-white rounded-3xl flex items-center justify-center">
          <span className="text-4xl font-bold text-red-500">STRMLY</span>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <Button
            onClick={() => setStep("signup")}
            className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-4 text-lg font-medium"
          >
            Get Started
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm">
            by continuing you agree to our <span className="underline">terms & privacy</span> ↗
          </p>
        </div>
      </div>
    )
  }

  if (step === "signup") {
    return (
      <div className="min-h-screen bg-red-500 flex flex-col px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep("welcome")}
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft size={24} />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-2">
            <HelpCircle size={24} />
          </Button>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="space-y-4">
            {error && (
              <div className="bg-white/10 text-white p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4 mt-52">
              <Button
                onClick={() => signIn("google", { callbackUrl: "/auth" })}
                disabled={loading}
                className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-8 text-2xl font-medium flex items-center justify-center"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                    Loading...
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>

              <Button
                onClick={() => signIn("apple", { callbackUrl: "/auth" })}
                disabled={loading}
                className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-8 text-2xl font-medium flex items-center justify-center"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                    Loading...
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M17.05 20.28c-.98.95-2.05.88-3.08.41-1.09-.47-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.41C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.07 2.7.61 3.44 1.57-3.14 1.88-2.29 5.13.89 6.41-.65 1.29-1.51 2.58-2.92 4.05zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                      />
                    </svg>
                    Continue with Apple
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/70 text-sm">
              by continuing you agree to our <span className="underline">terms & privacy</span> ↗
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (step === "register") {
    return (
      <div className="min-h-screen bg-background">
        {/* Progress Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              {currentStep > 1 && (
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(currentStep - 1)}>
                  <ArrowLeft size={20} />
                </Button>
              )}
              <h1 className="text-xl font-bold">Complete Your Profile</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{currentStep}/4</span>
              <div className="w-16 h-2 bg-muted rounded-full">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage
                        src={
                          registrationData.profilePhoto
                            ? URL.createObjectURL(registrationData.profilePhoto)
                            : session?.user?.image || "/placeholder.svg"
                        }
                      />
                      <AvatarFallback>
                        <Camera size={32} className="text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      onClick={() => document.getElementById("photo-upload")?.click()}
                    >
                      <Camera size={14} />
                    </Button>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">Add a profile photo (optional)</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={registrationData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRegistrationData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={registrationData.username}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRegistrationData((prev) => ({ ...prev, username: e.target.value }))
                      }
                      placeholder="johndoe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      type="text"
                      value={registrationData.gender}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRegistrationData((prev) => ({ ...prev, gender: e.target.value }))
                      }
                      placeholder="Male/Female/Other"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-muted-foreground" />
                      <span className="text-sm">{registrationData.location || "Detecting location..."}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Preferences */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>What interests you?</CardTitle>
                <p className="text-sm text-muted-foreground">Select topics you'd like to see content about</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {preferences.map((preference) => (
                    <Button
                      key={preference.id}
                      variant={registrationData.selectedPreferences.includes(preference.id) ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={() => handlePreferenceToggle(preference.id)}
                    >
                      <span className="text-2xl">{preference.icon}</span>
                      <span className="text-sm">{preference.label}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Selected: {registrationData.selectedPreferences.length} preferences
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Languages */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Video Languages</CardTitle>
                <p className="text-sm text-muted-foreground">Choose languages for videos you'd like to watch</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {languages.map((language) => (
                    <div
                      key={language.code}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        registrationData.selectedLanguages.includes(language.code)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-accent"
                      }`}
                      onClick={() => handleLanguageToggle(language.code)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{language.flag}</span>
                        <span className="font-medium">{language.name}</span>
                      </div>
                      {registrationData.selectedLanguages.includes(language.code) && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Selected: {registrationData.selectedLanguages.length} languages
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Profile</CardTitle>
                <p className="text-sm text-muted-foreground">Make sure everything looks good before continuing</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={
                        registrationData.profilePhoto
                          ? URL.createObjectURL(registrationData.profilePhoto)
                          : session?.user?.image || "/placeholder.svg"
                      }
                    />
                    <AvatarFallback>{registrationData.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{registrationData.name}</h3>
                    <p className="text-sm text-muted-foreground">@{registrationData.username}</p>
                    <p className="text-sm text-muted-foreground capitalize">{registrationData.gender}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {registrationData.selectedPreferences.map((prefId) => {
                      const pref = preferences.find((p) => p.id === prefId)
                      return (
                        <Badge key={prefId} variant="secondary">
                          {pref?.icon} {pref?.label}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {registrationData.selectedLanguages.map((langCode) => {
                      const lang = languages.find((l) => l.code === langCode)
                      return (
                        <Badge key={langCode} variant="secondary">
                          {lang?.flag} {lang?.name}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  <span>{registrationData.location}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation buttons */}
          <div className="mt-6 flex justify-between">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="w-24"
              >
                Back
              </Button>
            )}
            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToNext()}
                className="w-24 ml-auto"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleRegistrationComplete}
                disabled={!canProceedToNext() || loading}
                className="w-24 ml-auto"
              >
                {loading ? "Creating..." : "Create"}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
