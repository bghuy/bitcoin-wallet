"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Copy, Eye, EyeOff, RefreshCw } from "lucide-react"

export default function CreateWalletPage() {
  const [step, setStep] = useState(1)
  const [passphrase, setPassphrase] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const router = useRouter()

  const generateWallet = async () => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await axios.post(
        "/api/wallet/create",
        {
          passphrase: passphrase || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        setPrivateKey(response.data.privateKey)
        setAddress(response.data.address)
        setStep(2)
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create wallet")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const generateRandomPassphrase = () => {
    const words = [
      "abandon",
      "ability",
      "able",
      "about",
      "above",
      "absent",
      "absorb",
      "abstract",
      "absurd",
      "abuse",
      "access",
      "accident",
      "account",
      "accuse",
      "achieve",
      "acid",
      "acoustic",
      "acquire",
      "across",
      "act",
      "action",
      "actor",
      "actress",
      "actual",
    ]
    const randomWords = []
    for (let i = 0; i < 12; i++) {
      randomWords.push(words[Math.floor(Math.random() * words.length)])
    }
    setPassphrase(randomWords.join(" "))
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-white/80 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Create New Wallet</CardTitle>
              <CardDescription>Generate a new MyCoin wallet with a secure private key</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passphrase">Passphrase (Optional)</Label>
                  <Textarea
                    id="passphrase"
                    placeholder="Enter a custom passphrase or leave empty for random generation"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <Button type="button" variant="outline" size="sm" onClick={generateRandomPassphrase}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate Random
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Important:</strong> Your private key and passphrase are the only way to access your wallet.
                    Store them securely and never share them with anyone.
                  </AlertDescription>
                </Alert>

                <Button onClick={generateWallet} className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? "Creating Wallet..." : "Create Wallet"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">Wallet Created Successfully!</CardTitle>
            <CardDescription>Your new MyCoin wallet has been generated. Save these details securely.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                <strong>Warning:</strong> This is the only time you will see your private key. Save it in a secure
                location immediately.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <div className="flex space-x-2">
                  <Input value={address} readOnly className="font-mono text-sm" />
                  <Button type="button" variant="outline" size="sm" onClick={() => copyToClipboard(address)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Private Key</Label>
                <div className="flex space-x-2">
                  <Input
                    type={showPrivateKey ? "text" : "password"}
                    value={privateKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowPrivateKey(!showPrivateKey)}>
                    {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => copyToClipboard(privateKey)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {passphrase && (
                <div className="space-y-2">
                  <Label>Passphrase</Label>
                  <div className="flex space-x-2">
                    <Textarea value={passphrase} readOnly className="font-mono text-sm" rows={2} />
                    <Button type="button" variant="outline" size="sm" onClick={() => copyToClipboard(passphrase)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <Button onClick={() => router.push("/dashboard")} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Go to Dashboard
              </Button>
              <Button onClick={() => router.push("/access-wallet")} variant="outline" className="flex-1">
                Access Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
