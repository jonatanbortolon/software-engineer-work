import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Sales extends BaseSchema {
  protected tableName = 'sales'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('paid_at')

      table
        .enum('payment', ['M', 'DC', 'CC'], {
          useNative: true,
          enumName: 'payment_type',
          existingType: false,
        })
        .defaultTo('M')

      table.integer('salesman_id').unsigned().references('users.id').onDelete('cascade')
    })
  }
}
