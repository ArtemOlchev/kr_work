
export async function auth(login, password) {
    let response = await fetch('http://localhost:8000/auth/', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            "login": login,
            "password": password
        })
    })

    let body

    if (response.ok) {
        let body = await response.json()
        return body.token
    } else {
        let body = await response.json()
        alert(body.message)
    }
    return null
}