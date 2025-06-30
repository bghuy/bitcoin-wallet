import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const MONGODB_URI =
  "mongodb+srv://bitcoin-wallet:7gkaI8MtBgKRIbDj@bitcoin-wallets.wzkycfi.mongodb.net/?retryWrites=true&w=majority&appName=bitcoin-wallets"
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

function generateTransactionHash(from: string, to: string, amount: number, timestamp: string) {
  return crypto.createHash("sha256").update(`${from}${to}${amount}${timestamp}`).digest("hex")
}

function mineBlock(previousHash: string, transactions: any[], difficulty = 4) {
  let nonce = 0
  const target = "0".repeat(difficulty)

  while (true) {
    const blockData = `${previousHash}${JSON.stringify(transactions)}${nonce}`
    const hash = crypto.createHash("sha256").update(blockData).digest("hex")

    if (hash.substring(0, difficulty) === target) {
      return { hash, nonce }
    }
    nonce++
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    jwt.verify(token, JWT_SECRET)

    const { fromAddress, toAddress, amount, privateKey } = await request.json()

    if (!fromAddress || !toAddress || !amount || !privateKey) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db("mycoin")
    const wallets = db.collection("wallets")
    const transactions = db.collection("transactions")
    const blocks = db.collection("blocks")

    // Verify sender wallet
    const senderWallet = await wallets.findOne({ address: fromAddress })
    if (!senderWallet) {
      await client.close()
      return NextResponse.json({ success: false, message: "Sender wallet not found" }, { status: 404 })
    }

    // Check balance
    const fee = 0.001
    const totalAmount = amount + fee
    if (senderWallet.balance < totalAmount) {
      await client.close()
      return NextResponse.json({ success: false, message: "Insufficient balance" }, { status: 400 })
    }

    // Verify recipient wallet exists
    const recipientWallet = await wallets.findOne({ address: toAddress })
    if (!recipientWallet) {
      await client.close()
      return NextResponse.json({ success: false, message: "Recipient wallet not found" }, { status: 404 })
    }

    const timestamp = new Date().toISOString()
    const transactionHash = generateTransactionHash(fromAddress, toAddress, amount, timestamp)

    // Create transaction
    const transaction = {
      hash: transactionHash,
      from: fromAddress,
      to: toAddress,
      amount: amount,
      fee: fee,
      timestamp: new Date(),
      status: "pending",
      blockNumber: null,
    }

    await transactions.insertOne(transaction)

    // Get latest block for mining
    const latestBlock = await blocks.findOne({}, { sort: { blockNumber: -1 } })
    const previousHash = latestBlock
      ? latestBlock.hash
      : "0000000000000000000000000000000000000000000000000000000000000000"
    const blockNumber = latestBlock ? latestBlock.blockNumber + 1 : 1

    // Mine block (Proof of Work)
    const { hash: blockHash, nonce } = mineBlock(previousHash, [transaction])

    // Create block
    const block = {
      blockNumber,
      hash: blockHash,
      previousHash,
      transactions: [transactionHash],
      timestamp: new Date(),
      nonce,
      difficulty: 4,
    }

    await blocks.insertOne(block)

    // Update transaction status
    await transactions.updateOne(
      { hash: transactionHash },
      {
        $set: {
          status: "confirmed",
          blockNumber: blockNumber,
        },
      },
    )

    // Update balances
    await wallets.updateOne({ address: fromAddress }, { $inc: { balance: -totalAmount } })

    await wallets.updateOne({ address: toAddress }, { $inc: { balance: amount } })

    await client.close()

    return NextResponse.json({
      success: true,
      transactionHash,
      blockHash,
      blockNumber,
      message: "Transaction sent and confirmed",
    })
  } catch (error) {
    console.error("Transaction send error:", error)
    return NextResponse.json({ success: false, message: "Failed to send transaction" }, { status: 500 })
  }
}
