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
  scope,
} from '@ioc:Adonis/Lucid/Orm'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import Sale from './Sale'
import Account from './Account'

export default class Client extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public phone: string

  @column()
  public email: string

  @column()
  public document: string

  @column()
  public accountId: number

  @belongsTo(() => Account)
  public account: BelongsTo<typeof Account>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public deletedAt: DateTime

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

  @computed()
  public get formattedDocument() {
    if (this.document) {
      const formatted = this.document
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

      return formatted
    } else {
      return null
    }
  }

  public static accountScope = scope((query, account: number) => {
    query.where('account_id', account)
  })

  @beforeSave()
  public static async formatPhoneSave(client: Client) {
    if (client.$dirty.phone) {
      client.phone = client.phone.replace(/\D+/g, '').replace(/\s/g, '')
    }
  }

  @beforeSave()
  public static async formatDocumentSave(client: Client) {
    if (client.$dirty.document) {
      client.document = client.document.replace(/\D+/g, '').replace(/\s/g, '')
    }
  }

  @afterDelete()
  public static async deleteSales(client: Client) {
    await client.load('sales')

    const sales = client.sales ?? []

    for (const sale of sales) {
      await sale.delete()
    }
  }

  @hasMany(() => Sale)
  public sales: HasMany<typeof Sale>
}
