import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class CourseCategory extends BaseModel {
  public static table = 'courses_categories'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare course_id: number

  @column()
  declare category_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
