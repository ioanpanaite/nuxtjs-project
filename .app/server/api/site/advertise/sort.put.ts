import { getServerSession } from '#auth';
import AdvertisementModel from '~/server/models/Advertisement.model';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const body = await readBody(event)

  try {
    const ads = await AdvertisementModel.findById(body.advertiseId)
    const adsLast = await AdvertisementModel.findOne().sort({ sort: -1 });

    let sort = ads?.sort || 1
    if (body.toward === 'up') {
      if (ads?.sort !== 1) {
        if (ads?.sort <= adsLast?.sort) {
          sort = ads?.sort - 1
        }
      } else {
        sort = 1
      }
    } else {
      if (ads?.sort !== 1) {
        if (ads?.sort < adsLast?.sort) {
          sort = ads?.sort + 1
        }
      } else {
        sort += 1
      }
    }

    if (sort) {
      const existing = await AdvertisementModel.findOne({ sort: sort })
      if (existing) {
        await AdvertisementModel.updateOne({ _id: existing?._id }, { sort: ads?.sort });
      }
    }

    await AdvertisementModel.updateOne({ _id: body.advertiseId }, { sort: sort });


    return { ok: true, message: "Advertisement updated successfully." }
  } catch (error: any) {
    console.log(error)
    return { ok: false, message: "Something went wrong." }
  }
})
