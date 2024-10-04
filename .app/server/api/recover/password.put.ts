
import bcrypt from "bcrypt"
import { Status } from '~/lib/constant'
import CoreUsersModel from '~/server/models/CoreUsers.model'
import { getResetTokenInfo } from '~/utils/password'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const token = body.token
    const tokenInfo = getResetTokenInfo(token);

    const user = await CoreUsersModel.findOne({ _id: tokenInfo.userId })
    if (!user) {
      return { ok: false, message: "Invalid administrator." }
    } else if (user.status !== Status.ACTIVE) {
      return { ok: false, message: "Admin is not available." }
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    // Update password
    const res = await CoreUsersModel.updateOne(
      { _id: tokenInfo.userId },
      { password: hashedPassword }
    )

    return { ok: true, message: "Password changed." }
  } catch (error: any) {
    console.log(error)
    return { ok: false, message: "Something went wrong." }
  }
})
