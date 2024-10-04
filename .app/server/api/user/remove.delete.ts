import { getServerSession } from '#auth';
import UserModel from "~/server/models/User.model";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const body = await readBody(event)

  try {
    await UserModel.deleteOne({ _id: body.userId })
    return { ok: true, message: "Deleted user successfully." }
  } catch (error: any) {
    console.log(error);
    return { ok: false, message: "Something went wrong." }
  }
});