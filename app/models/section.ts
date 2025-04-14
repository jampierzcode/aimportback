import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Lesson from './lesson.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Section extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare course_id: number

  @column()
  declare title: String

  @column()
  declare position: Number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Relación autorreferencial para obtener el creador
  @hasMany(() => Lesson, {
    foreignKey: 'section_id', // Llave foránea en la tabla users que apunta a roles
  })
  declare lessons: HasMany<typeof Lesson>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
