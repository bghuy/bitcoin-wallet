import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const MONGODB_URI =
  "mongodb+srv://bitcoin-wallet:7gkaI8MtBgKRIbDj@bitcoin-wallets.wzkycfi.mongodb.net/?retryWrites=true&w=majority&appName=bitcoin-wallets"
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

function generateKeyPair() {
  const privateKey = crypto.randomBytes(32).toString("hex")
  const publicKey = crypto.createHash("sha256").update(privateKey).digest("hex")
  const address = "MC" + crypto.createHash("ripemd160").update(publicKey).digest("hex").substring(0, 38)

  return { privateKey, publicKey, address }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    const { passphrase } = await request.json()

    // Generate wallet
    const { privateKey, publicKey, address } = generateKeyPair()

    const client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db("mycoin")
    const wallets = db.collection("wallets")
    const users = db.collection("users")

    // Create wallet record
    const walletData = {
      address,
      publicKey,
      userId: decoded.userId,
      balance: 100, // Initial balance for testing
      createdAt: new Date(),
      passphrase: passphrase || null,
    }

    await wallets.insertOne(walletData)

    // Update user's wallets array
    await users.updateOne({ _id: decoded.userId }, { $push: { wallets: address } })

    await client.close()

    return NextResponse.json({
      success: true,
      address,
      privateKey,
      message: "Wallet created successfully",
    })
  } catch (error) {
    console.error("Wallet creation error:", error)
    return NextResponse.json({ success: false, message: "Failed to create wallet" }, { status: 500 })
  }
}
