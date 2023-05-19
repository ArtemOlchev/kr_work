import { auth } from "./user.js";
let loginInput = document.getElementById('login')
let passwordInput = document.getElementById('password')

let authBtn = document.getElementById('auth-btn')
authBtn.addEventListener('click', function() {
    console.log(111)
    authorization()
})

async function authorization() {
    let token = await auth(loginInput.value, passwordInput.value)
    
    if (token) {
        document.cookie = `jwt=${token}`
        window.location='index.html'
    }
}