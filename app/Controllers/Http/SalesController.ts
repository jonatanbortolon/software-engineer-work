import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Client from 'App/Models/Client'
import Product from 'App/Models/Product'
import Sale from 'App/Models/Sale'
import { DateTime } from 'luxon'

export default class SalesController {
  public async index({ view, auth }: HttpContextContract) {
    const sales = await Sale.query()
      .withScopes((scopes) => scopes.userScope(auth.user!.id))
      .preload('client')
      .preload('products')

    let salesFormated: any[] = []

    for (const sale of sales) {
      let productsHandler = [
        ...sale.products.map((product) => ({ ...product.$attributes, ...product.$extras })),
      ]

      salesFormated.push({
        ...sale.$attributes,
        client: sale.client.$attributes,
        products: productsHandler.map((product) => {
          let productHandler: any = { ...product }

          productHandler.quantity = product.pivot_quantity

          return productHandler
        }),
      })
    }

    const clients = await Client.query().withScopes((scopes) => scopes.userScope(auth.user!.id))
    const products = await Product.query().withScopes((scopes) => scopes.userScope(auth.user!.id))

    return view.render('sales', {
      sales: salesFormated,
      clients: clients,
      products: products,
    })
  }

  public async store({ request, response, auth }: HttpContextContract) {
    try {
      const Schema = schema.create({
        paidAt: schema.boolean(),
        clientId: schema.number([rules.required()]),
        products: schema.array([rules.required(), rules.minLength(0)]).members(
          schema.object().members({
            id: schema.number([rules.required()]),
            quantity: schema.number([rules.required()]),
          })
        ),
      })

      await request.validate({
        schema: Schema,
      })

      const paidAt = request.input('paidAt')
      const clientId = request.input('clientId')
      const products = request.input('products')

      const sale = await Sale.create({
        paidAt: paidAt ? DateTime.now() : undefined,
        clientId: clientId,
        userId: auth.use('web').user!.id,
      })

      await sale
        .related('products')
        .attach(
          products.reduce(
            (carry, product) => ((carry[product.id] = { quantity: product.quantity }), carry),
            {}
          )
        )

      return response.redirect().back()
    } catch (e) {
      console.log(e)
      return response.redirect().back()
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    try {
      const Schema = schema.create({
        paidAt: schema.boolean(),
        clientId: schema.number([rules.required()]),
        products: schema.array([rules.required(), rules.minLength(0)]).members(
          schema.object().members({
            id: schema.number([rules.required()]),
            quantity: schema.number([rules.required()]),
          })
        ),
      })

      await request.validate({
        schema: Schema,
      })

      if (!params.id) {
        return response.redirect().back()
      }

      const paidAt = request.input('paidAt')
      const clientId = request.input('clientId')
      const products = request.input('products')

      const sale = await Sale.findOrFail(params.id)

      await sale
        .merge({
          paidAt: paidAt ? DateTime.now() : undefined,
          clientId: clientId,
        })
        .save()

      await sale
        .related('products')
        .attach(
          products.reduce(
            (carry, product) => ((carry[product.id] = { quantity: product.quantity }), carry),
            {}
          )
        )

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

      const sale = await Sale.findOrFail(params.id)

      sale.delete()

      return response.redirect().back()
    } catch (e) {
      return response.redirect().back()
    }
  }
}
