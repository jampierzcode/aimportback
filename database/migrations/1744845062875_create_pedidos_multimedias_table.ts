import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pedidos_multimedias'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('pedido_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('pedidos')
        .onDelete('CASCADE')
      table.string('url', 255)
      table.string('type', 255)
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
