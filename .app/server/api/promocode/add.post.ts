import { getServerSession } from '#auth'
import PromoCodeModel from '~/server/models/PromoCode.model'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const body = await readBody(event)

  try {
    await PromoCodeModel.create({ ...body });
    return { ok: true, message: "Promo Code created successfully." }
  } catch (error: any) {
    console.log(error)
    return { ok: false, message: "Something went wrong." }
  }
})
