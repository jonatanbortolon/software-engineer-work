import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  hasMany,
  HasMany,
  scope,
  computed,
  BelongsTo,
  belongsTo,
  afterFetch,
  afterFind,
} from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'
import Product from './Product'
import Account from './Account'
import Sale from './Sale'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public phone: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column()
  public accountId: number

  @column()
  public role: 'ADMIN' | 'SALESMAN' | 'STOCKIST'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Client)
  public clients: HasMany<typeof Client>

  @hasMany(() => Product)
  public products: HasMany<typeof Product>

  @hasMany(() => Sale, { foreignKey: 'salesmanId' })
  public sales: HasMany<typeof Sale>

  @belongsTo(() => Account)
  public account: BelongsTo<typeof Account>

  public static accountScope = scope((query, account: number) => {
    query.where('account_id', account)
  })

  @computed()
  public get chatSlug() {
    return this.name.replace(/ /g, '')
  }

  @computed()
  public get formattedPhone() {
    if (this.phone) {
      const formatted = this.phone
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d)(\d{4})$/, '$1-$2')

      return formatted
    } else {
      return null
    }
  }

  @beforeSave()
  public static async formatName(client: Client) {
    client.name = client.name
      .toLowerCase()
      .replace(/(^\w{1})|(\s{1}\w{1})/g, (match) => match.toUpperCase())
  }

  @beforeSave()
  public static async formatPhoneSave(client: Client) {
    if (client.$dirty.phone) {
      client.phone = client.phone.replace(/\D+/g, '').replace(/\s/g, '')
    }
  }

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @afterFetch()
  public static async getTotalSalesValueFetch(users: User[]) {
    for (const user of users) {
      await user.load('sales')

      let totalValue = 0

      for (const sale of user.sales ?? []) {
        await sale.load('products')

        const total = sale.products?.reduce((carry, product) => {
          const productTotal = product.price * product.$extras.pivot_quantity

          return carry + productTotal
        }, 0)

        totalValue += total
      }

      const formatter = new Intl.NumberFormat('pt-br', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })

      const formattedTotal = formatter.format(totalValue / 100)

      user.$extras.formattedTotalSales = formattedTotal
    }
  }

  @afterFind()
  public static async getTotalSalesValueFind(user: User) {
    await user.load('sales')

    let totalValue = 0

    for (const sale of user.sales ?? []) {
      await sale.load('products')

      const total = sale.products?.reduce((carry, product) => {
        const productTotal = product.price * product.$extras.pivot_quantity

        return carry + productTotal
      }, 0)

      totalValue += total
    }

    const formatter = new Intl.NumberFormat('pt-br', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    const formattedTotal = formatter.format(totalValue / 100)

    user.$extras.formattedTotalSales = formattedTotal
  }

  @afterFetch()
  public static async getTotalSalesQuantityFetch(users: User[]) {
    for (const user of users) {
      await user.load('sales')

      let total = user.sales.length ?? 0

      user.$extras.TotalSalesQuantity = total
    }
  }

  @afterFind()
  public static async getTotalSalesQuantityFind(user: User) {
    await user.load('sales')

    let total = user.sales.length ?? 0

    user.$extras.TotalSalesQuantity = total
  }
}
