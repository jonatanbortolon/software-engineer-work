import { DateTime } from 'luxon'
import {
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

export default class Sale extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime()
  public paidAt: DateTime

  @column()
  public userId: number

  @column()
  public clientId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get paid() {
    const paid = this.paidAt === null ? false : true

    return paid
  }

  public static userScope = scope((query, user: number) => {
    query.where('user_id', user)
  })

  @belongsTo(() => Client)
  public client: BelongsTo<typeof Client>

  @manyToMany(() => Product, {
    pivotColumns: ['quantity'],
  })
  public products: ManyToMany<typeof Product>
}
