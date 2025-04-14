import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pedidos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('id_solicitante').notNullable()
      table.string('nombre_solicitante').notNullable()
      table.string('direccion').nullable()
      table.string('referencia').nullable()
      table.string('celular').nullable()
      table.string('ubigeo').nullable()
      table.string('marca').nullable()
      table.string('num_cajas').nullable()
      table.string('status').nullable()

      table.integer('origen_id').unsigned().references('id').inTable('sedes').notNullable()
      table.integer('destino_id').unsigned().references('id').inTable('sedes').notNullable()
      table.integer('campaign_id').unsigned().references('id').inTable('campaigns').nullable()

      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
