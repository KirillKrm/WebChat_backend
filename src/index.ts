import express from 'express'
import socketIO from 'socket.io'
import http from 'http'

const PORT = 3000

const app: express.Application = express()
const httpServer: http.Server = http.createServer(app)
const io = new socketIO.Server(httpServer)

app.get('/', (req, res) => {
  res.send(`<h1>Hello World</h1>`)
})

io.on('connection', (socket) => {
  console.log('Socket connected.')
})

httpServer.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`)
})
