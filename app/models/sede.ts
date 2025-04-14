import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Pedido from './pedido.js'

export default class Sede extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name_referential: string

  @column()
  declare direction: string

  @column()
  declare department: string

  @column()
  declare province: string

  @column()
  declare district: string

  // Relación con pedidos donde esta sede es el origen
  @hasMany(() => Pedido, {
    foreignKey: 'origen_id',
  })
  public pedidosComoOrigen!: HasMany<typeof Pedido>

  // Relación con pedidos donde esta sede es el destino
  @hasMany(() => Pedido, {
    foreignKey: 'destino_id',
  })
  public pedidosComoDestino!: HasMany<typeof Pedido>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
