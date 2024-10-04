import mongoose from "mongoose";

const schema: mongoose.Schema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
    },
    status: {
      type: String,
      required: true
    },
    twofactorEnabled: {
      type: Boolean,
    },
    picture: {
      type: String
    },
    loginType: {
      type: String
    }
  },
  {
    collection: 'CoreUsers',
    timestamps: true
  }
)

export default mongoose.model('CoreUsers', schema)