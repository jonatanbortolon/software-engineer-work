import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Stocks extends BaseSchema {
  protected tableName = 'stocks'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('product_id').unsigned().references('products.id')
      table
        .enum('type', ['INCREASE', 'DECREASE'], {
          useNative: true,
          enumName: 'stock_type',
          existingType: true,
        })
        .defaultTo('INCREASE')
      table.integer('quantity')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.table('stocks', (table) => {
      table.dropForeign('product_id')
    })

    this.schema.dropTable(this.tableName)
  }
}
