
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
        body = await response.json()
        return body.token
    } else {
        body = await response.json()
        alert(body.message)
    }
    return null
}

async function verifyJwtToken(token) {
    if (!token) return false
    
    let response = await fetch('http://localhost:8000/verifyJwtToken/', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            "token": token
        })
    })

    if (response.ok) {
        return true
    } else {
        let body = await response.json()
        return false
    }
}

export async function verifyToken() {
    let token = getCookie('jwt')
    let isVerify = await verifyJwtToken(token)
    if (!isVerify) window.location='auth.html'
}


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export async function getUsers() {
    let response = await fetch('http://localhost:8000/user/')
    if (response.ok) {
        let users = await response.json()
        return users
    } else {
        alert('Ошибка HTTP: ' + response.status)
    }
}

export async function getUser(id) {
    let response = await fetch('http://localhost:8000/user/' + id)
    if (response.ok) {
        let user = await response.json()
        return user
    } else {
        alert('Ошибка HTTP: ' + response.status)
    }
}

export async function saveUser(user) {
    let response = await fetch(`http://localhost:8000/user/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(user)
    })

    if (response.ok) {
        user = await response.json()
        return user
    } else {
        alert('Ошибка HTTP: ' + response.status)
    }
}