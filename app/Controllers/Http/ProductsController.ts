import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Product from 'App/Models/Product'

export default class ProductsController {
  public async index({ view, auth }: HttpContextContract) {
    const products = await Product.query().withScopes((scopes) => scopes.userScope(auth.user!.id))

    return view.render('products', {
      products: products,
    })
  }

  public async store({ request, response, auth }: HttpContextContract) {
    try {
      const Schema = schema.create({
        name: schema.string({}, [rules.required()]),
        stock: schema.number([rules.required()]),
        price: schema.number([rules.required()]),
      })

      await request.validate({
        schema: Schema,
      })

      const name = request.input('name')
      const stock = request.input('stock')
      const price = request.input('price')

      await Product.create({
        name: name,
        stock: stock,
        price: price,
        userId: auth.use('web').user!.id,
      })

      return response.redirect().back()
    } catch (e) {
      console.log(e)

      return response.redirect().back()
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    try {
      const Schema = schema.create({
        name: schema.string({}, [rules.required()]),
        stock: schema.number([rules.required()]),
        price: schema.number([rules.required()]),
      })

      await request.validate({
        schema: Schema,
      })

      if (!params.id) {
        return response.redirect().back()
      }

      const name = request.input('name')
      const stock = request.input('stock')
      const price = request.input('price')

      const product = await Product.findOrFail(params.id)

      await product
        .merge({
          name: name,
          stock: stock,
          price: price,
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

      const product = await Product.findOrFail(params.id)

      product.delete()

      return response.redirect().back()
    } catch (e) {
      return response.redirect().back()
    }
  }
}
