import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserInfo {
  public async handle({ view, auth }: HttpContextContract, next: () => Promise<void>) {
    await auth.use('web').authenticate()

    view.share({
      user: auth.use('web').user!,
    })

    return next()
  }
}
