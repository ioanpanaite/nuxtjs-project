import { getServerSession } from '#auth'
import PromoCodeModel from '~/server/models/PromoCode.model'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const codes = await getCodes()
  return { codes }
})


const getCodes = async () => {
  try {
    const codes = await PromoCodeModel.find();
    return codes;
  } catch (error: any) {
    console.log(error)
    return null
  }
}