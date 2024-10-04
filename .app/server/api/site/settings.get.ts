import { getServerSession } from '#auth'
import SiteSettingsModel from '~/server/models/SiteSettings.model'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const siteSettings = await getSiteSettings()
  return siteSettings
})

const getSiteSettings = async () => {
  try {
    const site = await SiteSettingsModel.findOne();
    return site;
  } catch (error: any) {
    console.log(error)
    return null
  }
}
