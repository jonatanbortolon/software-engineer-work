import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Account from 'App/Models/Account'
import SignupLink from 'App/Models/SignupLink'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'

export default class AccountsController {
  public async index({ response, view, auth, session }: HttpContextContract) {
    if (auth.user!.role !== 'ADMIN') {
      session.flash('error', 'Você não tem permissão!')
      return response.redirect().back()
    }

    const link = await SignupLink.query()
      .withScopes((scope) => scope.accountScope(auth.user!.accountId))
      .orderBy('expires_at', 'desc')
      .where('expires_at', '>=', new Date())
      .whereNull('used_at')
      .first()

    const accounts = await User.query().withScopes((scope) =>
      scope.accountScope(auth.user!.accountId)
    )

    return view.render('accounts', {
      baseUrl: Env.get('BASE_URL'),
      link: link,
      accounts: accounts,
    })
  }

  public async update({ request, response, auth, session }: HttpContextContract) {
    try {
      await auth.use('web').user!.load('account')

      if (auth.use('web').user!.id !== auth.use('web').user!.account.id) {
        session.flash('error', 'Você não tem permissão!')
        return response.redirect().back()
      }

      const Schema = schema.create({
        tradingName: schema.string({}, [rules.required()]),
        document: schema.string.optional({}, [
          rules.regex(/\d\d\.\d\d\d\.\d\d\d\/\d\d\d\d\-\d\d/g),
        ]),
        address: schema.string.optional({}, []),
      })

      await request.validate({
        schema: Schema,
      })

      const tradingName = request.input('tradingName')
      const document = request.input('document')
      const address = request.input('address')

      const account = await Account.findOrFail(auth.use('web').user!.account.id)

      await account
        .merge({
          tradingName: tradingName,
          document: document,
          address: address,
        })
        .save()

      session.flash('success', 'Perfil da empresa alterado!')
      return response.redirect().back()
    } catch (e) {
      console.log(e.toString())
      session.flash('error', e)
      return response.redirect().back()
    }
  }
}
