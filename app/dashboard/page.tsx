"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Wallet, Send, History, Copy, RefreshCw, TrendingUp, TrendingDown } from "lucide-react"

interface WalletData {
  address: string
  balance: number
  transactions: Transaction[]
}

interface Transaction {
  _id: string
  hash: string
  from: string
  to: string
  amount: number
  timestamp: string
  status: string
  type: "sent" | "received"
}

export default function DashboardPage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
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

    fetchWalletData()
  }, [router])

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem("token")
      const currentWallet = JSON.parse(localStorage.getItem("currentWallet") || "{}")

      const response = await axios.get(`/api/wallet/balance/${currentWallet.address}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setWalletData(response.data.data)
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch wallet data")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading wallet data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">MC</span>
            </div>
            <span className="text-white font-bold text-xl">MyCoin Dashboard</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 bg-transparent" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button
              variant="outline"
              className="text-white border-white/30 hover:bg-white/10 bg-transparent"
              onClick={() => {
                localStorage.removeItem("token")
                localStorage.removeItem("currentWallet")
                router.push("/")
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="w-5 h-5" />
                <span>Wallet Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {walletData && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Wallet Address</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{walletData.address}</code>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(walletData.address)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Balance</Label>
                    <div className="text-3xl font-bold text-blue-600 mt-1">{walletData.balance.toFixed(8)} MC</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/send">
                  <Send className="w-4 h-4 mr-2" />
                  Send MyCoin
                </Link>
              </Button>
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/transactions">
                  <History className="w-4 h-4 mr-2" />
                  View All Transactions
                </Link>
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={fetchWalletData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Balance
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest MyCoin transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {walletData?.transactions && walletData.transactions.length > 0 ? (
              <div className="space-y-4">
                {walletData.transactions.slice(0, 5).map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === "sent" ? "bg-red-100" : "bg-green-100"
                        }`}
                      >
                        {tx.type === "sent" ? (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        ) : (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {tx.type === "sent" ? "Sent to" : "Received from"}{" "}
                          {formatAddress(tx.type === "sent" ? tx.to : tx.from)}
                        </div>
                        <div className="text-sm text-gray-500">{formatDate(tx.timestamp)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${tx.type === "sent" ? "text-red-600" : "text-green-600"}`}>
                        {tx.type === "sent" ? "-" : "+"}
                        {tx.amount.toFixed(8)} MC
                      </div>
                      <Badge variant={tx.status === "confirmed" ? "default" : "secondary"}>{tx.status}</Badge>
                    </div>
                  </div>
                ))}
                <div className="text-center">
                  <Button variant="outline" asChild>
                    <Link href="/transactions">View All Transactions</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No transactions found. Start by sending or receiving MyCoin!
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
