import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserInfo {
  public async handle({ view, auth }: HttpContextContract, next: () => Promise<void>) {
    view.share({
      user: auth.use('web').user!,
    })

    return next()
  }
}
