import { getServerSession } from '#auth';
import bcrypt from "bcrypt";
import UserModel from "~/server/models/User.model";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const body = await readBody(event)

  try {
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const data = { ...body, password: hashedPassword }
    await UserModel.create({ ...data })
    return { ok: true, message: "Created user successfully." }
  } catch (error: any) {
    console.log(error);
    return { ok: false, message: "Something went wrong." }
  }
});