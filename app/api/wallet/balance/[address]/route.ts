import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import jwt from "jsonwebtoken"

const MONGODB_URI =
  "mongodb+srv://bitcoin-wallet:7gkaI8MtBgKRIbDj@bitcoin-wallets.wzkycfi.mongodb.net/?retryWrites=true&w=majority&appName=bitcoin-wallets"
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    jwt.verify(token, JWT_SECRET)

    const { address } = params

    const client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db("mycoin")
    const wallets = db.collection("wallets")
    const transactions = db.collection("transactions")

    // Get wallet
    const wallet = await wallets.findOne({ address })
    if (!wallet) {
      await client.close()
      return NextResponse.json({ success: false, message: "Wallet not found" }, { status: 404 })
    }

    // Get recent transactions
    const recentTransactions = await transactions
      .find({
        $or: [{ from: address }, { to: address }],
      })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray()

    // Add transaction type
    const transactionsWithType = recentTransactions.map((tx) => ({
      ...tx,
      type: tx.from === address ? "sent" : "received",
    }))

    await client.close()

    return NextResponse.json({
      success: true,
      data: {
        address: wallet.address,
        balance: wallet.balance,
        transactions: transactionsWithType,
      },
    })
  } catch (error) {
    console.error("Balance fetch error:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch balance" }, { status: 500 })
  }
}
