import { getServerSession } from '#auth'
import PromoCodeModel from '~/server/models/PromoCode.model'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const body = await readBody(event)

  try {
    await PromoCodeModel.updateOne(
      {
        _id: body.codeId
      },
      {
        promoCode: body.promoCode,
        promoDescription: body.promoDescription,
        promoDiscount: body.promoDiscount,
        promoExpiry: body.promoExpiry,
        promoPeriod: body.promoPeriod,
      }
    );
    return { ok: true, message: "Promo code updated successfully." }
  } catch (error: any) {
    console.log(error)
    return { ok: false, message: "Something went wrong." }
  }
})
