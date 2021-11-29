import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Sales extends BaseSchema {
  protected tableName = 'sales'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .enum('payment', ['M', 'DC', 'CC'], {
          useNative: true,
          enumName: 'payment_type',
          existingType: false,
        })
        .defaultTo('M')

      table.integer('salesman_id').unsigned().references('users.id').onDelete('cascade')

      table.integer('account_id').unsigned().references('accounts.id')
      table.integer('client_id').unsigned().references('clients.id')
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.table('sales', (table) => {
      table.dropForeign('account_id')
      table.dropForeign('client_id')
    })

    this.schema.dropTable(this.tableName)
  }
}
