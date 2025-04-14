import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Category from './category.js'

export default class Course extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: String

  @column()
  declare description: String

  @column()
  declare duration: String

  @column()
  declare thumbnail: String

  @column()
  declare instructor_id: Number

  @manyToMany(() => Category, {
    pivotTable: 'courses_categories', // Especifica el nombre de la tabla pivote
    pivotForeignKey: 'course_id', // Columna en la tabla pivote que hace referencia a `Plan`
    pivotRelatedForeignKey: 'category_id', // Columna en la tabla pivote que hace referencia a `Module`
  })
  declare categories: ManyToMany<typeof Category>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
