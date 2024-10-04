import mongoose from "mongoose";

const schema: mongoose.Schema = new mongoose.Schema(
  {
    eventTitle: {
      type: String,
      required: true
    },
    eventLink: {
      type: String,
    },
    eventInfo: {
      type: String,
    },
    eventDate: {
      type: String,
      required: true
    },
  },
  {
    collection: 'Events',
    timestamps: true
  }
)

export default mongoose.model('Events', schema)