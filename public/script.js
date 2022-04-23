const socket = io()
const chat = document.querySelector('.chat-form')
const Input = document.querySelector('.chat-input')
const chatWindow = document.querySelector('.chat-window')
const submit = document.getElementById("submit")
const usersTyping = []

const { username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

socket.emit('joined', username)

tinymce.init({
  selector: '#editor',
  branding: false,
  plugins: "autoresize link lists emoticons image code codesample",
  skin_url: "/custom/skins/ui",
  content_css: "/custom/skins/content/content.css",
  menubar: false,
  statusbar: false,
  autoresize_bottom_margin: 0,
  max_height: 500,
  placeholder: "Chat comes here...",
  toolbar1: "bold italic strikethrough | link | numlist bullist | blockquote | code codesample | mySendButton",
  toolbar2: "image | emoticons",
  setup: function(editor) {
    editor.on('keyPress', function(e) {
      socket.emit('typing');
    })
  }
})

submit.addEventListener('click', () => {
  socket.emit('chat', tinymce.activeEditor.getContent())
  tinymce.activeEditor.resetContent()
})

socket.on('chat', message => {
    if (usersTyping.findIndex(obj => obj.username === message.sender.username) >= 0) {
      removeTyping(message.sender.username)
    }
    renderMessage(message)
    chatWindow.scrollTop = chatWindow.scrollHeight;
})

socket.on('joined', message => {
  renderJoinedUser(message.username)
  renderActiveUsers(message.users)
  chatWindow.scrollTop = chatWindow.scrollHeight;
})

socket.on('left', message => {
  renderLeftUser(message.user.username)
  renderActiveUsers(message.users)
  chatWindow.scrollTop = chatWindow.scrollHeight;
})

socket.on('typing', message => {
  renderTyping(message.username);
  chatWindow.scrollTop = chatWindow.scrollHeight;
})

function renderTyping(username) {
  const inUsersTyping = usersTyping.filter(obj => {
    return obj.username === username
  })

  if (inUsersTyping.length > 0) {
    clearTimeout(inUsersTyping[0].timeout)
    inUsersTyping[0].timeout = setTimeout(() => {
      removeTyping(username)
    }, "2000")
  } else {
    renderInfoTyping(username + " is typing...", username)
    const timeout = setTimeout(() => {
      removeTyping(username)
    }, "2000")
    usersTyping.push({username, timeout})
  }
}

function removeTyping(username) {
  const div = document.getElementById(username)
  const index = usersTyping.findIndex(obj => obj.username === username)
  clearTimeout(usersTyping[index].timeout)
  usersTyping.splice(index, 1)
  div.remove();
}

const renderJoinedUser = joinedUser => {
  renderInfo(joinedUser + " has joined the chat")
}

function renderLeftUser(leftUser) {
  renderInfo(leftUser + " has left the chat")
}

function renderActiveUsers(users) {
  const usersDiv = document.getElementById("usersList");
  let userHTML = "";
  for (var i = 0; i < users.length; i++) {
    userHTML += `<p>${users[i].username}</p>`
  }
  usersDiv.innerHTML = userHTML;
}

const renderMessage = message => {
  const div = document.createElement('div');
  div.classList.add('render-message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.sender.username;
  div.appendChild(p);

  const range = document.createRange();
  const parsedMessage = range.createContextualFragment(message.text);
  div.appendChild(parsedMessage)
  chatWindow.appendChild(div)
}

const renderInfo = message => {
  const range = document.createRange();
  const parsedMessage = range.createContextualFragment(message);
  const div = document.createElement('div')
  div.classList.add('info-message')
  div.appendChild(parsedMessage)
  chatWindow.appendChild(div)
}

const renderInfoTyping = (message, username) => {
  const range = document.createRange();
  const parsedMessage = range.createContextualFragment(message);
  const div = document.createElement('div')
  div.classList.add('typing-message')
  div.id = username
  div.appendChild(parsedMessage)
  chatWindow.appendChild(div)
}
