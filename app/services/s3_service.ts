import { randomUUID } from 'node:crypto'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import env from '#start/env'

/*
|--------------------------------------------------------------------------
| Servicio de almacenamiento S3 (bucket S3-compatible de Railway)
|--------------------------------------------------------------------------
|
| El bucket es privado, así que la URL pública de un objeto expira. Por eso
| NUNCA guardamos esa URL como definitiva: guardamos el "key" (la ruta del
| objeto dentro del bucket) y, cada vez que lo necesitamos, generamos una
| URL firmada nueva a partir de ese key. Así la imagen siempre se puede
| volver a mostrar, sin importar que la URL anterior haya vencido.
|
*/

const s3Client = new S3Client({
  region: env.get('S3_REGION'),
  endpoint: env.get('S3_ENDPOINT'),
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.get('S3_ACCESS_KEY_ID'),
    secretAccessKey: env.get('S3_SECRET_ACCESS_KEY'),
  },
})

const BUCKET = env.get('S3_BUCKET')

// 6 días: por debajo del máximo de 7 días que permite la firma SigV4.
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 6

/**
 * Genera un "key" único y seguro para guardar un archivo dentro de una
 * carpeta lógica del bucket (por ejemplo el id del pedido).
 */
export function buildObjectKey(folder: string | number, originalName?: string) {
  const safeFolder = String(folder || 'general')
    .trim()
    .replace(/[^a-zA-Z0-9/_-]/g, '_')

  const extension = originalName?.includes('.') ? originalName.split('.').pop() : undefined

  const fileName = `${Date.now()}-${randomUUID()}${extension ? `.${extension}` : ''}`

  return `${safeFolder}/${fileName}`
}

/**
 * Sube un archivo al bucket.
 */
export async function uploadObject(params: {
  key: string
  body: Buffer
  contentType?: string
}) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    })
  )

  return { key: params.key }
}

/**
 * Genera una URL firmada temporal para leer un objeto del bucket.
 */
export async function getSignedObjectUrl(key: string) {
  return getSignedUrl(s3Client, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
    expiresIn: SIGNED_URL_TTL_SECONDS,
  })
}

/**
 * Elimina un objeto del bucket. No lanza error si el objeto ya no existe.
 */
export async function deleteObject(key: string) {
  if (!key) return

  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
  } catch (error) {
    console.error(`No se pudo eliminar el objeto "${key}" del bucket:`, error)
  }
}
