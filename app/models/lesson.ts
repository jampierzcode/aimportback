import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Lesson extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare section_id: number

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare resource: string

  @column()
  declare type_lesson: string

  @column()
  declare position: number

  @column()
  declare duration: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
