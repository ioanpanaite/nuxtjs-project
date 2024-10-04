import { getServerSession } from '#auth'
import AdvertisementModel from '~/server/models/Advertisement.model'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const body = await readBody(event)

  try {
    const ads = await AdvertisementModel.findOne().sort({ sort: -1 });
    if (ads && ads.sort > 1) {
      await AdvertisementModel.create(
        {
          title: body.advertise_title,
          image: body.advertise_image,
          link: body.advertise_link,
          sort: (ads.sort + 1)
        }
      );
    } else {
      await AdvertisementModel.create(
        {
          title: body.advertise_title,
          image: body.advertise_image,
          link: body.advertise_link,
          sort: 1
        }
      );
    }
    return { ok: true, message: "Advertisement created successfully." }
  } catch (error: any) {
    console.log(error)
    return { ok: false, message: "Something went wrong." }
  }
})
