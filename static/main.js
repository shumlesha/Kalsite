

document.addEventListener('DOMContentLoaded', function(){

    if (!localStorage.getItem('username')){
        document.getElementById("usernameModal").style.display = "block";

    }
    else {
        username = localStorage.getItem('username');
    }
    fetch('/get-user-count')
        .then(response => response.json())
        .then(data => {
            const usersCountElem = document.getElementById("usersCount");
            usersCountElem.textContent = data.user_count;
        });
    let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || "[]");
    let chatWindow = document.getElementById("chatMessages");
    for(let message of chatHistory) {
        let newMessage = document.createElement("p");
        newMessage.innerHTML = message;
        chatWindow.appendChild(newMessage);
    }
    chatWindow.scrollTop = chatWindow.scrollHeight;

    document.addEventListener('contextmenu', function(e) {

    e.preventDefault();
    });

    document.addEventListener("keydown", function(e) {
    if (
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
        (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
        (e.ctrlKey && e.keyCode === 85) ||
        (e.metaKey && e.altKey && e.keyCode === 85) ||
        e.keyCode === 123
    ) {
        e.preventDefault();

    }
}, false);


});


document.getElementById('messageInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault();
        sendChatMessage();
    }
});

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}


var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);


function checkNickname(nickname) {
   return fetch('/check-nickname', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({nickname: nickname})
   }).then(response => response.json());
}

function registerNickname(nickname) {
   return fetch('/register-nickname', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({nickname: nickname})
   }).then(response => response.json());
}

function saveUsername(){
    let enteredUsername = document.getElementById("usernameInput").value;
    let validationRegex = /^[a-zA-Z0-9-_]{6,20}$/;

    checkNickname(enteredUsername).then(data => {
      if (data.exists) {
         alert("Этот никнейм уже существует!");
      } else {
         if (!validationRegex.test(enteredUsername)) {
        alert("Ник должен содержать от 6 до 20 символов!");
        return;
    }
         registerNickname(enteredUsername).then(registrationData => {
            if(registrationData.success) {
               //const usersCountElem = document.getElementById("usersCount");
               //usersCountElem.textContent = parseInt(usersCountElem.textContent) + 1;

               localStorage.setItem('username', enteredUsername);
               document.getElementById("usernameModal").style.display = "none";
            } else {
               alert("Произошла ошибка при регистрации никнейма!");
            }
         });
      }
   });



}

function clearChatHistory() {
    let chatWindow = document.getElementById("chatMessages");
    chatWindow.innerHTML = "";
    localStorage.removeItem("chatHistory");
}



function sendMessageToChat(message){
    //console.log('sendMessageToChat called with:', message);
    let username = localStorage.getItem('username');
    let adminTag = (username === "shumlesha") ? "<span class='admin-tag'>[ADMINISTRATOR]</span>" : "";
    let fullMessage = `[${getCurrentTime()}] [<strong>${adminTag} Пользователь "${username}" отправил</strong>]:<br>${message}`;
    socket.emit('send_message', {'message': fullMessage});
}

function sendChatMessage(){
    let userMessage = document.getElementById("messageInput").value;
    if (userMessage.trim() === ""){
        return;
    }
    sendMessageToChat(userMessage);
    document.getElementById("messageInput").value = "";
}

socket.on('message', function(data){
    //console.log(data);
    let chatWindow = document.getElementById("chatMessages");
    let newMessage = document.createElement("p");
    newMessage.innerHTML = data.message;
    chatWindow.appendChild(newMessage);
    chatWindow.scrollTop = chatWindow.scrollHeight;


    let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || "[]");
    chatHistory.push(data.message);
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
});

socket.on('update_user_count', function(data){
    let usersCountElem = document.getElementById("usersCount");
    usersCountElem.textContent = data.new_count;
});

function searchQuery(){
    let query = document.getElementById("searchInput").value;
    fetch("/search", {
        method: "POST",
        body: new URLSearchParams({ "query": query }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    .then(response => response.json())
    .then(data => {
        displayResults(data);
    });
}

function displayResults(data){
    let resultsDiv = document.getElementById("searchResults");
    resultsDiv.innerHTML = "";

    for (let question of data){
        let resultDiv = document.createElement("div");
        resultDiv.className = "question-container";

        let messageContent = `Вопрос: ${question[0]}<br>Ответ: ${question[1].replace(/\n/g, '<br>')}`;
        let escapedQuestion = encodeURIComponent(messageContent);


        resultDiv.innerHTML = `
            <div class="qa-content">
                <strong>${question[0]}</strong>
                <p>${question[1].replace(/\n/g, '<br>')}</p>
            </div>
            <button onclick="sendMessageToChat(decodeURIComponent('${escapedQuestion}'))">Отправить в чат</button>
        `;

        resultDiv.addEventListener('click', function(event) {
            // Если клик произошел не на кнопке, то копируем содержимое
            if (!event.target.closest('button')) {
                let textToCopy = `${question[0]}\n${question[1]}`;
                navigator.clipboard.writeText(textToCopy).then(function() {
                    console.log('Text successfully copied to clipboard!');
                }).catch(function(err) {
                    console.error('Could not copy text: ', err);
                });
            }
        });

        resultsDiv.appendChild(resultDiv);
    }
}
