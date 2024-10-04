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
    if (body.image != '') {
      const config = useRuntimeConfig();
      const s3Client = new S3Client({
        region: config.digital_region,
        endpoint: config.digital_space_endpoint,
        credentials: {
          accessKeyId: config.digital_access_key_id,
          secretAccessKey: config.digital_secret_access_key
        }
      })

      const advertise = await AdvertisementModel.findById(body.id)
      const imageName = advertise?.image.split('/').pop()
      const key = `images/${imageName}`
      const command = new DeleteObjectCommand({
        Bucket: config.digital_space_name,
        Key: key,
      });

      const response = await s3Client.send(command);
      if (response) {
        await AdvertisementModel.updateOne({ _id: body.id },
          { image: body.image, }
        );
      }
    }

    await AdvertisementModel.updateOne(
      {
        _id: body.id
      },
      {
        title: body.title,
        link: body.link
      }
    );
    return { ok: true, message: "Advertisement updated successfully." }
  } catch (error: any) {
    console.log(error)
    return { ok: false, message: "Something went wrong." }
  }
})
