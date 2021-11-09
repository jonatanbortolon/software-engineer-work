import { DateTime } from 'luxon'
import { compose } from '@ioc:Adonis/Core/Helpers'
import {
  afterFetch,
  afterFind,
  BaseModel,
  beforeSave,
  BelongsTo,
  belongsTo,
  column,
  computed,
  ManyToMany,
  manyToMany,
  scope,
} from '@ioc:Adonis/Lucid/Orm'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import User from './User'
import Sale from './Sale'

export default class Product extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public stock: number

  @column()
  public price: number

  @column()
  public userId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get formatedPrice() {
    const formatter = new Intl.NumberFormat('pt-br', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    return formatter.format(this.price)
  }

  @beforeSave()
  public static async formatPriceSave(product: Product) {
    if (product.$dirty.price) {
      product.price = product.price * 100
    }
  }

  @afterFetch()
  public static async formatPriceFetch(products: Product[]) {
    products.forEach((product) => (product.price = product.price / 100))
  }

  @afterFind()
  public static async formatPriceFind(product: Product) {
    product.price = product.price / 100
  }

  public static userScope = scope((query, user: number) => {
    query.where('user_id', user)
  })

  @manyToMany(() => Sale, { pivotColumns: ['quantity'] })
  public sales: ManyToMany<typeof Sale>
}
