"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Shield, Smartphone, Globe } from "lucide-react"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    router.push("/")
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
            <span className="text-white font-bold text-xl">MyCoin</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="#" className="text-white/80 hover:text-white">
              Buy Crypto
            </Link>
            <Link href="#" className="text-white/80 hover:text-white">
              Swap Tokens
            </Link>
            <Link href="#" className="text-white/80 hover:text-white">
              More features
            </Link>
            <Link href="#" className="text-white/80 hover:text-white">
              Resources
            </Link>
            <Link href="#" className="text-white/80 hover:text-white">
              Products
            </Link>
          </nav>
          <div className="flex space-x-2">
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  className="text-white border-white/30 hover:bg-white/10 bg-transparent"
                  asChild
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  className="text-white border-white/30 hover:bg-white/10 bg-transparent"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="text-white border-white/30 hover:bg-white/10 bg-transparent"
                  asChild
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  variant="outline"
                  className="text-white border-white/30 hover:bg-white/10 bg-transparent"
                  asChild
                >
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Access my wallet</h1>
          <p className="text-xl text-white/80 mb-2">Please select a method to access your wallet.</p>
          <p className="text-white/60">
            {"Don't have a wallet? "}
            <Link href="/create-wallet" className="text-teal-400 hover:text-teal-300 underline">
              Create Wallet
            </Link>
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {/* Private Key Access */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold">Private Key</CardTitle>
                <CardDescription>Access wallet with your private key</CardDescription>
              </div>
              <div className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-medium">Official</div>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/access-wallet">Access Wallet</Link>
              </Button>
            </CardContent>
          </Card>

          {/* MyCoin Wallet App */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold">MyCoin wallet app</CardTitle>
                <CardDescription>Connect MyCoin Wallet app to MyCoin web</CardDescription>
              </div>
              <div className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-medium">Official</div>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Browser Extension */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold">Browser extension</CardTitle>
                <CardDescription>Use your Web3 wallet with MyCoin</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Mobile Apps */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold">Mobile Apps</CardTitle>
                <CardDescription>WalletConnect, WalletLink</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
