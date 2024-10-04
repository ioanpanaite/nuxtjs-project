import { Status } from '~/lib/constant'
import CoreUsersModel from '~/server/models/CoreUsers.model'
import { sendResetEmail } from '~/utils/email'
import { generateResetToken } from '~/utils/password'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const headers = getHeaders(event)

  try {
    const user = await CoreUsersModel.findOne({ email: body.email })
    if (!user) {
      return { ok: false, message: "Invalid administrator." }
    } else if (user.status !== Status.ACTIVE) {
      return { ok: false, message: "Admin is not available." }
    }

    const encryptToken = generateResetToken(user);
    const link = `${headers.origin}/auth/reset?token=${encryptToken}`;

    const operatingSystem = headers["sec-ch-ua-platform"]?.toString()
    const browserName = headers["user-agent"]

    // Send reset email
    await sendResetEmail({ to: body.email, action_url: link, support_url: '/support', operating_system: operatingSystem, browser_name: browserName })

    return { ok: true, message: "Sent forgot password email." }
  } catch (error: any) {
    console.log(error)
    return { ok: false, message: "Something went wrong." }
  }
})
