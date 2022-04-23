const express = require('express')
const path = require('path')
const app = express()
const server = require('http').createServer(app)
const port = process.env.PORT || 3000
const io = require('socket.io')(server)
const users = []

app.get('/chat.html', (req, res) => {
    let username = req.query.username
    if (userExists(username)) {
        res.sendFile(__dirname + '/public/index.html')
    } else {
        res.sendFile(__dirname + '/public/chat.html')
    }
    console.log(users)
})

app.get('/users', (req, res) => {
    return getUsernames()
})

app.use(express.static(path.join(__dirname + '/public')))
app.use('/editor', express.static('node_modules/tinymce'))

// just to test the server
io.on('connection', socket => {
    console.log('Some client connected')

    socket.on('chat', text => {
        let sender = getUser(socket.id)
        io.emit('chat', {text, sender})
    })

    socket.on('joined', username => {
        addUser(username, socket.id)
        io.emit('joined', {username, users})
        console.log(users)
    })

    socket.on("disconnect", () => {
        let user = getUser(socket.id)
        removeUser(user)
        io.emit('left', {user, users})
    })

    socket.on("typing", () => {
        let user = getUser(socket.id)
        socket.broadcast.emit("typing", user)
    })
})

server.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})

function addUser(username, id) {
    users.push({username, id})
}

function getUser(id) {
    return users.find(user => user.id === id);
}

function userExists(username) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].username === username) {
            return true;
        }
    }
    return false;
}

function removeUser(username) {
    const index = users.findIndex(user => user === username)

    if (index !== -1) {
        users.splice(index, 1)
    }
}

function getUsernames() {
    let usernames = []
    for (let i = 0; i < users.length; i++) {
        usernames.push(users[i].username)
    }
    return usernames;
}
