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

const myStorage = window.localStorage;

const socket = io();

// CHECK ARRAY FUNCTION FOR LATER USAGE

const arrayEquals = (a, b) => {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
}

// JOIN CHATROOM

socket.emit('joinRoom', { username, roomOptions, room });

// GET A ROOM AND USERS

socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// UPDATE RATING BASED ON ONCLICK EVENT

const updateRatings = e => {    
    let status;

    const ratingClassList = e.target.classList;
    if (ratingClassList.contains("img-heart")) {
        status = "img-heart";
    } else if (ratingClassList.contains("img-einstein")) {
        status = "img-einstein";
    } else if (ratingClassList.contains("img-laugh")) {
        status = "img-laugh";
    }

    const messageId = e.target.parentElement.parentElement.parentElement.dataset.messageId;    
    const isClicked = ratingClassList.contains("active");

    // emit request to database to update
    if (status === "img-heart") {
        socket.emit("updateRating", { _id: messageId, status: "likes", isClicked: isClicked });
    } else if (status === "img-einstein") {
        socket.emit("updateRating", { _id: messageId, status: "smarts", isClicked: isClicked});
    } else if (status === "img-laugh") {
        socket.emit("updateRating", { _id: messageId, status: "laughs", isClicked: isClicked});
    }

    // store the message in session storage
    const statusArray = ["img-heart", "img-einstein", "img-laugh"];
    let tempArray = JSON.parse(myStorage.getItem(messageId)) ? JSON.parse(myStorage.getItem(messageId)) : [false, false, false];

    for (i = 0; i < statusArray.length; i++) {
        if (statusArray[i] === status) {
            tempArray[i] = !tempArray[i];
        }
    }

    if (arrayEquals(tempArray, [false, false, false])) {
        myStorage.removeItem(messageId);
    } else {
        myStorage.setItem(messageId, JSON.stringify(tempArray));
    }

    // select all the HTML relevant to the clicked message (including in the modal form and chat body)
    const ratedChatMessages = modalBody.querySelectorAll("[data-message-id='" + messageId + "']");
    const chatMessageRatings = [];

    ratedChatMessages.forEach(msg => {
        chatMessageRatings.push(msg.querySelector("." + status));
    });

    const chatMessage = chatMessages.querySelector("[data-message-id='" + messageId + "']");
    const chatMessageRating = chatMessage.querySelector("." + status);

    chatMessageRatings.push(chatMessageRating);

    // update all the ratings at once
    chatMessageRatings.forEach(rating => {
        if (!isClicked) {
            rating.nextElementSibling.innerHTML = Number(rating.nextElementSibling.innerHTML) + 1;
        } else {
            rating.nextElementSibling.innerHTML = Number(rating.nextElementSibling.innerHTML) - 1;
        }
    
        if (rating.nextElementSibling.innerHTML == 0) {
            rating.nextElementSibling.setAttribute("style", "display: none;");
        } else {
            rating.nextElementSibling.removeAttribute("style");
        }

        rating.classList.toggle("active");
        rating.nextElementSibling.classList.toggle("active-counter");
    
    });
};

// CHANGE USERNAME SETTING

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

// OUTPUT A MESSAGE FROM SERVER

