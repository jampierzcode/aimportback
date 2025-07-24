import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PedidoStatus extends BaseModel {
  public static table = 'pedidos_status'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare pedido_id: number

  @column()
  declare user_id: number

  @column()
  declare status: string

  @column()
  declare submotivo: string

  @column()
  declare observacion: string

  @column.dateTime()
  declare fecha_reprogramacion: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
