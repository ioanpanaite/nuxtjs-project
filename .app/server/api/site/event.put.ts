import { getServerSession } from '#auth'
import EventsModel from '~/server/models/Events.model'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const body = await readBody(event)

  try {
    await EventsModel.updateOne(
      {
        _id: body.event_id
      },
      {
        eventTitle: body.event_title,
        eventDate: body.event_date,
        eventLink: body.event_link,
        eventInfo: body.event_info,
      }
    );
    return { ok: true, message: "Event updated successfully." }
  } catch (error: any) {
    console.log(error)
    return { ok: false, message: "Something went wrong." }
  }
})
