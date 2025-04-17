import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Pedido from './pedido.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class PedidoAsignado extends BaseModel {
  public static table = 'pedidos_asignados'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare pedido_id: number

  @column()
  declare repartidor_id: number

  // Relación con la sede destino
  @belongsTo(() => Pedido, {
    foreignKey: 'pedido_id',
  })
  public pedido!: BelongsTo<typeof Pedido>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
