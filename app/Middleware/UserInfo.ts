import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message'
import Notification from 'App/Models/Notification'

export default class UserInfo {
  public async handle({ view, auth }: HttpContextContract, next: () => Promise<void>) {
    const authUser = auth.use('web').user!
    await authUser.load('account', (query) => query.preload('users'))

    const messages = await Message.query()
      .orderBy('messages.created_at')
      .withScopes((scopes) => scopes.accountScope(authUser.accountId))
      .preload('user')

    view.share({
      user: auth.use('web').user!,
      chat:
        messages.map((message) => ({
          from: message.user,
          message: message.text,
          date: message.createdAt.setLocale('pt-BR').toFormat("dd 'de' LLL 'de' yyyy 'as' HH:mm"),
        })) ?? [],
      usersMention:
        authUser.account.users
          .filter((user) => user.id !== authUser.id)
          .map((user) => ({
            id: user.id,
            name: user.name,
            slug: user.chatSlug,
          })) ?? [],
      notifications:
        (await Notification.query().withScopes((scopes) => {
          scopes.userScope(authUser.id)
          scopes.unreadScope()
        })) ?? [],
    })

    return next()
  }
}
