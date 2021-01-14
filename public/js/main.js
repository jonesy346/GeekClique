const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const modalBody = document.querySelector('.modal-body');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const mostLikedMessages = document.getElementById('mostLikedMessages');
const smartestMessages = document.getElementById('smartestMessages');
const funniestMessages = document.getElementById('funniestMessages');
const changeChatButton = document.getElementById('change-chat-button');

const { username, roomOptions, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, roomOptions, room });

// Get a room and users
socket.on('roomUsers', ({ room, users }) => {
    console.log(room);
    outputRoomName(room);
    outputUsers(users);
});

// TOP RATINGS MODAL

// Update rating based on onclick event
const updateRating = e => {
    const messageId = e.target.parentElement.parentElement.dataset.messageId;
    const classList = e.target.classList;
    const isClicked = classList.contains("active");
    
    if (classList.contains("img-heart")) {
        socket.emit("updateRating", { _id: messageId, status: "likes", isClicked: isClicked });
    } else if (classList.contains("img-einstein")) {
        socket.emit("updateRating", { _id: messageId, status: "smarts", isClicked: isClicked});
    } else if (classList.contains("img-laugh")) {
        socket.emit("updateRating", { _id: messageId, status: "laughs", isClicked: isClicked});
    }

    if (!isClicked) {
        e.target.nextElementSibling.innerHTML = Number(e.target.nextElementSibling.innerHTML) + 1;
    } else if (isClicked) {
        e.target.nextElementSibling.innerHTML = Number(e.target.nextElementSibling.innerHTML) - 1;
    }

    if (e.target.nextElementSibling.innerHTML == 0) {
        e.target.nextElementSibling.setAttribute("style", "display: none;");
    } else {
        e.target.nextElementSibling.removeAttribute("style");
    }

    classList.toggle("active");
};

const updateRatingFromChat = e => {  
    updateRating(e);

    // update all ratings in modal body  
    let status;

    const ratingClassList = e.target.classList;
    if (ratingClassList.contains("img-heart")) {
        status = "img-heart";
    } else if (ratingClassList.contains("img-einstein")) {
        status = "img-einstein";
    } else if (ratingClassList.contains("img-laugh")) {
        status = "img-laugh";
    }

    const messageId = e.target.parentElement.parentElement.dataset.messageId;    
    const chatMessages = modalBody.querySelectorAll("[data-message-id='" + messageId + "']");    
    const chatMessageRatings = [];
    
    chatMessages.forEach(msg => {
        chatMessageRatings.push(msg.querySelector("." + status));
    });
    
    const classList = chatMessageRatings[0].classList;
    const isClicked = classList.contains("active");

    chatMessageRatings.forEach(chatMessageRating => {
        if (!isClicked) {
            chatMessageRating.nextElementSibling.innerHTML = Number(chatMessageRating.nextElementSibling.innerHTML) + 1;
        } else if (isClicked) {
            chatMessageRating.nextElementSibling.innerHTML = Number(chatMessageRating.nextElementSibling.innerHTML) - 1;
        }
    
        if (chatMessageRating.nextElementSibling.innerHTML == 0) {
            chatMessageRating.nextElementSibling.setAttribute("style", "display: none;");
        } else {
            chatMessageRating.nextElementSibling.removeAttribute("style");
        }

        chatMessageRating.classList.toggle("active");
    });

};

const updateRatingFromRatings = e => {    
    // update rating in chat form
    let status;

    const ratingClassList = e.target.classList;
    if (ratingClassList.contains("img-heart")) {
        status = "img-heart";
    } else if (ratingClassList.contains("img-einstein")) {
        status = "img-einstein";
    } else if (ratingClassList.contains("img-laugh")) {
        status = "img-laugh";
    }

    const messageId = e.target.parentElement.parentElement.dataset.messageId;    
    const chatMessage = chatMessages.querySelector("[data-message-id='" + messageId + "']");
    const isClicked = ratingClassList.contains("active");
    const chatMessageRating = chatMessage.querySelector("." + status);

    if (ratingClassList.contains("img-heart")) {
        socket.emit("updateRating", { _id: messageId, status: "likes", isClicked: isClicked });
    } else if (ratingClassList.contains("img-einstein")) {
        socket.emit("updateRating", { _id: messageId, status: "smarts", isClicked: isClicked});
    } else if (ratingClassList.contains("img-laugh")) {
        socket.emit("updateRating", { _id: messageId, status: "laughs", isClicked: isClicked});
    }

    if (!isClicked) {
        chatMessageRating.nextElementSibling.innerHTML = Number(chatMessageRating.nextElementSibling.innerHTML) + 1;
    } else if (isClicked) {
        chatMessageRating.nextElementSibling.innerHTML = Number(chatMessageRating.nextElementSibling.innerHTML) - 1;
    }

    if (chatMessageRating.nextElementSibling.innerHTML == 0) {
        chatMessageRating.nextElementSibling.setAttribute("style", "display: none;");
    } else {
        chatMessageRating.nextElementSibling.removeAttribute("style");
    }

    chatMessageRating.classList.toggle("active");

    // update rating in ratings form
    const ratedChatMessages = modalBody.querySelectorAll("[data-message-id='" + messageId + "']");
    const chatMessageRatings = [];
    
    ratedChatMessages.forEach(msg => {
        chatMessageRatings.push(msg.querySelector("." + status));
    });

    chatMessageRatings.forEach(rating => {
        if (!isClicked) {
            rating.nextElementSibling.innerHTML = Number(rating.nextElementSibling.innerHTML) + 1;
        } else if (isClicked) {
            rating.nextElementSibling.innerHTML = Number(rating.nextElementSibling.innerHTML) - 1;
        }
    
        if (rating.nextElementSibling.innerHTML == 0) {
            rating.nextElementSibling.setAttribute("style", "display: none;");
        } else {
            rating.nextElementSibling.removeAttribute("style");
        }

        rating.classList.toggle("active");
    });
  
};

