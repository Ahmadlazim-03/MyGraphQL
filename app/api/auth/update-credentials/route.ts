import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import bcrypt from "bcryptjs"
import fs from "fs"
import path from "path"

const CREDENTIALS_FILE = path.join(process.cwd(), "user-credentials.json")

// Load current credentials
function loadCredentials() {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = fs.readFileSync(CREDENTIALS_FILE, "utf-8")
      return JSON.parse(data)
    }
  } catch (e) {
    // ignore
  }
  return {
    email: "ahmadlazim422@gmail.com",
    passwordHash: null,
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await verifyToken(token)

    const { currentPassword, newEmail, newPassword } = await request.json()

    if (!currentPassword) {
      return NextResponse.json({ error: "Current password required" }, { status: 400 })
    }

    const credentials = loadCredentials()

    // Verify current password
    let valid = false
    if (credentials.passwordHash) {
      valid = await bcrypt.compare(currentPassword, credentials.passwordHash)
    } else {
      // First time, check against default
      valid = currentPassword === "pembelajaranjarakjauh123"
    }

    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    // Update credentials
    const updatedCredentials: any = { ...credentials }

    if (newEmail && newEmail !== credentials.email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newEmail)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
      }
      updatedCredentials.email = newEmail
    }

    if (newPassword) {
      // Validate password strength
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
      }
      updatedCredentials.passwordHash = await bcrypt.hash(newPassword, 10)
    }

    // Save updated credentials
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(updatedCredentials, null, 2))

    return NextResponse.json({
      success: true,
      message: "Credentials updated successfully",
      email: updatedCredentials.email,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET endpoint to retrieve current email
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await verifyToken(token)

    const credentials = loadCredentials()
    return NextResponse.json({ email: credentials.email })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
