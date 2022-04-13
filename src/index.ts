const express = require('express')
const path = require('path')
const PORT = 3000
let activeSockets: string[] = []

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(express.static(__dirname))

io.on('connection', (socket: any) => {
  console.log('Socked connected with id: ' + socket.id)
  const existingSocket = activeSockets.find(
    (existingSocket) => existingSocket === socket.id
  )

  if (!existingSocket) {
    activeSockets.push(socket.id)

    socket.emit('update-user-list', {
      users: activeSockets.filter(
        (existingSocket) => existingSocket !== socket.id
      ),
    })

    socket.broadcast.emit('update-user-list', {
      users: [socket.id],
    })
  }
  socket.on('disconnect', () => {
    activeSockets = activeSockets.filter(
      (existingSocket) => existingSocket !== socket.id
    )
    socket.broadcast.emit('remove-user', {
      socketId: socket.id,
    })
  })
  socket.on('call-user', (data: any) => {
    socket.to(data.to).emit('call-made', {
      offer: data.offer,
      socket: socket.id,
    })
  })
  socket.on('make-answer', (data: any) => {
    socket.to(data.to).emit('answer-made', {
      socket: socket.id,
      answer: data.answer,
    })
  })
  socket.on('reject-call', (data: any) => {
    socket.to(data.from).emit('call-rejected', {
      socket: socket.id,
    })
  })
})

server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`)
})
