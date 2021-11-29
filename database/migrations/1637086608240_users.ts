import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('role', ['ADMIN', 'SALESMAN', 'STOCKIST'], {
          useNative: true,
          enumName: 'user_role',
          existingType: false,
        })
        .defaultTo('ADMIN')
      table.string('phone').nullable()

      table.integer('account_id').unsigned().references('accounts.id').onDelete('cascade')
    })
  }
}
