import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Stock from 'App/Models/Stock'

export default class StocksController {
  public async store({ request, response, auth, session }: HttpContextContract) {
    try {
      if (auth.user!.role !== 'ADMIN' && auth.user!.role !== 'STOCKIST') {
        session.flash('error', 'Você não tem permissão!')
        return response.redirect().back()
      }

      const Schema = schema.create({
        productId: schema.number([rules.required()]),
        type: schema.enum(['INCREASE', 'DECREASE'], [rules.required()]),
        quantity: schema.number([rules.required()]),
      })

      await request.validate({
        schema: Schema,
      })

      const productId = request.input('productId')
      const type = request.input('type')
      const quantity = request.input('quantity')

      await Stock.create({
        productId: productId,
        type: type,
        quantity: quantity,
      })

      session.flash('success', 'Estoque cadastrado!')
      return response.redirect().back()
    } catch (e) {
      console.log(e.toString())
      session.flash('error', e)
      return response.redirect().back()
    }
  }
}
