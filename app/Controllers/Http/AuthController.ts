import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

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
          'email.required': 'O campo email é obrigatório',
          'password.required': 'O campo senha é obrigatório',
        },
      })

      const email = request.input('email')
      const password = request.input('password')

      await auth.use('web').attempt(email, password)

      return response.redirect().toRoute('dashboard')
    } catch (e) {
      console.log(e)
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

      await User.create({
        name,
        email,
        password,
      })

      await auth.use('web').attempt(email, password)

      return response.redirect().toRoute('dashboard')
    } catch (e) {
      console.log(e)
      session.flash('errors', e.messages)

      return response.redirect().back()
    }
  }

  public async signoutGet({ response, auth }: HttpContextContract) {
    await auth.use('web').logout()
    response.redirect('/entrar')
  }
}
