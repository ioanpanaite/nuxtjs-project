import { getServerSession } from '#auth';
import CoreUsersModel from '~/server/models/CoreUsers.model';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const query = getQuery(event)
  const id = query.id as string;
  const data = await getAdmin(id)

  return data
})

const getAdmin = async (id: string) => {
  try {
    const admin = await CoreUsersModel.findOne({ _id: id });
    return { ...admin._doc, image: `/img/avatars/no-avatar.png` };
  } catch (error: any) {
    console.log(error)
  }
}