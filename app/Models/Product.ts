import { DateTime } from 'luxon'
import { compose } from '@ioc:Adonis/Core/Helpers'
import {
  afterDelete,
  BaseModel,
  beforeSave,
  BelongsTo,
  belongsTo,
  column,
  computed,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
  scope,
} from '@ioc:Adonis/Lucid/Orm'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import Sale from './Sale'
import Stock from './Stock'
import Account from './Account'

export default class Product extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public price: number

  @column()
  public accountId: number

  @belongsTo(() => Account)
  public account: BelongsTo<typeof Account>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get formattedPrice() {
    const formatter = new Intl.NumberFormat('pt-br', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    return formatter.format(this.price / 100)
  }

  @beforeSave()
  public static async formatPriceSave(product: Product) {
    if (product.$dirty.price) {
      product.price = Number(String(product.price).replace('.', '').replace(',', '.')) * 100
    }
  }

  public static accountScope = scope((query, user: number) => {
    query.where('account_id', user)
  })

  @afterDelete()
  public static async deleteStocks(product: Product) {
    await product.load('stocks')

    const stocks = product.stocks ?? []

    for (const stock of stocks) {
      await stock.delete()
    }
  }

  @hasMany(() => Stock)
  public stocks: HasMany<typeof Stock>

  @manyToMany(() => Sale, { pivotColumns: ['quantity'] })
  public sales: ManyToMany<typeof Sale>
}
