import { getServerSession } from '#auth'
import EventsModel from '~/server/models/Events.model'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const body = await readBody(event)

  try {
    await EventsModel.create(
      {
        eventTitle: body.event_title,
        eventLink: body.event_link,
        eventInfo: body.event_info,
        eventDate: body.event_date,
      }
    );
    return { ok: true, message: "Event created successfully." }
  } catch (error: any) {
    console.log(error)
    return { ok: false, message: "Something went wrong." }
  }
})
