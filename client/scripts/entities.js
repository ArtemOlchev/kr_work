import { getEntities, deleteEntity } from "./rest-entity.js"

let tableBody = document.querySelector('.entity-table tbody')
setEntityTable()

async function setEntityTable() {
    let entities = await getEntities()

    tableBody.innerHTML = ''
    let tdId
    let tr
    let tdName
    let tdSystemName

    for (let entity of entities) {
        tr = document.createElement('tr')
        tr.setAttribute('id', entity.id)
        tr.setAttribute('ondblclick', `window.location='entity.html?id=${entity.id}'`)
        tdId = document.createElement('td')
        tdId.textContent = entity.id
        tr.append(tdId)
        tdName = document.createElement('td')
        tdName.textContent = entity.name
        tr.append(tdName)
        tdSystemName = document.createElement('td')
        tdSystemName.textContent = entity.systemName
        tr.append(tdSystemName)
        tableBody.append(tr)
        tr.addEventListener('click', function(event) {
            let trs = document.querySelectorAll('.entity-table tbody tr')
            for (let item of trs) item.style.background = 'none'
            event.currentTarget.style.background = '#8FBC8F'
            currentEntityId = event.currentTarget.id
        })
    }

}

let updateBtn = document.getElementById('update-entity-btn')
updateBtn.addEventListener('click', function() {
    setEntityTable()
    currentEntityId = null
})

let currentEntityId

let deleteBtn = document.getElementById('delete-entity-btn')
deleteBtn.addEventListener('click', async function() {
    if (!currentEntityId) return
    await deleteEntity(currentEntityId)
    await setEntityTable()

})

async function deleteEntityFromTable() {
    
    let response = await fetch(`http://localhost:8000/entity/${currentEntityId}`, {
        method: 'DELETE'
    })

    await setEntityTable()
}
