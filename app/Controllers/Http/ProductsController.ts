import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Product from 'App/Models/Product'

export default class ProductsController {
  public async index({ response, view, auth, session }: HttpContextContract) {
    if (auth.user!.role !== 'ADMIN' && auth.user!.role !== 'STOCKIST') {
      session.flash('error', 'Você não tem permissão!')
      return response.redirect().back()
    }

    const products = (
      await Product.query()
        .withScopes((scopes) => scopes.accountScope(auth.user!.accountId))
        .withAggregate('stocks', (query) => {
          query.where('type', 'INCREASE').sum('quantity').as('sumStock')
        })
        .withAggregate('stocks', (query) => {
          query.where('type', 'DECREASE').sum('quantity').as('subStock')
        })
        .preload('stocks')
    ).map((product) => {
      return {
        ...product.$attributes,
        formattedPrice: product.formattedPrice,
        stocks: [...product.stocks],
        stock: product.$extras.sumStock - product.$extras.subStock,
      }
    })

    return view.render('products', {
      products: products,
    })
  }

  public async store({ request, response, auth, session }: HttpContextContract) {
    try {
      if (auth.user!.role !== 'ADMIN' && auth.user!.role !== 'STOCKIST') {
        session.flash('error', 'Você não tem permissão!')
        return response.redirect().back()
      }

      const Schema = schema.create({
        name: schema.string({}, [rules.required()]),
        price: schema.string({}, [
          rules.required(),
          rules.regex(/^(?!0\,00)[1-9]\d{0,2}(\.\d{3})*(\,\d\d)?$/),
        ]),
      })

      await request.validate({
        schema: Schema,
      })

      const name = request.input('name')
      const price = request.input('price')

      await Product.create({
        name: name,
        price: price,
        accountId: auth.use('web').user!.accountId,
      })

      session.flash('success', 'Produto cadastrado!')
      return response.redirect().back()
    } catch (e) {
      console.log(e.toString())
      session.flash('error', e)
      return response.redirect().back()
    }
  }

  public async update({ request, response, auth, params, session }: HttpContextContract) {
    try {
      if (auth.user!.role !== 'ADMIN' && auth.user!.role !== 'STOCKIST') {
        session.flash('error', 'Você não tem permissão!')
        return response.redirect().back()
      }

      const Schema = schema.create({
        name: schema.string({}, [rules.required()]),
        price: schema.string({}, [
          rules.required(),
          rules.regex(/^(?!0\,00)[1-9]\d{0,2}(\.\d{3})*(\,\d\d)?$/),
        ]),
      })

      await request.validate({
        schema: Schema,
      })

      if (!params.id) {
        session.flash('error', 'Forneça um produto!')
        return response.redirect().back()
      }

      const name = request.input('name')
      const price = request.input('price')

      const product = await Product.findOrFail(params.id)

      await product
        .merge({
          name: name,
          price: price,
        })
        .save()

      session.flash('success', 'Produto alterado!')
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
        session.flash('error', 'Forneça um produto!')
        return response.redirect().back()
      }

      const product = await Product.findOrFail(params.id)

      product.delete()

      session.flash('success', 'Produto removido!')
      return response.redirect().back()
    } catch (e) {
      console.log(e.toString())
      session.flash('error', e)
      return response.redirect().back()
    }
  }
}
