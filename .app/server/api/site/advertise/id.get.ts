import { getServerSession } from '#auth'
import AdvertisementModel from '~/server/models/Advertisement.model'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const query = getQuery(event);
  const advertiseId = query.advertiseId as string;

  const advertisement = await getAdvertise(advertiseId)
  return { advertisement }
})

const getAdvertise = async (advertiseId: string) => {
  try {
    const advertisement = await AdvertisementModel.findById(advertiseId);
    return advertisement;
  } catch (error: any) {
    console.log(error)
    return null
  }
}