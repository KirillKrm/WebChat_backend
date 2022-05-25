import express from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

const PORT = process.env.PORT || 3001
const HOSTNAME = 'localhost'
let activeSockets: string[] = []

app.get('/', (req, res) => {
  res.send('Server is running.')
})

type MakeUserData = {
  offer: 'offer'
  answer: 'answer'
  to: string
  from: string
}

io.on('connection', (socket: any) => {
  console.log('Client connected with ID: ' + socket.id)
  socket.emit('status', 'Socket was connected')

  const existingSocket = activeSockets.find(
    (existingSocket: any) => existingSocket === socket.id
  )

  if (!existingSocket) {
    activeSockets.push(socket.id)

    socket.emit('update-user-list', {
      users: activeSockets.filter(
        (existingSocket: any) => existingSocket !== socket.id
      ),
    })

    socket.broadcast.emit('update-user-list', {
      users: [socket.id],
    })
  }

  socket.on('create-room', (userName: string, socketID: string) => {
    const roomID = Math.random().toString(32).substring(2)
    socket.join(roomID)
    console.log(userName, socketID, 'connected to', roomID)
    socket.to(roomID).emit('update-room', userName, socketID, roomID)
  })

  socket.on(
    'connect-room',
    (userName: string, socketID: string, roomID: string) => {
      socket.join(roomID)
      socket.to(roomID).emit('user-connected', userName, socketID)
    }
  )

  socket.on('disconnect', () => {
    socket.leave()
    console.log('Socket', socket.id, 'disconnected.')
  })
})

server.listen(PORT, () => {
  console.log(`Server is listening on http://${HOSTNAME}:${PORT}`)
})
