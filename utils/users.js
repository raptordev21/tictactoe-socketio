const users = []

// Join user to chat
function userJoin(id, username, room, mark, userTurn) {
    const user = { id, username, room, mark, userTurn }

    users.push(user)

    return user
}

// Get current user
function getCurrentUser(id) {
    return users.find(user => user.id === id)
}

// User leaves chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

// Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room === room)
}

// Get number of users in room
function getRoomSize(room) {
    if (users.length === 0) {
        return 0
    } else {
        let roomUsers = users.filter(user => user.room === room)
        return roomUsers.length
    }
}

// Get random mark
function getRandomMark() {
    const mark = ['x', 'circle']
    const index = Math.floor(Math.random() * 2)
    return mark[index]
}

// Toggle mark
function toggleMark(mark) {
    if (mark === 'x') {
        return 'circle'
    } else {
        return 'x'
    }
}

// Ckeck if socket id present in array
function isIdExists(id) {
    let user = users.find(user => user.id === id)
    if (user) {
        return true
    } else {
        return false
    }
}

// toggle both turns
function toggleTurns(room) {
    let bothUsers = users.filter(user => user.room === room)
    let index1 = users.findIndex((obj => obj.id == bothUsers[0].id))
    let index2 = users.findIndex((obj => obj.id == bothUsers[1].id))
    users[index1].userTurn = !users[index1].userTurn
    users[index2].userTurn = !users[index2].userTurn
}

// Get opponent name
function getOpponentName(id, room) {
    let bothUsers = users.filter(user => user.room === room)
    let opponent = bothUsers.find(user => user.id !== id)
    return opponent.username
}

// Get user by shape/mark
function getUserByMark(room, myshape) {
    let bothUsers = users.filter(user => user.room === room)
    if (bothUsers[0].mark === myshape) {
        return bothUsers[0]
    } else {
        return bothUsers[1]
    }
}

module.exports = {
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
    getUserByMark
}
