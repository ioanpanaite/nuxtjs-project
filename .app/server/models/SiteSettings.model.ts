import mongoose from "mongoose";

const schema: mongoose.Schema = new mongoose.Schema(
  {
    site_title: {
      type: String,
      required: true
    },
    reset_pass: {
      type: String,
      required: true
    },
    verify_pass: {
      type: String,
      required: true
    },
    change_pass: {
      type: String,
      required: true
    },
    twofactor_enable: {
      type: String,
      required: true
    },
    twofactor_disable: {
      type: String,
      required: true
    },
    credential_warning: {
      type: String,
      required: true
    },
    code_expired: {
      type: String,
      required: true
    },
  },
  {
    collection: 'SiteSettings',
    timestamps: true
  }
)

export default mongoose.model('SiteSettings', schema)