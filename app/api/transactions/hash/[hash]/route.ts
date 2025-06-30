import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import jwt from "jsonwebtoken"

const MONGODB_URI =
  "mongodb+srv://bitcoin-wallet:7gkaI8MtBgKRIbDj@bitcoin-wallets.wzkycfi.mongodb.net/?retryWrites=true&w=majority&appName=bitcoin-wallets"
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function GET(request: NextRequest, { params }: { params: { hash: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    jwt.verify(token, JWT_SECRET)

    const { hash } = params

    const client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db("mycoin")
    const transactions = db.collection("transactions")

    // Find transaction by hash
    const transaction = await transactions.findOne({ hash })

    await client.close()

    if (!transaction) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      transaction,
    })
  } catch (error) {
    console.error("Transaction search error:", error)
    return NextResponse.json({ success: false, message: "Failed to search transaction" }, { status: 500 })
  }
}
