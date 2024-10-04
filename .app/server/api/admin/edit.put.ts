import { getServerSession } from '#auth';
import bcrypt from "bcrypt";
import { LoginType } from '~/lib/constant';
import CoreUsersModel from '~/server/models/CoreUsers.model';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const body = await readBody(event)

  try {
    let loginType = body.loginType
    // Only password update when admin set password
    if (body.password !== '') {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      await CoreUsersModel.updateOne({ _id: body.id }, { password: hashedPassword, loginType: LoginType.CREDENTIAL })
      loginType = LoginType.CREDENTIAL
    }

    // Update user info
    await CoreUsersModel.updateOne({ _id: body.id },
      {
        fullname: body.fullname,
        username: body.username,
        email: body.email,
        status: body.status,
        loginType: loginType,
        twofactorEnabled: body.twofactorEnabled,
      })
    return { ok: true, message: "Admin info updated successfully." }
  } catch (error: any) {
    console.log(error)
    return { ok: false, message: "Something went wrong." }
  }
});