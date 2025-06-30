"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Send } from "lucide-react"

export default function SendPage() {
  const [toAddress, setToAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [balance, setBalance] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const currentWallet = localStorage.getItem("currentWallet")

    if (!token) {
      router.push("/login")
      return
    }

    if (!currentWallet) {
      router.push("/access-wallet")
      return
    }

    fetchBalance()
  }, [router])

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("token")
      const currentWallet = JSON.parse(localStorage.getItem("currentWallet") || "{}")

      const response = await axios.get(`/api/wallet/balance/${currentWallet.address}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setBalance(response.data.data.balance)
      }
    } catch (error: any) {
      setError("Failed to fetch balance")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const currentWallet = JSON.parse(localStorage.getItem("currentWallet") || "{}")

      const response = await axios.post(
        "/api/transactions/send",
        {
          fromAddress: currentWallet.address,
          toAddress,
          amount: Number.parseFloat(amount),
          privateKey: currentWallet.privateKey,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        setSuccess(`Transaction sent successfully! Hash: ${response.data.transactionHash}`)
        setToAddress("")
        setAmount("")
        fetchBalance()
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to send transaction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-white/80 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <span>Send MyCoin</span>
            </CardTitle>
            <CardDescription>Send MyCoin to another wallet address</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Alert>
                <AlertDescription>
                  <strong>Available Balance:</strong> {balance.toFixed(8)} MC
                </AlertDescription>
              </Alert>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="toAddress">Recipient Address</Label>
                <Input
                  id="toAddress"
                  placeholder="Enter recipient wallet address"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  required
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (MC)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.00000001"
                  min="0.00000001"
                  max={balance}
                  placeholder="Enter amount to send"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount((balance * 0.25).toFixed(8))}
                  >
                    25%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount((balance * 0.5).toFixed(8))}
                  >
                    50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount((balance * 0.75).toFixed(8))}
                  >
                    75%
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setAmount(balance.toFixed(8))}>
                    Max
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Transaction Fee:</strong> 0.001 MC will be deducted as mining fee
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading || !toAddress || !amount || Number.parseFloat(amount) > balance}
              >
                {loading ? "Sending Transaction..." : "Send MyCoin"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
