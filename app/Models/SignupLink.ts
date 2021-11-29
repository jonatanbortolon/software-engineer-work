import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column, scope } from '@ioc:Adonis/Lucid/Orm'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import Account from './Account'

export default class SignupLink extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  public id: number

  @column()
  public slug: string

  @column()
  public accountId: number

  @column()
  public role: 'ADMIN' | 'SALESMAN' | 'STOCKIST'

  @column.dateTime()
  public expiresAt: DateTime

  @column.dateTime()
  public usedAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Account)
  public account: BelongsTo<typeof Account>

  public static accountScope = scope((query, account: number) => {
    query.where('account_id', account)
  })
}
