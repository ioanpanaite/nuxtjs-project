import { getServerSession } from '#auth';
import bcrypt from "bcrypt";
import { LoginType } from '~/lib/constant';
import UserModel from "~/server/models/User.model";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const body = await readBody(event)

  try {
    let loginType = body.loginType
    // Only password update when admin set password
    if ((body.newPassword !== '' || body.confirmPassword !== '') && body.newPassword === body.confirmPassword) {
      const hashedPassword = await bcrypt.hash(body.newPassword, 10);
      await UserModel.updateOne({ _id: body.userId }, { password: hashedPassword })
      loginType = LoginType.CREDENTIAL
    }

    // Update user info
    await UserModel.updateOne({ _id: body.userId },
      {
        fullname: body.fullname,
        username: body.username,
        email: body.email,
        emailVerified: body.emailVerified,
        status: body.status,
        loginType: loginType,
        twofactorEnabled: body.twofactorEnabled,
        country: body.country,
        crypto: body.crypto,
        promoCode: body.promoCode,
        telegram: body.telegram,
      })
    return { ok: true, message: "User info updated successfully." }
  } catch (error: any) {
    console.log(error)
    return { ok: false, message: "Something went wrong." }
  }
});