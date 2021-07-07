const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    getRoomSize,
    getRandomMark,
    toggleMark,
    isIdExists,
    toggleTurns,
    getOpponentName,
    getUserByMark,
    toggleMarkMemory
} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'Charizard Bot'

// Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        if (getRoomSize(room) < 2) {
            if (getRoomSize(room) === 0) {
                let mark = getRandomMark()
                let userTurn = true
                const user = userJoin(socket.id, username, room, mark, userTurn)

                // Create room and join user
                socket.join(user.room)

                // Welcome current user
                // Only to user who just got connected
                socket.emit('message', formatMessage(botName, `Welcome to Tic Tac Toe Game ${user.username}`))
                socket.emit('startgame', { mark: user.mark, turn: user.userTurn, id: user.id })

                // if (user.userTurn) {
                //     io.to(user.room).emit('message', formatMessage(botName, `${user.username} turn now`))
                // }

                // Broadcast when a user connects
                // Broadcast to all except user who just got connected
                socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the game`))


                // Send users and room info
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                })

            } else {
                // when room size is 1
                let users = getRoomUsers(room)
                let mark = toggleMark(users[0].mark)
                let turn = !users[0].userTurn

                const user = userJoin(socket.id, username, room, mark, turn)

                // Create room and join user
                socket.join(user.room)

                // Welcome current user
                // Only to user who just got connected
                socket.emit('message', formatMessage(botName, `Welcome to Tic Tac Toe Game ${user.username}`))
                socket.emit('startgame', { mark: user.mark, turn: user.userTurn, id: user.id })

                // Broadcast when a user connects
                // Broadcast to all except user who just got connected
                socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the game`))

                if (user.userTurn) {
                    io.to(user.room).emit('message', formatMessage(botName, `${user.username} turn now`))
                }
                if (users[0].userTurn) {
                    io.to(user.room).emit('message', formatMessage(botName, `${users[0].username} turn now`))
                }

                // Send users and room info
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                })

            }
        } else {
            // Room size is 2 or greater
            console.log('room is full')
            socket.emit('thirduser', `Sorry ${room} Room is Full`)

        }
    })

    // Broadcast to all connections
    // io.emit()

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        // Check if socket id exists in memory
        if (isIdExists(socket.id)) {
            const user = getCurrentUser(socket.id)
            io.to(user.room).emit('message', formatMessage(user.username, msg))
        } else {
            console.log('third user')
        }
    })

    // Listen for cell mark request
    socket.on('cellMarkRequest', ({ cellid, myShape }) => {
        // Check if socket id exists in memory
        if (isIdExists(socket.id)) {
            const user = getCurrentUser(socket.id)
            // check if 2 people in room
            if (getRoomSize(user.room) == 2) {
                // toggle both turns
                toggleTurns(user.room)
                // Send cell mark response
                io.to(user.room).emit('cellMarkResponse', { cellid, myShape })
                // Send turn message
                let opponentName = getOpponentName(user.id, user.room)
                io.to(user.room).emit('message', formatMessage(botName, `${opponentName} turn now`))
            } else {
                io.to(user.room).emit('message', formatMessage(botName, `${user.room} room have only 1 player, please wait until other player joins`))
            }
        } else {
            console.log('third user')
        }
    })

    // Listen for win request
    socket.on('winRequest', (myShape) => {
        // Check if socket id exists in memory
        if (isIdExists(socket.id)) {
            const user = getCurrentUser(socket.id)
            // check if 2 people in room
            if (getRoomSize(user.room) == 2) {
                // Send win response
                let winUser = getUserByMark(user.room, myShape)
                io.to(user.room).emit('winResponse', winUser.username)
                // Send win message
                io.to(winUser.room).emit('message', formatMessage(botName, `${winUser.username} WON`))
            } else {
                io.to(user.room).emit('message', formatMessage(botName, `${user.room} room have only 1 player, please wait until other player joins`))
            }
        } else {
            console.log('third user')
        }
    })

    // Listen for draw request
    socket.on('drawRequest', (msg) => {
        // Check if socket id exists in memory
        if (isIdExists(socket.id)) {
            const user = getCurrentUser(socket.id)
            // check if 2 people in room
            if (getRoomSize(user.room) == 2) {
                // Send draw response
                io.to(user.room).emit('drawResponse', msg)
                // Send draw message
                io.to(user.room).emit('message', formatMessage(botName, msg))
            } else {
                io.to(user.room).emit('message', formatMessage(botName, `${user.room} room have only 1 player, please wait until other player joins`))
            }
        } else {
            console.log('third user')
        }
    })

    // Listen for restart request
    socket.on('restartRequest', (msg) => {
        // Check if socket id exists in memory
        if (isIdExists(socket.id)) {
            const user = getCurrentUser(socket.id)
            // check if 2 people in room
            if (getRoomSize(user.room) == 2) {
                // toggle shape/mark
                toggleMarkMemory(user.room)
                // toggle turn
                toggleTurns(user.room)
                // send restart response
                let updatedUsers = getRoomUsers(user.room)
                io.to(user.room).emit('restartResponse', updatedUsers)
                // send restart message
                socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} wants to play again`))
                console.log(msg)
            } else {
                io.to(user.room).emit('message', formatMessage(botName, `${user.room} room have only 1 player, please wait until other player joins`))
            }
        } else {
            console.log('third user')
        }
    })

    // Runs when client disconnects
    socket.on('disconnect', () => {
        if (isIdExists(socket.id)) {
            const user = userLeave(socket.id)

            if (user) {
                io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the game`))
            }

            // send game ended response
            io.to(user.room).emit('drawResponse', 'user left')

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        } else {
            console.log('third user')
        }
    })

})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})