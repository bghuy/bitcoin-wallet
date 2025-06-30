"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Search, TrendingUp, TrendingDown, ExternalLink } from "lucide-react"

interface Transaction {
  _id: string
  hash: string
  from: string
  to: string
  amount: number
  timestamp: string
  status: string
  type: "sent" | "received"
  blockNumber?: number
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchHash, setSearchHash] = useState("")
  const [currentAddress, setCurrentAddress] = useState("")
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

    const wallet = JSON.parse(currentWallet)
    setCurrentAddress(wallet.address)
    fetchTransactions(wallet.address)
  }, [router])

  const fetchTransactions = async (address: string) => {
    try {
      const token = localStorage.getItem("token")

      const response = await axios.get(`/api/transactions/${address}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setTransactions(response.data.transactions)
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch transactions")
    } finally {
      setLoading(false)
    }
  }

  const searchTransaction = async () => {
    if (!searchHash.trim()) return

    try {
      const token = localStorage.getItem("token")

      const response = await axios.get(`/api/transactions/hash/${searchHash}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setTransactions([response.data.transaction])
      }
    } catch (error: any) {
      setError("Transaction not found")
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getTransactionType = (tx: Transaction): "sent" | "received" => {
    return tx.from === currentAddress ? "sent" : "received"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading transactions...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard" className="inline-flex items-center text-white/80 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">MC</span>
            </div>
            <span className="text-white font-bold text-xl">Transaction History</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl mb-6">
          <CardHeader>
            <CardTitle>Search Transaction</CardTitle>
            <CardDescription>Search for a specific transaction by hash</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter transaction hash"
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
                className="font-mono"
              />
              <Button onClick={searchTransaction} className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchHash("")
                  fetchTransactions(currentAddress)
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Transactions List */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>Complete transaction history for your wallet</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((tx) => {
                  const type = getTransactionType(tx)
                  return (
                    <div key={tx._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              type === "sent" ? "bg-red-100" : "bg-green-100"
                            }`}
                          >
                            {type === "sent" ? (
                              <TrendingDown className="w-6 h-6 text-red-600" />
                            ) : (
                              <TrendingUp className="w-6 h-6 text-green-600" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium">{type === "sent" ? "Sent to" : "Received from"}</div>
                            <div className="text-sm text-gray-600 font-mono">
                              {formatAddress(type === "sent" ? tx.to : tx.from)}
                            </div>
                            <div className="text-xs text-gray-500">{formatDate(tx.timestamp)}</div>
                            <div className="text-xs text-gray-500 font-mono">
                              Hash: {formatAddress(tx.hash)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-auto p-0 text-blue-600"
                                onClick={() => navigator.clipboard.writeText(tx.hash)}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                            {tx.blockNumber && <div className="text-xs text-gray-500">Block: #{tx.blockNumber}</div>}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className={`font-bold text-lg ${type === "sent" ? "text-red-600" : "text-green-600"}`}>
                            {type === "sent" ? "-" : "+"}
                            {tx.amount.toFixed(8)} MC
                          </div>
                          <Badge
                            variant={tx.status === "confirmed" ? "default" : "secondary"}
                            className={tx.status === "confirmed" ? "bg-green-100 text-green-800" : ""}
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📝</div>
                <div className="text-xl font-medium mb-2">No transactions found</div>
                <div className="text-sm">
                  {searchHash
                    ? "Try searching with a different transaction hash"
                    : "Start by sending or receiving MyCoin!"}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
