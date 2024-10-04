import { getServerSession } from '#auth'
import EventsModel from '~/server/models/Events.model'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const body = await readBody(event)

  try {
    await EventsModel.deleteOne({ _id: body.eventId });
    return { ok: true, message: "Event deleted successfully." }
  } catch (error: any) {
    console.log(error)
    return { ok: false, message: "Something went wrong." }
  }
})
