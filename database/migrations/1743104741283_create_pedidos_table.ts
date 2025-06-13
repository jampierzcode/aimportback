import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pedidos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('id_solicitante').notNullable()
      table.string('entrega').nullable()
      table.string('zona_ventas').nullable()
      table.string('org_ventas').nullable()
      table.string('fecha_pedido').nullable()
      table.string('dni').nullable()
      table.string('bulto').nullable()
      table.string('empaque').nullable()
      table.string('auditoria').nullable()
      table.string('mail_plan').nullable()
      table.string('nombre_solicitante').nullable()
      table.string('departamento').nullable()
      table.string('provincia').nullable()
      table.string('distrito').nullable()
      table.string('direccion').nullable()
      table.string('referencia').nullable()
      table.string('celular').nullable()
      table.string('ubigeo').nullable()
      table.string('marca').nullable()
      table.string('num_cajas').nullable()
      table.string('status').nullable()

      table.integer('origen_id').unsigned().references('id').inTable('sedes').nullable()
      table.integer('destino_id').unsigned().references('id').inTable('sedes').nullable()
      table
        .integer('campaign_id')
        .unsigned()
        .references('id')
        .inTable('campaigns')
        .nullable()
        .onDelete('CASCADE')

      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
