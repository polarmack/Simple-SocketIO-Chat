var socket = io();

const chatContainer = document.getElementById('chat-container')
const msgForm = document.getElementById('send-container')
const msgInput = document.getElementById('chat-input')

const name = prompt('What is your name?')
appendMessage('You Joined!')
socket.emit('new-user', name)

socket.on('broadcast-chat-message',data =>{
    appendMessage(data.name+': '+data.message)
})

socket.on('user-connected', name =>{
    appendMessage(name + ' connected')
})

socket.on('user-disconnect', name =>{
    appendMessage(name + ' disconnected')
})

msgForm.addEventListener('submit', e => {
    e.preventDefault()
    const msg = msgInput.value
    appendMessage('You: '+msg)
    socket.emit('send-chat-message', msg)
    msgInput.value = ''
})

function appendMessage(msg){
    const msgElement =document.createElement('div')
    msgElement.innerText = msg
    chatContainer.append(msgElement)
}