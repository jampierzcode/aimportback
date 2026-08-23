import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campaigns'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      // La FK hacia `clientes` se agrega en una migración aparte
      // (1745646154226_add_cliente_fk_to_campaigns_table), porque la tabla
      // `clientes` se crea después que esta en el orden de migraciones.
      table.integer('cliente_id').unsigned().notNullable()
      table.string('name').nullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
