import { getServerSession } from '#auth';
import bcrypt from "bcrypt";
import CoreUsersModel from '~/server/models/CoreUsers.model';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const body = await readBody(event)

  try {
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const data = { ...body, password: hashedPassword }
    console.log(data)
    await CoreUsersModel.create({ ...data })
    return { ok: true, message: "Created user successfully." }
  } catch (error: any) {
    console.log(error);
    return { ok: false, message: "Something went wrong." }
  }
});