import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sedes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned()
      table.string('name_referential', 255).notNullable()
      table.string('direction', 255).notNullable()
      table.string('department', 255).notNullable()
      table.string('province', 255).notNullable()
      table.string('district', 255).notNullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
