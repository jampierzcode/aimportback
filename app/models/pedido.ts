import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Sede from './sede.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import PedidoStatus from './pedido_status.js'
import PedidoMultimedia from './pedido_multimedia.js'

export default class Pedido extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare id_solicitante: string

  @column()
  declare nombre_solicitante: string

  @column()
  declare direccion: string

  @column()
  declare referencia: string

  @column()
  declare celular: string

  @column()
  declare ubigeo: string

  @column()
  declare marca: string

  @column()
  declare num_cajas: string

  @column()
  declare status: string

  @column()
  declare origen_id: number

  // Relación con la sede origen
  @belongsTo(() => Sede, {
    foreignKey: 'origen_id',
  })
  public origen!: BelongsTo<typeof Sede>

  // Relación con la sede destino
  @belongsTo(() => Sede, {
    foreignKey: 'destino_id',
  })
  public destino!: BelongsTo<typeof Sede>

  // Relación con pedidos status
  @hasMany(() => PedidoStatus, {
    foreignKey: 'pedido_id',
  })
  public status_pedido!: HasMany<typeof PedidoStatus>

  // Relación con pedidos multimedia
  @hasMany(() => PedidoMultimedia, {
    foreignKey: 'pedido_id',
  })
  public multimedia!: HasMany<typeof PedidoMultimedia>

  @column()
  declare destino_id: number

  @column()
  declare campaign_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
