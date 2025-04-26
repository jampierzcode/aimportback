import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Pedido from './pedido.js'
import Cliente from './cliente.js'

export default class Campaign extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare cliente_id: number

  // Relación autorreferencial para obtener la sede
  @hasMany(() => Pedido, {
    foreignKey: 'campaign_id', // Llave foránea en la tabla users que apunta a sedes
  })
  declare pedidos: HasMany<typeof Pedido>

  // Relación autorreferencial para obtener la sede
  @hasOne(() => Cliente, {
    foreignKey: 'cliente_id', // Llave foránea en la tabla users que apunta a sedes
  })
  declare cliente: HasOne<typeof Cliente>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
