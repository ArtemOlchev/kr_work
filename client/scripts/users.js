import { verifyToken, getUsers } from "./rest-user.js"

verifyToken();

let tableBody = document.querySelector('.user-table tbody')
setEntityTable()

async function setEntityTable() {
    let users = await getUsers()

    tableBody.innerHTML = ''
    let tdId
    let tr
    let tdName
    let tdLogin

    for (let user of users) {
        tr = document.createElement('tr')
        tr.setAttribute('id', user.id)
        tr.setAttribute('ondblclick', `window.location='user.html?id=${user.id}'`)
        tdId = document.createElement('td')
        tdId.textContent = user.id
        tr.append(tdId)
        tdName = document.createElement('td')
        tdName.textContent = user.name
        tr.append(tdName)
        tdLogin = document.createElement('td')
        tdLogin.textContent = user.login
        tr.append(tdLogin)
        tableBody.append(tr)
        tr.addEventListener('click', function(event) {
            let trs = document.querySelectorAll('.user-table tbody tr')
            for (let item of trs) item.style.background = 'none'
            event.currentTarget.style.background = '#8FBC8F'
            currentUserId = event.currentTarget.id
        })
    }

}

let updateBtn = document.getElementById('update-user-btn')
updateBtn.addEventListener('click', function() {
    setUserTable()
    currentUserId = null
})

let currentUserId

let deleteBtn = document.getElementById('delete-user-btn')
deleteBtn.addEventListener('click', async function() {
    if (!currentUserId) return
    await deleteUser(currentUserId)
    await setUserTable()

})