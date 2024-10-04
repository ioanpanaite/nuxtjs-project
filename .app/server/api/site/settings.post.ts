import { getServerSession } from '#auth'
import SiteSettingsModel from '~/server/models/SiteSettings.model'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const body = await readBody(event)
  const contentId = body.id

  try {
    if (contentId) {
      await SiteSettingsModel.updateOne(
        { _id: contentId },
        {
          site_title: body.site_title,
          reset_pass: body.reset_pass,
          verify_pass: body.verify_pass,
          change_pass: body.change_pass,
          twofactor_enable: body.twofactor_enable,
          twofactor_disable: body.twofactor_disable,
          credential_warning: body.credential_warning,
          code_expired: body.code_expired,
        }
      );
      return { ok: true, message: "Frontend site global settings updated successfully." }
    } else {
      await SiteSettingsModel.create(
        {
          site_title: body.site_title,
          reset_pass: body.reset_pass,
          verify_pass: body.verify_pass,
          change_pass: body.change_pass,
          twofactor_enable: body.twofactor_enable,
          twofactor_disable: body.twofactor_disable,
          credential_warning: body.credential_warning,
          code_expired: body.code_expired,
        }
      );
      return { ok: true, message: "Frontend site global settings created successfully." }
    }
  } catch (error: any) {
    console.log(error)
    return { ok: false, message: "Something went wrong." }
  }
})
