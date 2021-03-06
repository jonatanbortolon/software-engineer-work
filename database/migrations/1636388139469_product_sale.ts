import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ProductSale extends BaseSchema {
  protected tableName = 'product_sale'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('quantity')

      table.integer('sale_id').unsigned().references('sales.id')
      table.integer('product_id').unsigned().references('products.id')
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.table('product_sale', (table) => {
      table.dropForeign('sale_id')
      table.dropForeign('product_id')
    })

    this.schema.dropTable(this.tableName)
  }
}
