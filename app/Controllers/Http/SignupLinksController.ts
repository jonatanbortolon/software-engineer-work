import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import SignupLink from 'App/Models/SignupLink'
import { v4 as uuidv4 } from 'uuid'
import { DateTime } from 'luxon'

export default class SignupLinksController {
  public async store({ request, response, auth, session }: HttpContextContract) {
    try {
      if (auth.user!.role !== 'ADMIN') {
        session.flash('error', 'Você não tem permissão!')
        return response.redirect().back()
      }

      const Schema = schema.create({
        role: schema.enum(['ADMIN', 'SALESMAN', 'STOCKIST'], [rules.required()]),
      })

      await request.validate({
        schema: Schema,
      })

      const role = request.input('role')

      const link = await SignupLink.query()
        .withScopes((scope) => scope.accountScope(auth.user!.accountId))
        .orderBy('expires_at', 'desc')
        .where('expires_at', '>=', new Date())
        .whereNull('used_at')
        .first()

      if (link) {
        await link.fill({ usedAt: DateTime.now() })
      }

      await SignupLink.create({
        role,
        slug: uuidv4(),
        expiresAt: DateTime.now().plus({ minutes: 10 }),
        accountId: auth.use('web').user!.accountId,
      })

      session.flash('success', 'Link cadastrado!')
      return response.redirect().back()
    } catch (e) {
      console.log(e.toString())
      session.flash('error', e)
      return response.redirect().back()
    }
  }
}
