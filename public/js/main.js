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
const restartBox = document.querySelector('.restart-box')
const restartBtn = document.getElementById('restart')
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
let myID
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
            // win request
            if (myTurn) {
                socket.emit('winRequest', myShape)
            }
        } else {
            // check draw
            if (isDraw()) {
                // draw request
                if (myTurn) {
                    socket.emit('drawRequest', 'GAME DRAW')
                }
            }
        }
    }
})

// Win Response
socket.on('winResponse', (winUsername) => {
    isGameEnded = true
    console.log(winUsername)
    restartBox.style.display = "flex"
})

// Draw Response
socket.on('drawResponse', (msg) => {
    isGameEnded = true
    console.log(msg)
    restartBox.style.display = "flex"
})

// Game Restart Response
socket.on('restartResponse', (updatedUsers) => {
    // Set game variables
    markedCells = []
    isGameEnded = false
    let usernow = updatedUsers.find(user => user.id === myID)
    myShape = usernow.mark
    myTurn = usernow.userTurn
    // Clear board and cell classes
    board.classList.remove('x')
    board.classList.remove('circle')
    cell1.classList.remove('not-allowed')
    cell2.classList.remove('not-allowed')
    cell3.classList.remove('not-allowed')
    cell4.classList.remove('not-allowed')
    cell5.classList.remove('not-allowed')
    cell6.classList.remove('not-allowed')
    cell7.classList.remove('not-allowed')
    cell8.classList.remove('not-allowed')
    cell9.classList.remove('not-allowed')
    removeCellMark()
    // Set hover state
    hoverState(myTurn)
    // hide restart button
    restartBox.style.display = "none"
})

// Initiate game variables
socket.on('startgame', ({ mark, turn, id }) => {
    myShape = mark
    myTurn = turn
    myID = id
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

// Game restart request
restartBtn.addEventListener('click', (e) => {
    e.preventDefault()
    socket.emit('restartRequest', 'restart')
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

function removeCellMark() {
    cell1.classList.remove('x') || cell1.classList.remove('circle')
    cell2.classList.remove('x') || cell2.classList.remove('circle')
    cell3.classList.remove('x') || cell3.classList.remove('circle')
    cell4.classList.remove('x') || cell4.classList.remove('circle')
    cell5.classList.remove('x') || cell5.classList.remove('circle')
    cell6.classList.remove('x') || cell6.classList.remove('circle')
    cell7.classList.remove('x') || cell7.classList.remove('circle')
    cell8.classList.remove('x') || cell8.classList.remove('circle')
    cell9.classList.remove('x') || cell9.classList.remove('circle')
}

// Third User ---------------------------------------------------------------------------
socket.on('thirduser', (msg) => {
    window.location = `../index.html?error=${msg}`
})

// end game
// end game when disconnect
// restart