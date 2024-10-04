import { getServerSession } from '#auth';
import Stripe from 'stripe';
import { Status } from '~/lib/constant';
import SubscriptionModel from '~/server/models/Subscription.model';
import UserModel from '~/server/models/User.model';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  try {
    const data = await readBody(event)
    const userId = data.userId as string;

    const config = useRuntimeConfig();
    const stripe = new Stripe(config.stripe_private, {
      apiVersion: '2023-08-16',
    })

    const subscribe = await SubscriptionModel.findOne({ $and: [{ userId: userId }, { status: Status.ACTIVE }] })
    const session = await stripe.checkout.sessions.retrieve(subscribe?.checkoutId)

    // Cancel subscription
    const subscriptionId = session?.subscription as string
    const result = await stripe.subscriptions.cancel(subscriptionId);

    await SubscriptionModel.updateOne({ $and: [{ userId: userId }, { status: Status.ACTIVE }] }, { status: Status.DELETE })
    await UserModel.updateOne({ _id: userId }, { lookupKey: '' })

    return { ok: true, message: 'Subscription canceled successfully.' }
  } catch (error) {
    console.log(error)
    return { ok: false, message: 'Something went wrong.' }
  }
})
