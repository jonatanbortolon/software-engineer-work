import Message from 'App/Models/Message'
import Notification from 'App/Models/Notification'
import User from 'App/Models/User'
import Ws from 'App/Services/Ws'
import { DateTime } from 'luxon'

Ws.boot()

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {
  //Setup Route
  socket.on('setup', (data: { room: number; id: number }) => {
    socket.join(String(data.room))

    Ws.usersOnline[data.id] = socket
  })

  //Message Route
  socket.on(
    'message',
    async (data: {
      room: number
      message: { from: number; message: string; mentions: Array<number> }
    }) => {
      try {
        const rawFrom = await (
          await User.query().where('id', data.message.from).firstOrFail()
        ).serialize()

        const from = { id: rawFrom.id, name: rawFrom.name, slug: rawFrom.chatSlug }

        const date = DateTime.now()

        const message = {
          message: data.message.message,
          from: from,
          date: date.setLocale('pt-BR').toFormat("dd 'de' LLL 'de' yyyy 'as' HH:mm"),
        }

        await Message.create({
          text: message.message,
          userId: from.id,
        })

        for await (const id of data.message.mentions) {
          const user = await User.find(id)

          if (user) {
            const notification = await Notification.create({
              title: `${from.name} mencionou você no chat!`,
              userId: user.id,
            })

            if (Ws.usersOnline[user.id]) {
              Ws.usersOnline[user.id].emit('notification', notification)
            }
          }
        }

        Ws.io.to(String(data.room)).emit('message', message)
      } catch (e) {
        socket.emit('error', e.toString())
      }
    }
  )
})
