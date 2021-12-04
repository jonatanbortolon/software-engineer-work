import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Notification from 'App/Models/Notification'
import { DateTime } from 'luxon'

export default class NotificationsController {
  public async update({ response, params, session }: HttpContextContract) {
    try {
      if (!params.id) {
        session.flash('error', 'Forneça um produto!')
        return response.redirect().back()
      }
      console.log(params.id)

      const notification = await Notification.findOrFail(params.id)

      await notification
        .merge({
          readAt: DateTime.now(),
        })
        .save()

      session.flash('success', 'Notificação lida!')
      return response.redirect().back()
    } catch (e) {
      session.flash('error', e)
      return response.redirect().back()
    }
  }
}
