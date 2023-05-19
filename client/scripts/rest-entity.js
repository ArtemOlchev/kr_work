export async function getEntities() {
    let response = await fetch('http://localhost:8000/entity/')
    if (response.ok) {
        let entities = await response.json()
        return entities
    } else {
        alert('Ошибка HTTP: ' + response.status)
    }
}

// export function getEntities() {
//     console.log(123)
// }

export async function deleteEntity(id) {
    let response = await fetch(`http://localhost:8000/entity/${id}`, {
        method: 'DELETE'
    })
}