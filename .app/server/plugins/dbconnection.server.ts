import mongoose from "mongoose";
export default async () => {
  try {
    const dbconnect = async () => {
      const config = useRuntimeConfig();
      const DB_OPTIONS = {
        serverSelectionTimeoutMS: 5000
      }
      await mongoose.connect(config.mongodb_uri, DB_OPTIONS);
    }
    
    dbconnect()
      .catch((err) => console.error(err))
    
  } catch (error) {
    console.log(error)
  }
}
