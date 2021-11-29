import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SignupLinks extends BaseSchema {
  protected tableName = 'signup_links'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('slug')
      table.timestamp('expires_at', { useTz: true })
      table.timestamp('used_at', { useTz: true }).nullable()
      table
        .enum('role', ['ADMIN', 'SALESMAN', 'STOCKIST'], {
          useNative: true,
          enumName: 'user_link_role',
          existingType: true,
        })
        .defaultTo('ADMIN')

      table.integer('account_id').unsigned().references('accounts.id').onDelete('cascade')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.table('signup_links', (table) => {
      table.dropForeign('account_id')
    })

    this.schema.dropTable(this.tableName)
  }
}
