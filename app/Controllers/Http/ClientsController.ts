import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
export default class ClientsController {
  public async index({ response, view, auth, session }: HttpContextContract) {
    if (auth.user!.role !== 'ADMIN' && auth.user!.role !== 'SALESMAN') {
      session.flash('error', 'Você não tem permissão!')
      return response.redirect().back()
    }

    const clients = await Client.query().withScopes((scopes) =>
      scopes.accountScope(auth.user!.accountId)
    )

    return view.render('clients', {
      clients: clients,
    })
  }

  public async store({ request, response, auth, session }: HttpContextContract) {
    try {
      if (auth.user!.role !== 'ADMIN' && auth.user!.role !== 'SALESMAN') {
        session.flash('error', 'Você não tem permissão!')
        return response.redirect().back()
      }

      const Schema = schema.create({
        name: schema.string({}, [rules.required()]),
        phone: schema.string.optional({}, [rules.regex(/\(\d{2,}\) \d{4,}\-\d{4}/g)]),
        email: schema.string.optional({}, [rules.email()]),
        document: schema.string.optional({}, [rules.regex(/\d\d\d\.\d\d\d\.\d\d\d\-\d\d/g)]),
      })

      await request.validate({
        schema: Schema,
      })

      const name = request.input('name')
      const phone = request.input('phone')
      const email = request.input('email')
      const document = request.input('document')

      await Client.create({
        name: name,
        phone: phone,
        email: email,
        document: document,
        accountId: auth.use('web').user!.accountId,
      })

      session.flash('success', 'Cliente cadastrado!')
      return response.redirect().back()
    } catch (e) {
      console.log(JSON.stringify(e))
      session.flash('error', e)
      return response.redirect().back()
    }
  }

  public async update({ request, response, auth, params, session }: HttpContextContract) {
    try {
      if (auth.user!.role !== 'ADMIN' && auth.user!.role !== 'SALESMAN') {
        session.flash('error', 'Você não tem permissão!')
        return response.redirect().back()
      }

      const Schema = schema.create({
        name: schema.string({}, [rules.required()]),
        phone: schema.string.optional({}, [rules.regex(/\(\d{2,}\) \d{4,}\-\d{4}/g)]),
        email: schema.string.optional({}, [rules.email()]),
        document: schema.string.optional({}, [rules.regex(/\d\d\d\.\d\d\d\.\d\d\d\-\d\d/g)]),
      })

      await request.validate({
        schema: Schema,
      })

      if (!params.id) {
        session.flash('error', 'Forneça um cliente!')
        return response.redirect().back()
      }

      const name = request.input('name')
      const phone = request.input('phone')
      const email = request.input('email')
      const document = request.input('document')

      const client = await Client.findOrFail(params.id)

      await client
        .merge({
          name: name,
          phone: phone,
          email: email,
          document: document,
        })
        .save()

      session.flash('success', 'Cliente alterado!')
      return response.redirect().back()
    } catch (e) {
      console.log(JSON.stringify(e))
      session.flash('error', e)
      return response.redirect().back()
    }
  }

  public async delete({ response, auth, params, session }: HttpContextContract) {
    try {
      if (auth.user!.role !== 'ADMIN') {
        session.flash('error', 'Você não tem permissão!')
        return response.redirect().back()
      }

      if (!params.id) {
        session.flash('error', 'Forneça um cliente!')
        return response.redirect().back()
      }

      const client = await Client.findOrFail(params.id)

      client.delete()

      session.flash('success', 'Cliente removido!')
      return response.redirect().back()
    } catch (e) {
      console.log(JSON.stringify(e))
      session.flash('error', e)
      return response.redirect().back()
    }
  }
}
