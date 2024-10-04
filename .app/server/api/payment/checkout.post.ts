import { getServerSession } from '#auth';
import Stripe from 'stripe';
import { Status } from '~/lib/constant';
import SubscriptionModel from '~/server/models/Subscription.model';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  try {
    const { origin } = getHeaders(event)
    const data = await readBody(event)
    const userId = data.userId as string;
    const lookupKey = data.membership;

    const config = useRuntimeConfig();
    const stripe = new Stripe(config.stripe_private, {
      apiVersion: '2023-08-16',
    })
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      expand: ['data.product'],
    });
    const priceId = prices.data[0].id;
    if (!priceId) {
      return { ok: false, message: 'Stripe API invalid' }
    }

    // Find subscription by user id and status is active
    const subscribe = await SubscriptionModel.findOne({ $and: [{ userId: userId }, { status: Status.ACTIVE }] })
    if (subscribe?.stripePriceId === priceId) {
      return { ok: true, message: 'User already has a memebership.' }
    }

    // Create stripe checkout session
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          // For metered billing, do not pass quantity
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/users/user-edit/subscription?user=${userId}`,
      cancel_url: `${origin}/users/user-edit/subscription?user=${userId}&cancel=true`,
      metadata: { user: userId, lookupKey: lookupKey, prevCheckoutId: subscribe?.checkoutId }
    });

    // Insert subscription
    await SubscriptionModel.create({
      userId: userId,
      checkoutId: session.id,
      stripePriceId: priceId,
      status: Status.PENDING,
    })

    return { ok: true, info: { url: session.url }, message: 'Subscription added successfully.' }
  } catch (error) {
    console.log(error)
    return { ok: false, message: 'Something went wrong.' }
  }
})
