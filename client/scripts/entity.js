import { verifyToken } from "./rest-user.js"

verifyToken();

let currentURL = document.location.href
let searchParams = new URLSearchParams(document.location.search)
let entityIdInput = document.getElementById('entity-id-input')
let entityNameInput = document.getElementById('entity-name-input')
let entitySystemNameInput = document.getElementById('entity-systemName-input')
let entityId = searchParams.get('id')

if (entityId) {
    entityIdInput.value = entityId
    entityIdInput.setAttribute('disabled', 'disabled')
    entityIdInput.style.color = 'grey'
    setEntity()
}

async function setEntity() {
    let response = await fetch(`http://localhost:8000/entity/${entityId}`)

    if (response.ok) {
        let entity = await response.json()
        entityNameInput.value = entity.name
        entitySystemNameInput.value = entity.systemName
    } else {
        alert('Ошибка HTTP: ' + response.status)
    }

}


let saveBtn = document.getElementById('save-entity-btn')
saveBtn.addEventListener('click', function() {
    saveEntity()
})

async function saveEntity() {
    let entity = {
        id: entityIdInput.value,
        name: entityNameInput.value,
        systemName: entitySystemNameInput.value
    }

    if (!entity.id) entity.id = uuidv4()
    console.log(entity)

    let response = await fetch(`http://localhost:8000/entity/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(entity)
    })

    if (response.ok) {
        entity = await response.json()
        entityIdInput.value = entity.id
        entityNameInput.value = entity.name
        entitySystemNameInput.value = entity.systemName
        window.location=`entity.html?id=${entity.id}`
    } else {
        alert('Ошибка HTTP: ' + response.status)
    }
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }