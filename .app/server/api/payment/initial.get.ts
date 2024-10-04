import { getServerSession } from '#auth';
import Stripe from 'stripe';
import SubscriptionModel from '~/server/models/Subscription.model';
import UserModel from '~/server/models/User.model';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const query = getQuery(event)
  const userId = query.id as string;

  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripe_private, {
    apiVersion: '2023-08-16',
  })

  // Get prices from stripe api
  const pricesList = await stripe.prices.list({
    expand: ['data.product']
  });
  const prices = pricesList.data.filter((v: any) => { if (v.lookup_key) return v })

  // Get subscription status
  const status = await getSubscriptionStatus(userId)

  // Get user info
  const user = await getUser(userId)

  return {
    prices,
    status,
    lookupKey: user?.lookupKey ? user?.lookupKey : ""
  }
})

const getUser = async (userId: string) => {
  try {
    const user = await UserModel.findOne({ _id: userId });
    return user
  } catch (error: any) {
    console.log(error)
  }
  return null
}


const getSubscriptionStatus = async (userId: string) => {
  try {
    const sub = await SubscriptionModel.findOne({ userId: userId });
    return sub ? true : false;
  } catch (error: any) {
    console.log(error)
  }
  return false
}
