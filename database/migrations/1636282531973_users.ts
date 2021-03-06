import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 255).notNullable()
      table.string('email', 255).notNullable()
      table.string('password', 180).notNullable()
      table.string('remember_me_token').nullable()
      table
        .enum('role', ['ADMIN', 'SALESMAN', 'STOCKIST'], {
          useNative: true,
          enumName: 'user_account_role',
          existingType: true,
        })
        .defaultTo('ADMIN')
      table.string('phone').nullable()

      table.integer('account_id').unsigned().references('accounts.id').onDelete('cascade')

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      // table.timestamp('deleted_at', { useTz: true })
    })

    this.schema.table('accounts', (table) => {
      table
        .integer('user_id')
        .unsigned()
        .references('users.id')
        .nullable()
        .onDelete('cascade')
        .alter()
    })
  }

  public async down() {
    this.schema.table('accounts', (table) => {
      table.dropForeign('user_id')
    })

    this.schema.table('users', (table) => {
      table.dropForeign('account_id')
    })

    this.schema.dropTable(this.tableName)
  }
}
