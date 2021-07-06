const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')
const board = document.getElementById('board')
const cellElements = document.querySelectorAll('[data-cell]')
const cell1 = document.getElementById('cell1')
const cell2 = document.getElementById('cell2')
const cell3 = document.getElementById('cell3')
const cell4 = document.getElementById('cell4')
const cell5 = document.getElementById('cell5')
const cell6 = document.getElementById('cell6')
const cell7 = document.getElementById('cell7')
const cell8 = document.getElementById('cell8')
const cell9 = document.getElementById('cell9')
const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]


// Game variables
let markedCells = []
let myShape = ''
let myTurn
let isGameEnded = false

// Get username and room from URL
const urlSearchParams = new URLSearchParams(window.location.search)
const { username, room } = Object.fromEntries(urlSearchParams.entries())

const socket = io()

// Join chatroom
socket.emit('joinRoom', { username, room })

// Cell Mark Click Request
cellElements.forEach(cell => {
    cell.addEventListener('click', handleClick)
})

// Cell Mark Response
socket.on('cellMarkResponse', ({ cellid, myShape }) => {
    // check if game ended
    if (!isGameEnded) {
        // put mark
        let tempcell = document.getElementById(cellid)
        tempcell.classList.add(myShape)
        // toggle turn
        myTurn = !myTurn
        hoverState(myTurn)
        markedCells.push(cellid)
        // check win
        if (checkWin(myShape)) {
            console.log('winner ' + myShape)
            // win request
        } else {
            // check draw
            if (isDraw()) {
                console.log('game draw')
                // draw request
            }
        }
    }
})

// Initiate game variables
socket.on('startgame', ({ mark, turn }) => {
    myShape = mark
    myTurn = turn
    hoverState(myTurn)
})

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room)
    outputUsers(users)
})

// Message from server
socket.on('message', message => {
    // console.log(message)
    outputMessage(message)

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
})

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // Get message text
    const msg = e.target.elements.msg.value

    // Emit message to server
    socket.emit('chatMessage', msg)

    // Clear input
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div')
    div.classList.add('message')
    const p = document.createElement('p')
    p.classList.add('meta')
    p.innerText = message.username
    p.innerHTML += `<span>${message.time}</span>`
    div.appendChild(p)
    const para = document.createElement('p')
    para.classList.add('text')
    para.innerText = message.text
    div.appendChild(para)
    document.querySelector('.chat-messages').appendChild(div)
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = ''
    users.forEach((user) => {
        const li = document.createElement('li')
        li.innerText = user.username
        userList.appendChild(li)
    })
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the game?')
    if (leaveRoom) {
        window.location = '../index.html'
    } else {
    }
})

// Game ---------------------------------------------------------------------------------

function hoverState(myTurn) {
    if (myTurn) {
        cell1.classList.remove('not-allowed')
        cell2.classList.remove('not-allowed')
        cell3.classList.remove('not-allowed')
        cell4.classList.remove('not-allowed')
        cell5.classList.remove('not-allowed')
        cell6.classList.remove('not-allowed')
        cell7.classList.remove('not-allowed')
        cell8.classList.remove('not-allowed')
        cell9.classList.remove('not-allowed')
        board.classList.add(myShape)
    } else {
        board.classList.remove(myShape)
        cell1.classList.add('not-allowed')
        cell2.classList.add('not-allowed')
        cell3.classList.add('not-allowed')
        cell4.classList.add('not-allowed')
        cell5.classList.add('not-allowed')
        cell6.classList.add('not-allowed')
        cell7.classList.add('not-allowed')
        cell8.classList.add('not-allowed')
        cell9.classList.add('not-allowed')
    }
}

function handleClick(e) {
    if (myTurn && !isGameEnded && !markedCells.includes(e.target.id)) {
        let cellid = e.target.id
        socket.emit('cellMarkRequest', { cellid, myShape })
    }
}

function checkWin(myshape) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(myshape)
        })
    })
}

function isDraw() {
    return [...cellElements].every(cell => {
        return cell.classList.contains('x') || cell.classList.contains('circle');
    });

    // Alternative option:
    // if (markedCells.length === 9) {
    //     return true
    // } else {
    //     return false
    // }
}

// Third User ---------------------------------------------------------------------------
socket.on('thirduser', (msg) => {
    window.location = `../index.html?error=${msg}`
})

// end game
// end game when disconnect
// restart