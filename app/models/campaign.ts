import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Pedido from './pedido.js'
import Sede from './sede.js'

export default class Campaign extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  // Relación autorreferencial para obtener la sede
  @hasMany(() => Pedido, {
    foreignKey: 'campaign_id', // Llave foránea en la tabla users que apunta a sedes
  })
  declare pedidos: HasMany<typeof Pedido>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
