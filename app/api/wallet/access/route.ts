import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const MONGODB_URI =
  "mongodb+srv://bitcoin-wallet:7gkaI8MtBgKRIbDj@bitcoin-wallets.wzkycfi.mongodb.net/?retryWrites=true&w=majority&appName=bitcoin-wallets"
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

function getAddressFromPrivateKey(privateKey: string) {
  const publicKey = crypto.createHash("sha256").update(privateKey).digest("hex")
  const address = "MC" + crypto.createHash("ripemd160").update(publicKey).digest("hex").substring(0, 38)
  return address
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    const { privateKey } = await request.json()

    if (!privateKey) {
      return NextResponse.json({ success: false, message: "Private key is required" }, { status: 400 })
    }

    // Generate address from private key
    const address = getAddressFromPrivateKey(privateKey)

    const client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db("mycoin")
    const wallets = db.collection("wallets")

    // Check if wallet exists
    const wallet = await wallets.findOne({ address })
    if (!wallet) {
      await client.close()
      return NextResponse.json({ success: false, message: "Wallet not found" }, { status: 404 })
    }

    await client.close()

    return NextResponse.json({
      success: true,
      address,
      message: "Wallet accessed successfully",
    })
  } catch (error) {
    console.error("Wallet access error:", error)
    return NextResponse.json({ success: false, message: "Failed to access wallet" }, { status: 500 })
  }
}
