import { getServerSession } from '#auth'
import PromoCodeModel from '~/server/models/PromoCode.model'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const query = getQuery(event)
  const codeId = query.codeId as string;
  const codeRes = await getCodeById(codeId)

  return { code: codeRes }
})

const getCodeById = async (codeId: string) => {
  try {
    const code = await PromoCodeModel.findOne({ _id: codeId });
    return code;
  } catch (error: any) {
    console.log(error)
    return null
  }
}