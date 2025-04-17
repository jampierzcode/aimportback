import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PedidoMultimedia extends BaseModel {
  public static table = 'pedidos_multimedias'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare pedido_id: number

  @column()
  declare url: string

  @column()
  declare type: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
