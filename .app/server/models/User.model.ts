import mongoose from "mongoose";

const schema: mongoose.Schema = new mongoose.Schema(
  {
    fullname: {
      type: String,
    },
    username: {
      type: String,
    },
    email: {
      type: String,
      required: true
    },
    image: {
      type: String,
    },
    password: {
      type: String,
    },
    status: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
    },
    emailSid: {
      type: String,
    },
    twofactorEnabled: {
      type: Boolean,
    },
    country: {
      type: String,
    },
    crypto: {
      type: String,
    },
    lookupKey: {
      type: String,
    },
    promoCode: {
      type: String,
    },
    telegram: {
      type: String,
    },
    loginType: {
      type: String
    },
    subscriptionEnd: {
      type: String,
    }
  },
  {
    collection: 'User',
    timestamps: true
  }
)

export default mongoose.model('User', schema)