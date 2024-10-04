import mongoose from "mongoose";

const schema: mongoose.Schema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    sort: {
      type: Number,
    }
  },
  {
    collection: 'Advertisement',
    timestamps: true
  }
)

export default mongoose.model('Advertisement', schema)