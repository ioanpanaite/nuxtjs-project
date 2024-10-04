import { getServerSession } from '#auth';
import * as AWS from '@aws-sdk/client-s3';
import { Upload } from "@aws-sdk/lib-storage";
import formidable from 'formidable';
import { PassThrough } from 'node:stream';

const config = useRuntimeConfig();
const s3Client = new AWS.S3Client({
  region: config.digital_region,
  endpoint: config.digital_space_endpoint,
  credentials: {
    accessKeyId: config.digital_access_key_id,
    secretAccessKey: config.digital_secret_access_key
  }
})

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({ statusMessage: 'Unauthenticated', statusCode: 403 })
  }

  try {
    const body = await manageNodeRequest(event.node.req);
    const image = body?.image[0].location

    return { ok: true, info: { image }, message: "File uploaded successfully." }
  } catch (error: any) {
    console.log(error)
    return { ok: false, message: "Something went wrong." }
  }
})

function manageNodeRequest(req: any) {
  return new Promise((resolve, reject) => {
    let s3Uploads: any[] = []

    const fileWriteStreamer = (file: any) => {
      const body = new PassThrough()
      const uploader = new Upload({
        client: s3Client,
        params: {
          Bucket: config.digital_space_name,
          Key: `images/${file.newFilename}.${getExtension(file.originalFilename)}`,
          Body: body,
          ACL: 'public-read'
        }
      })

      const uploadRequest = uploader.done().then((res: any) => {
        file.location = res.Location;
      })
      s3Uploads.push(uploadRequest)

      return body
    }
    const form = formidable({
      fileWriteStreamHandler: fileWriteStreamer
    })
    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error);
        return;
      }
      Promise.all(s3Uploads)
        .then(() => {
          resolve({ ...fields, ...files });
        })
        .catch(reject);
    });
  });

}

function getExtension(filename: string) {
  return filename.split('.').pop();
}