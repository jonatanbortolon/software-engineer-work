import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import SignupLink from 'App/Models/SignupLink'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'
import Account from 'App/Models/Account'

export default class AuthController {
  public async signinGet({ view }: HttpContextContract) {
    return view.render('signin')
  }

  public async signinPost({ request, response, auth, session }: HttpContextContract) {
    try {
      const Schema = schema.create({
        email: schema.string({}, [rules.required(), rules.email()]),
        password: schema.string({}, [rules.required()]),
      })

      await request.validate({
        schema: Schema,
        messages: {
          'email.email': 'O campo email tem que ser um email válido!',
          'email.required': 'O campo email é obrigatório!',
          'password.required': 'O campo senha é obrigatório!',
        },
      })

      const email = request.input('email')
      const password = request.input('password')

      await auth.use('web').attempt(email, password)

      return response.redirect().toRoute('dashboard.get')
    } catch (e) {
      session.flash('errors', e.messages)
      return response.redirect().back()
    }
  }

  public async signupGet({ view }: HttpContextContract) {
    return view.render('signup')
  }

  public async signupPost({ request, response, auth, session }: HttpContextContract) {
    try {
      const Schema = schema.create({
        name: schema.string({}, [rules.required()]),
        email: schema.string({}, [
          rules.required(),
          rules.email(),
          rules.unique({ table: 'users', column: 'email' }),
        ]),
        password: schema.string({}, [rules.required(), rules.confirmed()]),
        terms: schema.boolean([rules.required()]),
      })

      await request.validate({
        schema: Schema,
        messages: {
          'name.required': 'O campo nome é obrigatório',
          'email.required': 'O campo email é obrigatório',
          'email.unique': 'Email já cadastrado',
          'password.required': 'O campo senha é obrigatório',
          'terms.required': 'O campo termos é obrigatório',
          'password.confirmed': 'As senhas não são iguais',
        },
      })

      const name = request.input('name')
      const email = request.input('email')
      const password = request.input('password')

      const trx = await Database.transaction()

      const account = await Account.create({
        tradingName: name,
      })

      const user = await User.create({
        name,
        email,
        password,
        accountId: account.id,
      })

      await account.merge({ userId: user.id }).save()

      trx.commit()

      await auth.use('web').attempt(email, password)

      return response.redirect().toRoute('dashboard.get')
    } catch (e) {
      session.flash('errors', e.messages)
      return response.redirect().back()
    }
  }

  public async signupParentGet({ response, view, params }: HttpContextContract) {
    try {
      const link = await SignupLink.query()
        .orderBy('expires_at', 'desc')
        .where('slug', params.slug)
        .where('expires_at', '>=', new Date())
        .whereNull('used_at')
        .preload('account')
        .first()

      if (!link) {
        return response.status(404)
      }

      return view.render('signupparent', {
        slug: link.slug,
        tradingName: link.account.tradingName,
        role: { ADMIN: 'administrador', SALESMAN: 'vendedor', STOCKIST: 'estoquista' }[link.role],
      })
    } catch (e) {
      return response.status(404)
    }
  }

  public async signupParentPost({ request, response, auth, session, params }: HttpContextContract) {
    try {
      const link = await SignupLink.query()
        .orderBy('expires_at', 'desc')
        .where('slug', params.slug)
        .where('expires_at', '>=', new Date())
        .whereNull('used_at')
        .first()

      if (!link) {
        return response.status(404)
      }

      const Schema = schema.create({
        name: schema.string({}, [rules.required()]),
        email: schema.string({}, [
          rules.required(),
          rules.email(),
          rules.unique({ table: 'users', column: 'email' }),
        ]),
        password: schema.string({}, [rules.required(), rules.confirmed()]),
        terms: schema.boolean([rules.required()]),
      })

      await request.validate({
        schema: Schema,
        messages: {
          'name.required': 'O campo nome é obrigatório',
          'email.required': 'O campo email é obrigatório',
          'email.unique': 'Email já cadastrado',
          'password.required': 'O campo senha é obrigatório',
          'terms.required': 'O campo termos é obrigatório',
          'password.confirmed': 'As senhas não são iguais',
        },
      })

      const name = request.input('name')
      const email = request.input('email')
      const password = request.input('password')

      await User.create({
        name,
        email,
        password,
        accountId: link.accountId,
        role: link.role,
      })

      await link.merge({ usedAt: DateTime.now() }).save()

      await auth.use('web').attempt(email, password)

      return response.redirect().toRoute('dashboard.get')
    } catch (e) {
      session.flash('errors', e.messages)
      return response.redirect().back()
    }
  }

  public async signoutGet({ response, auth }: HttpContextContract) {
    await auth.use('web').logout()
    response.redirect('/entrar')
  }

  public async deleteParentPost({ response, auth, params, session }: HttpContextContract) {
    try {
      if (auth.user!.role !== 'ADMIN') {
        session.flash('error', 'Você não tem permissão!')
        return response.redirect().back()
      }

      if (!params.id) {
        session.flash('error', 'Forneça um usuário!')
        return response.redirect().back()
      }

      if (String(params.id) === String(auth.use('web').user!.id)) {
        session.flash('error', 'Você não pode excluir seu próprio usuário!')
        return response.redirect().back()
      }

      await auth.use('web').user!.load('account')

      const user = await User.findOrFail(params.id)

      if (auth.use('web').user!.account.userId === user.id) {
        session.flash('error', 'Você não pode excluir esse usuário!')
        return response.redirect().back()
      }

      user.delete()

      session.flash('success', 'Usuário removido!')
      return response.redirect().back()
    } catch (e) {
      console.log(e.toString())
      session.flash('error', e)
      return response.redirect().back()
    }
  }
}
