import mongoose from "mongoose";

const schema: mongoose.Schema = new mongoose.Schema(
  {
    promoCode: {
      type: String,
      required: true
    },
    promoDescription: {
      type: String,
    },
    promoDiscount: {
      type: Number,
      required: true
    },
    promoExpiry: {
      type: String
    },
    promoPeriod: {
      type: String,
    },
  },
  {
    collection: 'PromoCode',
    timestamps: true
  }
)

export default mongoose.model('PromoCode', schema)