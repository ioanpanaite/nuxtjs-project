import { getServerSession } from '#auth'
import EventsModel from '~/server/models/Events.model'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const events = await getEvents()
  return { events }
})

const getEvents = async () => {
  try {
    const events = await EventsModel.find();
    return events;
  } catch (error: any) {
    console.log(error)
    return null
  }
}