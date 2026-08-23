import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campaigns'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .foreign('cliente_id')
        .references('id')
        .inTable('clientes')
        .onDelete('CASCADE') // elimina campaign si se elimina el cliente
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('cliente_id')
    })
  }
}
