import mongoose from "mongoose";

const schema: mongoose.Schema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    checkoutId: {
      type: String,
    },
    stripePriceId: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  {
    collection: 'Subscription',
    timestamps: true
  }
)

export default mongoose.model('Subscription', schema)