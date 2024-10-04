import { getServerSession } from '#auth';
import CoreUsersModel from '~/server/models/CoreUsers.model';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const email = session.user?.email as string
  const data = await getAdmin(email)

  return { profile: data }
})

const getAdmin = async (email: string) => {
  try {
    const admin = await CoreUsersModel.findOne({ email: email });
    if (admin && !admin.picture) {
      return { ...admin._doc, picture: `/img/avatars/no-avatar.png` }
    }
    return admin;
  } catch (error: any) {
    console.log(error)
    return null
  }
}
