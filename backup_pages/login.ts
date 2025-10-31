import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: "Token required" })
    }

    // Set token in httpOnly cookie
    res.setHeader(
      "Set-Cookie",
      `auth_token=${token}; Path=/; HttpOnly; Secure=${process.env.NODE_ENV === "production"}; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
    )

    return res.status(200).json({ success: true })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
