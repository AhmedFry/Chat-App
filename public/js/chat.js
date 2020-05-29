const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('#send')
const $shareLocationButton = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')
//Template
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//option
const {username , room} = Qs.parse(location.search , {ignoreQueryPrefix:true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    $messages.scrollTop = $messages.scrollHeight
}

socket.emit('join' , {username , room},(error)=>{
    if (error){
        alert(error)
        location.href= '/'
    }
})


socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render($messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('shareLocation' ,(url)=>{
    console.log(url)
    const html = Mustache.render($locationTemplate,{
        username:url.username,
        url,
        createdAt:moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData' , ({room , users})=>{
    const html = Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
} )

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disable
    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value      //'target' is form 
    socket.emit('sendMessage' , message , (error)=>{
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        
        if (error){
            return console.log(error)
        }

        console.log('message is delivered!')
    })
})

$shareLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('your browser is not support geoloaction!')
    }

    //disable
    $shareLocationButton.setAttribute('disabled' , 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            console.log('location Shared' )
            //Enable
            $shareLocationButton.removeAttribute('disabled')
        })
        
    })
})



