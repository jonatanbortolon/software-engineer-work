import { DateTime } from 'luxon'
import {
  afterFetch,
  afterFind,
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  computed,
  ManyToMany,
  manyToMany,
  scope,
} from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'
import Client from './Client'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import Account from './Account'
import User from './User'

export default class Sale extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  public id: number

  @column()
  public payment: 'M' | 'DC' | 'CC'

  @column()
  public accountId: number

  @column()
  public salesmanId: number

  @column()
  public clientId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public static accountScope = scope((query, account: number) => {
    query.where('account_id', account)
  })

  @belongsTo(() => Account)
  public account: BelongsTo<typeof Account>

  @belongsTo(() => User, { foreignKey: 'salesmanId' })
  public salesman: BelongsTo<typeof User>

  @belongsTo(() => Client)
  public client: BelongsTo<typeof Client>

  @manyToMany(() => Product, {
    pivotColumns: ['quantity'],
  })
  public products: ManyToMany<typeof Product>

  @computed()
  public get formattedPayment() {
    const payments = { M: 'Dinheiro', DC: 'Cartão de débito', CC: 'Cartão de crédito' }

    return payments[this.payment]
  }

  @afterFetch()
  public static async getTotalFetch(sales: Sale[]) {
    for (const sale of sales) {
      sale.load('products')
      const total = await sale.products.reduce((carry, product) => {
        const productTotal = product.price * product.$extras.pivot_quantity

        return carry + productTotal
      }, 0)

      sale.$extras.total = total

      const formatter = new Intl.NumberFormat('pt-br', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })

      const formattedTotal = formatter.format(total / 100)

      sale.$extras.formattedTotal = formattedTotal
    }
  }

  @afterFetch()
  public static async getTotalProductsFetch(sales: Sale[]) {
    for (const sale of sales) {
      sale.load('products')

      let products = {}

      for (const product of sale.products) {
        products[product.name] = product.$extras.pivot_quantity
      }

      sale.$extras.totalProducts = products
    }
  }

  @afterFind()
  public static async getTotalFind(sale: Sale) {
    sale.load('products')

    const total = await sale.products.reduce((carry, product) => {
      const productTotal = product.price * product.$extras.pivot_quantity

      return carry + productTotal
    }, 0)

    sale.$extras.total = total

    const formatter = new Intl.NumberFormat('pt-br', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    const formattedTotal = formatter.format(total / 100)

    sale.$extras.formattedTotal = formattedTotal
  }

  @afterFind()
  public static async getTotalProductsFind(sale: Sale) {
    sale.load('products')

    let products = {}

    for (const product of sale.products) {
      products[product.name] = product.$extras.pivot_quantity
    }

    sale.$extras.totalProducts = products
  }
}
