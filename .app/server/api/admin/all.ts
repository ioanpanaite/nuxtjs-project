import { getServerSession } from '#auth'
import CoreUsersModel from '~/server/models/CoreUsers.model'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const query = getQuery(event)
  const perPage = parseInt((query.perPage as string) || '5', 10)
  const page = parseInt((query.page as string) || '1', 10)
  const filter = (query.filter as string) || ''

  const data = await getAllUsers()
  if (data) {
    return {
      total: data.length,
      data: filterUserData(data, filter, page, perPage),
    }
  }

  return data;
})

function filterUserData(
  data: any[],
  filter: string,
  page: number,
  perPage: number,
) {
  const offset = (page - 1) * perPage
  if (!filter) {
    return data.slice(offset, offset + perPage)
  }
  const filterRe = new RegExp(filter, 'i')
  return data
    .filter((item) => {
      return [item.fullname, item.username, item.email].some(
        (itemEach) => filterRe.test(itemEach),
      )
    })
    .slice(offset, offset + perPage)
}

const getAllUsers = async () => {
  try {
    const users = await CoreUsersModel.find();
    if (users) {
      const updatedUsers = users.map((v: any) => {
        if (!v.image) return { ...v._doc, image: `/img/avatars/no-avatar.png` }
        return v
      })
      return updatedUsers;
    }
    return users;
  } catch (error: any) {
    console.log(error)
    return null
  }
}