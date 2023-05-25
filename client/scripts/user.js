import { verifyToken, getUser, saveUser } from "./rest-user.js"

verifyToken();

let searchParams = new URLSearchParams(document.location.search)
let userIdInput = document.getElementById('user-id-input')
let userNameInput = document.getElementById('user-name-input')
let userLoginInput = document.getElementById('user-login-input')
let userPasswordInput = document.getElementById('user-password-input')
let userId = searchParams.get('id')

if (userId) {
    userIdInput.value = userId
    userIdInput.setAttribute('disabled', 'disabled')
    userIdInput.style.color = 'grey'
    setUser()
}

async function setUser() {
    var user = await getUser(userId)
    userNameInput.value = user.name
    userLoginInput.value = user.login
}

let saveBtn = document.getElementById('save-user-btn')
saveBtn.addEventListener('click', function() {
    saveOrUpdateUser()
})


async function saveOrUpdateUser() {
    let u = {
        id: userIdInput.value,
        name: userNameInput.value,
        login: userLoginInput.value,
        password: userPasswordInput.value
    }

    if (!u.id) u.id = uuidv4()

    let user = await saveUser(u)

    userIdInput.value = user.id
    userNameInput.value = user.name
    userLoginInput.value = user.login
    window.location=`user.html?id=${user.id}`
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}