import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pedidos_multimedias'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Nombre del objeto dentro del bucket S3. Con esto siempre podemos
      // regenerar una URL firmada vigente, en vez de depender de una
      // URL guardada que puede vencer o dejar de funcionar.
      table.string('key', 500).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('key')
    })
  }
}
