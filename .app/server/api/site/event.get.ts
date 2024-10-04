import { getServerSession } from '#auth'
import EventsModel from '~/server/models/Events.model'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const query = getQuery(event)
  const eventId = query.eventId as string;
  const eventRes = await getEventById(eventId)

  return { event: eventRes }
})

const getEventById = async (eventId: string) => {
  try {
    const event = await EventsModel.findOne({ _id: eventId });
    return event;
  } catch (error: any) {
    console.log(error)
    return null
  }
}