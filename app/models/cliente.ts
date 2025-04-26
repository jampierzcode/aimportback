import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Cliente extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare usuario_id: number

  @column()
  declare razon_social: string

  @column()
  declare ruc: string

  @column()
  declare direccion: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Relación autorreferencial para obtener la sede
  @hasOne(() => User, {
    foreignKey: 'usuario_id', // Llave foránea en la tabla users que apunta a sedes
  })
  declare usuario: HasOne<typeof User>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
