import { getServerSession } from '#auth';
import UserModel from "~/server/models/User.model";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const query = getQuery(event)
  const userId = query.id as string;
  const data = await getUser(userId)

  return data
})

const getUser = async (userId: string) => {
  try {
    const user = await UserModel.findOne({ _id: userId });
    if (user && !user.image) {
      return { ...user._doc, image: `/img/avatars/no-avatar.png` }
    }
    return user;
  } catch (error: any) {
    console.log(error)
    return null
  }
}