const showMessage = (message, status) => {
    // retrieve relevant ratings/properties from sessionStorage
    const ratingsArray = JSON.parse(myStorage.getItem(message._id));

    let activeRatingsArray = Array(6).fill('');
    if(ratingsArray) {
        [activeRatingsArray[0], activeRatingsArray[1]] = [ratingsArray[0] ? 'active' : '', ratingsArray[0] ? 'active-counter' : ''];
        [activeRatingsArray[2], activeRatingsArray[3]] = [ratingsArray[1] ? 'active' : '', ratingsArray[1] ? 'active-counter' : ''];
        [activeRatingsArray[4], activeRatingsArray[5]] = [ratingsArray[2] ? 'active' : '', ratingsArray[2] ? 'active-counter' : ''];
    }

    // construct message and show it on the DOM
    const div = document.createElement('div');
    div.classList.add('message');
    div.setAttribute('data-message-id', `${message._id}`);
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>
    <span class="img-container">
        <span class="rating-container">
            <img src="../images/heart.png" alt="img-heart" class="img-heart ${activeRatingsArray[0]}">
            <span class="counter-heart ${activeRatingsArray[1]}">${message.likes}</span>
        </span>
        <span class="rating-container">
            <img src="../images/einstein.png" alt="img-einstein" class="img-einstein ${activeRatingsArray[2]}">
            <span class="counter-einstein ${activeRatingsArray[3]}">${message.smarts}</span>
        </span>
        <span class="rating-container">
            <img src="../images/laugh.png" alt="img-laugh" class="img-laugh ${activeRatingsArray[4]}">
            <span class="counter-laugh ${activeRatingsArray[5]}">${message.laughs}</span>
        </span>
    </span>`;

    if (message.likes === 0) {
        div.querySelector(".counter-heart").setAttribute("style", "display: none;");
    } 
    if (message.smarts === 0) {
        div.querySelector(".counter-einstein").setAttribute("style", "display: none;");
    } 
    if (message.laughs === 0) {
        div.querySelector(".counter-laugh").setAttribute("style", "display: none;");
    } 

    // add functionality when a rating option is clicked on
    if (!status) {
        div.querySelectorAll(".img-heart, .img-einstein, .img-laugh").forEach(element => {element.addEventListener("click", updateRatings)});
        chatMessages.append(div);
    } else if (status === 'likes') {
        div.querySelectorAll(".img-heart, .img-einstein, .img-laugh").forEach(element => {element.addEventListener("click", updateRatings)});
        mostLikedMessages.append(div);
    } else if (status === 'smarts') {
        div.querySelectorAll(".img-heart, .img-einstein, .img-laugh").forEach(element => {element.addEventListener("click", updateRatings)});
        smartestMessages.append(div);
    } else if (status === 'laughs') {
        div.querySelectorAll(".img-heart, .img-einstein, .img-laugh").forEach(element => {element.addEventListener("click", updateRatings)});
        funniestMessages.append(div);
    }
}

const showAdminMessage = (message, location) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add('admin-message');
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    location.append(div);
};

// MODAL BUTTONS AND FUNCTIONALITY

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

// SOCKET CODE

socket.on('output', res => {
    res.forEach(msg => {
        showMessage(msg);
    });
    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('message', message => {
    if (message.username === 'Admin') {
        showAdminMessage(message, chatMessages);
    } else {
        showMessage(message);
    }
    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('mostLikedMessages', res => {
    if (res.length !== 0) {
        res.forEach(msg => {
            showMessage(msg, 'likes');
        });
    } else {
        showAdminMessage({
            username: "Admin",
            time: "",
            text: "No messages in this room yet! (If a message has been sent, please refresh the page)"
        }, mostLikedMessages);
    }
});

socket.on('smartestMessages', res => {
    if (res.length !== 0) {
        res.forEach(msg => {
            showMessage(msg, 'smarts');
        });
    } else {
        showAdminMessage({
            username: "Admin",
            time: "",
            text: "No messages in this room yet! (If a message has been sent, please refresh the page)"
        }, smartestMessages);
    }
});

socket.on('funniestMessages', res => {
    if (res.length !== 0) {
        res.forEach(msg => {
            showMessage(msg, 'laughs');
        });
    } else {
        showAdminMessage({
            username: "Admin",
            time: "",
            text: "No messages in this room yet! (If a message has been sent, please refresh the page)"
        }, funniestMessages);
    }
});

// EVENT LISTENER FOR SEND BUTTON

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    socket.emit('chatMessage', msg);

    // Clear input fields
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// EVENT LISTENER FOR CHANGE ROOM BUTTON

changeChatButton.addEventListener('submit', (e) => {
    socket.emit('disconnect');
});

// ADD ROOM NAME TO DOM

const outputRoomName = room => {
    roomName.innerText = room;
};

// ADD USERS TO DOM

const outputUsers = users => {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
};