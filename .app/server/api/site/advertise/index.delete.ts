import { getServerSession } from '#auth';
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import AdvertisementModel from '~/server/models/Advertisement.model';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  const body = await readBody(event)

  try {
    const config = useRuntimeConfig();
    const s3Client = new S3Client({
      region: config.digital_region,
      endpoint: config.digital_space_endpoint,
      credentials: {
        accessKeyId: config.digital_access_key_id,
        secretAccessKey: config.digital_secret_access_key
      }
    })

    const advertise = await AdvertisementModel.findById(body.advertiseId)
    const imageName = advertise?.image.split('/').pop()
    const key = `images/${imageName}`
    const command = new DeleteObjectCommand({
      Bucket: config.digital_space_name,
      Key: key,
    });

    const response = await s3Client.send(command);
    if (response) {
      await AdvertisementModel.deleteOne({ _id: body.advertiseId });
      return { ok: true, message: "Advertisement deleted successfully." }
    }

    return { ok: false, message: "Please check Digitalocean server." }
  } catch (error: any) {
    console.log(error)
    return { ok: false, message: "Something went wrong." }
  }
})
