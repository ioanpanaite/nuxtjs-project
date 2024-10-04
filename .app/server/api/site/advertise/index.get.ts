import { getServerSession } from '#auth'
import AdvertisementModel from '~/server/models/Advertisement.model'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const advertisement = await getAdvertise()
  return { advertisement }
})

const getAdvertise = async () => {
  try {
    const adver = await AdvertisementModel.find().sort('sort');
    return adver;
  } catch (error: any) {
    console.log(error)
    return null
  }
}