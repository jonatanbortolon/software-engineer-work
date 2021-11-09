import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class ClientsController {
  public async index({ view, auth }: HttpContextContract) {
    const clients = await Client.query().withScopes((scopes) => scopes.userScope(auth.user!.id))

    return view.render('clients', {
      clients: clients,
    })
  }

  public async store({ request, response, auth }: HttpContextContract) {
    try {
      const Schema = schema.create({
        name: schema.string({}, [rules.required()]),
        phone: schema.string({}, [rules.required()]),
        email: schema.string({}, [rules.required(), rules.email()]),
      })

      await request.validate({
        schema: Schema,
      })

      const name = request.input('name')
      const phone = request.input('phone')
      const email = request.input('email')

      await Client.create({
        name: name,
        phone: phone,
        email: email,
        userId: auth.use('web').user!.id,
      })

      return response.redirect().back()
    } catch (e) {
      return response.redirect().back()
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    try {
      const Schema = schema.create({
        name: schema.string({}, [rules.required()]),
        phone: schema.string({}, [rules.required()]),
        email: schema.string({}, [rules.required(), rules.email()]),
      })

      await request.validate({
        schema: Schema,
      })

      if (!params.id) {
        return response.redirect().back()
      }

      const name = request.input('name')
      const phone = request.input('phone')
      const email = request.input('email')

      const client = await Client.findOrFail(params.id)

      await client
        .merge({
          name: name,
          phone: phone,
          email: email,
        })
        .save()

      return response.redirect().back()
    } catch (e) {
      console.log(e)
      return response.redirect().back()
    }
  }

  public async delete({ response, params }: HttpContextContract) {
    try {
      if (!params.id) {
        return response.redirect().back()
      }

      const client = await Client.findOrFail(params.id)

      client.delete()

      return response.redirect().back()
    } catch (e) {
      return response.redirect().back()
    }
  }
}
