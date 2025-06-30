"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"

export default function AccessWalletPage() {
  const [privateKey, setPrivateKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await axios.post(
        "/api/wallet/access",
        {
          privateKey,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        localStorage.setItem(
          "currentWallet",
          JSON.stringify({
            address: response.data.address,
            privateKey: privateKey,
          }),
        )
        router.push("/dashboard")
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to access wallet")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Access Wallet</CardTitle>
            <CardDescription>Enter your private key to access your MyCoin wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertDescription>
                  <strong>Security Notice:</strong> Never share your private key with anyone. MyCoin will never ask for
                  your private key.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="privateKey">Private Key</Label>
                <Input
                  id="privateKey"
                  type="password"
                  placeholder="Enter your private key"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  required
                  className="font-mono"
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Accessing Wallet..." : "Access Wallet"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {"Don't have a wallet? "}
              <Link href="/create-wallet" className="text-blue-600 hover:text-blue-700 font-medium">
                Create new wallet
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
