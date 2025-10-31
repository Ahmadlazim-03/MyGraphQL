import { type NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/auth"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import fs from "fs"
import path from "path"

// Path to store user credentials
const CREDENTIALS_FILE = path.join(process.cwd(), "user-credentials.json")

// Default hardcoded credentials
const DEFAULT_EMAIL = "ahmadlazim422@gmail.com"
const DEFAULT_PASSWORD = "pembelajaranjarakjauh123"

// Load or initialize credentials
function loadCredentials() {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = fs.readFileSync(CREDENTIALS_FILE, "utf-8")
      return JSON.parse(data)
    }
  } catch (e) {
    // ignore
  }
  
  // Return default credentials
  return {
    email: DEFAULT_EMAIL,
    passwordHash: null, // Will be hashed on first use
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 })
    }

    const credentials = loadCredentials()

    // Check email
    if (email !== credentials.email) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check password
    let valid = false
    if (credentials.passwordHash) {
      // Verify hashed password
      valid = await bcrypt.compare(password, credentials.passwordHash)
    } else {
      // First time login with default password
      if (password === DEFAULT_PASSWORD) {
        valid = true
        // Hash and save the password for future logins
        const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
        fs.writeFileSync(
          CREDENTIALS_FILE,
          JSON.stringify({ email: credentials.email, passwordHash: hash }, null, 2)
        )
      }
    }

    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = generateToken({ userId: 1, email: credentials.email, role: "admin" })

    // Try to log activity to MongoDB (best-effort)
    try {
      await connectDB()
      const { ActivityLog } = await import("@/models/activityLog")
      await ActivityLog.create({ userId: 1, type: "user_login", meta: { email: credentials.email } })
    } catch (e) {
      // ignore
    }

    const res = NextResponse.json({
      token,
      user: { id: 1, username: "Admin", email: credentials.email, role: "admin", isActive: true },
    })

    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return res
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
