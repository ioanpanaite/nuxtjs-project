import { getServerSession } from '#auth';
import CoreUsersModel from '~/server/models/CoreUsers.model';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const body = await readBody(event)

  try {
    await CoreUsersModel.deleteOne({ _id: body.id })
    return { ok: true, message: "Deleted administrator successfully." }
  } catch (error: any) {
    console.log(error);
    return { ok: false, message: "Something went wrong." }
  }
});