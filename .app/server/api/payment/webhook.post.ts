import Stripe from 'stripe';
import { Status } from '~/lib/constant';
import SubscriptionModel from '~/server/models/Subscription.model';
import UserModel from '~/server/models/User.model';

const endpointSecret = "whsec_5f8beaae96646ca0238248c0fbafcf84c64405f9720480fca58e86680bd6d6e0";

export default defineEventHandler(async (e) => {
  const headers = getHeaders(e)
  const body = await readRawBody(e) || ''

  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripe_private, {
    apiVersion: '2023-08-16',
  })

  let event = JSON.parse(body);
  // Handle the event
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = headers['stripe-signature'] || '';
    const bodyWebhook = body as string;

    try {
      event = stripe.webhooks.constructEvent(
        bodyWebhook,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️ constructEvent failed.`);
    }
  }

  let subscription = event?.data?.object;
  if (event?.type === 'checkout.session.completed') {
    await handleSessionCompleted(subscription, stripe)
  } else {
    console.log(event.type)
  }

  return { ok: true }
})

const handleSessionCompleted = async (subscriptionData: any, stripe: Stripe) => {
  try {
    if (subscriptionData.status === 'complete') {
      const { user, lookupKey, prevCheckoutId } = subscriptionData.metadata;

      const subscribe = await stripe.subscriptions.retrieve(subscriptionData.subscription)
      await UserModel.updateOne({ _id: user }, { lookupKey: lookupKey, subscriptionEnd: subscribe.current_period_end })

      // Insert subscription
      await SubscriptionModel.updateOne({ checkoutId: subscriptionData.id }, { status: Status.ACTIVE })

      if (prevCheckoutId) {
        // Update subscription status
        await SubscriptionModel.updateOne({ checkoutId: prevCheckoutId }, { status: Status.UPGRADE })
        const reSession = await stripe.checkout.sessions.retrieve(prevCheckoutId)

        // Cancel subscription
        const subscriptionId = reSession?.subscription as string
        await stripe.subscriptions.cancel(subscriptionId);
      }
    }
  } catch (error) {
    console.log(error)
  }
}