const changeUsername = e => {
    const inputUsername = document.getElementById('input-username');
    const createUsername = document.getElementById('create-username');

    if (e.target.id === 'keep-username-button') {
        createUsername.removeAttribute('style');
        inputUsername.setAttribute("value", `${username}`);
    } else if (e.target.id === 'change-username-button') {
        createUsername.removeAttribute('style');
        inputUsername.setAttribute("placeholder", "Enter new username...");
        inputUsername.setAttribute("value", "");
    } 

};

// MODAL CHANGE ROOM FUNCTIONS
const changeUsernameToggles = document.querySelectorAll('input[name="username-change"]');
changeUsernameToggles.forEach(button => {
    button.addEventListener('click', changeUsername);
});



// Output a messsage from server
const showMessage = message => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.setAttribute('data-message-id', `${message._id}`);
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>
    <span class="img-container">
        <img src="../images/heart.png" alt="img-heart" class="img-heart">
        <span class="counter-heart">${message.likes}</span>
        <img src="../images/einstein.png" alt="img-einstein" class="img-einstein">
        <span class="counter-einstein">${message.smarts}</span>
        <img src="../images/laugh.png" alt="img-laugh" class="img-laugh">
        <span class="counter-laugh">${message.laughs}</span>
    </span>`;
    div.querySelectorAll("span img").forEach(element => {element.addEventListener("click", updateRatingFromChat)});
    if (message.likes === 0) {
        div.querySelector(".counter-heart").setAttribute("style", "display: none;");
    } 
    if (message.smarts === 0) {
        div.querySelector(".counter-einstein").setAttribute("style", "display: none;");
    } 
    if (message.laughs === 0) {
        div.querySelector(".counter-laugh").setAttribute("style", "display: none;");
    } 
    chatMessages.append(div);
};

const showRatedMessage = (status, message) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.setAttribute('data-message-id', `${message._id}`);
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>
    <span class="img-container">
        <img src="../images/heart.png" alt="img-heart" class="img-heart">
        <span class="counter-heart">${message.likes}</span>
        <img src="../images/einstein.png" alt="img-einstein" class="img-einstein">
        <span class="counter-einstein">${message.smarts}</span>
        <img src="../images/laugh.png" alt="img-laugh" class="img-laugh">
        <span class="counter-laugh">${message.laughs}</span>
    </span>`;
    div.querySelectorAll("span img").forEach(element => {element.addEventListener("click", updateRatingFromRatings)});
    if (message.likes === 0) {
        div.querySelector(".counter-heart").setAttribute("style", "display: none;");
    } 
    if (message.smarts === 0) {
        div.querySelector(".counter-einstein").setAttribute("style", "display: none;");
    } 
    if (message.laughs === 0) {
        div.querySelector(".counter-laugh").setAttribute("style", "display: none;");
    } 

    if (status === 'likes') {
        mostLikedMessages.append(div);
    } else if (status === 'smarts') {
        smartestMessages.append(div);
    } else if (status === 'laughs') {
        funniestMessages.append(div);
    }
}

const showAdminMessage = message => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    chatMessages.append(div);
};

// Buttons
const openModalButtons = document.querySelectorAll('[data-modal-target]');
const closeModalButtons = document.querySelectorAll('[data-close-button]');
const overlay = document.getElementById('overlay');

openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = document.querySelector(button.dataset.modalTarget);
        openModal(modal);
    });
});

overlay.addEventListener('click', () => {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
        closeModal(modal);
    });
});

closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        closeModal(modal);
    });
});

const openModal = modal => {
    if (modal == null) return;
    modal.classList.add('active');
    overlay.classList.add('active');
};

const closeModal = modal => {
    if (modal == null) return;
    modal.classList.remove('active');
    overlay.classList.remove('active');
};

// Socket code

socket.on('output', res => {
    res.forEach(msg => {
        showMessage(msg);
    });
    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('message', message => {
    if (message.username === 'Admin') {
        showAdminMessage(message);
        return;
    }
    else {
        showMessage(message);
    }
    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('mostLikedMessages', res => {
    res.forEach(msg => {
        showRatedMessage('likes', msg);
    });
});

socket.on('smartestMessages', res => {
    res.forEach(msg => {
        showRatedMessage('smarts', msg);
    });
});

socket.on('funniestMessages', res => {
    res.forEach(msg => {
        showRatedMessage('laughs', msg);
    });
});

// Event listener for send button
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    socket.emit('chatMessage', msg);

    // Clear input fields
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Event listener for change room button
changeChatButton.addEventListener('submit', (e) => {
    socket.emit('disconnect');
});

// Add room name to DOM
const outputRoomName = room => {
    roomName.innerText = room;
};

// Add users to DOM
const outputUsers = users => {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
};