import { Server } from 'socket.io'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function handler(req: any, res: any) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', (socket) => {
      socket.on('join-tournament', (tournamentId) => {
        socket.join(`tournament-${tournamentId}`)
      })

      socket.on('send-message', (data) => {
        socket.to(`tournament-${data.tournamentId}`).emit('chat-message', {
          user: data.userId,
          text: data.text,
          time: data.time
        })
      })
    })
  }
  res.end()
}
