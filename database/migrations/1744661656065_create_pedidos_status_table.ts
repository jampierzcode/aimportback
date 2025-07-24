import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pedidos_status'

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
      table
        .integer('user_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.string('status').notNullable()
      table.string('submotivo').nullable()
      table.string('observacion').nullable()
      table.timestamp('fecha_reprogramacion').nullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
