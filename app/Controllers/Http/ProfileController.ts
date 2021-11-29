import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class ProfilesController {
  public async index({ view, auth }: HttpContextContract) {
    const profile = auth.use('web').user!

    await profile.load('account')

    const ownerId = profile.account.userId

    return view.render('profile', {
      profile: profile,
      ownerId: ownerId,
    })
  }

  public async update({ request, response, auth, session }: HttpContextContract) {
    try {
      const Schema = schema.create({
        name: schema.string({}, [rules.required()]),
        phone: schema.string.optional({}, [rules.regex(/\(\d{2,}\) \d{4,}\-\d{4}/g)]),
        email: schema.string.optional({}, [rules.email()]),
      })

      await request.validate({
        schema: Schema,
      })

      const name = request.input('name')
      const phone = request.input('phone')
      const email = request.input('email')

      const user = auth.use('web').user!

      if (!!(await User.query().where('email', email).first())) {
        session.flash('error', 'Email em uso!')
        return response.redirect().back()
      }

      await user
        .merge({
          name: name,
          phone: phone,
          email: email,
        })
        .save()

      session.flash('success', 'Perfil alterado!')
      return response.redirect().back()
    } catch (e) {
      session.flash('error', e)
      return response.redirect().back()
    }
  }
}