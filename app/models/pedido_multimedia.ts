import { DateTime } from 'luxon'
import { BaseModel, afterFetch, afterFind, column } from '@adonisjs/lucid/orm'
import { getSignedObjectUrl } from '#services/s3_service'

export default class PedidoMultimedia extends BaseModel {
  public static table = 'pedidos_multimedias'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare pedido_id: number

  @column()
  declare url: string

  // Ruta del objeto dentro del bucket S3. A partir de este valor se
  // regenera la URL firmada cada vez que se lee el registro, así la
  // imagen se puede seguir mostrando aunque la URL anterior haya vencido.
  @column()
  declare key: string | null

  @column()
  declare type: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @afterFind()
  public static async refreshSignedUrl(multimedia: PedidoMultimedia) {
    if (multimedia.key) {
      multimedia.url = await getSignedObjectUrl(multimedia.key)
    }
  }

  @afterFetch()
  public static async refreshSignedUrls(multimedias: PedidoMultimedia[]) {
    await Promise.all(multimedias.map((multimedia) => this.refreshSignedUrl(multimedia)))
  }
}
