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
} from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'
import Product from './Product'
import Account from './Account'

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
}
