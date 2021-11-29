import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Client from 'App/Models/Client'
import Product from 'App/Models/Product'
import Sale from 'App/Models/Sale'
import Stock from 'App/Models/Stock'

export default class SalesController {
  public async index({ view, auth }: HttpContextContract) {
    const sales = await Sale.query()
      .withScopes((scopes) => scopes.accountScope(auth.user!.accountId))
      .preload('client')
      .preload('products')
      .preload('salesman')

    let salesFormatted: any[] = []

    for (const sale of sales) {
      let productsHandler = [
        ...sale.products.map((product) => ({ ...product.$attributes, ...product.$extras })),
      ]

      salesFormatted.push({
        ...sale.$attributes,
        salesman: sale.salesman.$attributes,
        client: sale.client.$attributes,
        total: sale.$extras.formattedTotal,
        payment: sale.payment,
        formattedPayment: sale.formattedPayment,
        products: productsHandler.map((product) => {
          let productHandler: any = { ...product }

          productHandler.quantity = product.pivot_quantity

          return productHandler
        }),
      })
    }

    const clients = await Client.query().withScopes((scopes) =>
      scopes.accountScope(auth.user!.accountId)
    )

    const products = (
      await Product.query()
        .withScopes((scopes) => scopes.accountScope(auth.user!.accountId))
        .withAggregate('stocks', (query) => {
          query.where('type', 'INCREASE').sum('quantity').as('sumStock')
        })
        .withAggregate('stocks', (query) => {
          query.where('type', 'DECREASE').sum('quantity').as('subStock')
        })
    ).map((product) => {
      return {
        ...product.$attributes,
        formattedPrice: product.formattedPrice,
        stock: product.$extras.sumStock - product.$extras.subStock,
      }
    })

    return view.render('sales', {
      sales: salesFormatted,
      clients: clients,
      products: products,
    })
  }

  public async store({ request, response, auth, session }: HttpContextContract) {
    try {
      if (auth.user!.role !== 'ADMIN' && auth.user!.role !== 'SALESMAN') {
        session.flash('error', 'Você não tem permissão!')
        return response.redirect().back()
      }

      const Schema = schema.create({
        payment: schema.enum(['M', 'DC', 'CC'], [rules.required()]),
        createClient: schema.boolean(),
        clientId: schema.string.optional({}, [
          rules.requiredWhen('createClient', '=', false),
          rules.regex(/^$|^\d+$/g),
        ]),
        client: schema.object.optional([rules.requiredWhen('createClient', '=', true)]).members({
          name: schema.string.optional({}, [rules.requiredWhen('createClient', '=', true)]),
          phone: schema.string.optional({}, [rules.regex(/\(\d{2,}\) \d{4,}\-\d{4}/g)]),
          email: schema.string.optional({}, [rules.email()]),
          document: schema.string.optional({}, [rules.regex(/\d\d\d\.\d\d\d\.\d\d\d\-\d\d/g)]),
        }),
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

      const createClient = request.input('createClient') === 'true'
      const client = request.input('client')

      const payment = request.input('payment')
      const clientId = request.input('clientId')
      const products = request.input('products')

      const salesman = auth.use('web').user!.id

      let createdClientId: number | null = null

      if (createClient) {
        const clientHandler = await Client.create({
          ...client,
          accountId: auth.use('web').user!.accountId,
        })

        createdClientId = clientHandler.id
      }

      const sale = await Sale.create({
        payment: payment,
        clientId: createClient ? createdClientId : clientId,
        accountId: auth.use('web').user!.accountId,
        salesmanId: salesman,
      })

      await sale
        .related('products')
        .attach(
          products.reduce(
            (carry, product) => ((carry[product.id] = { quantity: product.quantity }), carry),
            {}
          )
        )

      await Stock.createMany(
        products.map((product) => ({
          productId: product.id,
          type: 'DECREASE',
          quantity: product.quantity,
        }))
      )

      session.flash('success', 'Venda cadastrada!')
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
        payment: schema.enum(['M', 'DC', 'CC'], [rules.required()]),
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
        session.flash('error', 'Forneça uma venda!')
        return response.redirect().back()
      }

      const payment = request.input('payment')
      const clientId = request.input('clientId')
      const products = request.input('products')

      const sale = await Sale.findOrFail(params.id)

      await sale
        .merge({
          payment: payment,
          clientId: clientId,
        })
        .save()

      await sale
        .related('products')
        .sync(
          products.reduce(
            (carry, product) => ((carry[product.id] = { quantity: product.quantity }), carry),
            {}
          )
        )

      session.flash('success', 'Venda alterada!')
      return response.redirect().back()
    } catch (e) {
      console.log(e.toString())
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
        session.flash('error', 'Forneça uma venda!')
        return response.redirect().back()
      }

      const sale = await Sale.findOrFail(params.id)

      sale.delete()

      session.flash('success', 'Venda removida!')
      return response.redirect().back()
    } catch (e) {
      console.log(JSON.stringify(e))
      session.flash('error', e)
      return response.redirect().back()
    }
  }
}
