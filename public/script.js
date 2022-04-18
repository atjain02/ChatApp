const socket = io()
const chat = document.querySelector('.chat-form')
const Input = document.querySelector('.chat-input')
const chatWindow = document.querySelector('.chat-window')
const submit = document.getElementById("submit")

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
})

submit.addEventListener('click', () => {
  socket.emit('chat', tinymce.activeEditor.getContent())
  tinymce.activeEditor.resetContent()
})

/*
chat.addEventListener('submit', event => {
  event.preventDefault()
  socket.emit('chat', Input.value)
  Input.value = ''
})
*/

socket.on('chat', message => {
    renderMessage(message)
})

socket.on('joined', message => {
  renderJoinedUser(message.username)
  renderActiveUsers(message.users)
})

socket.on('left', message => {
  renderLeftUser(message.user.username)
  renderActiveUsers(message.users)
})

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
