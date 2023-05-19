const {
    v4: uuidv4
} = require('uuid');
const DB = require('../db');
const pswHash = require('password-hash');
const jwt = require('jsonwebtoken')


function User(name, login) {
    this.id = uuidv4()
    this.name = name
    this.login = login
}


async function CreateUser(u, cdb) {
    if (!u) throw new Error(`CreateUser(): Не передан объект u`)
    if (!u.password) throw new Error(`CreateUser(): Не передан пароль 
        пользователя`)

    let db = await DB.GetDB(cdb)
    u.password = pswHash.generate(u.password)
    u.registrationDate = new Date()
    await db.Query(
        `insert into "user" ("id", "name", "login", "password") values
            ($1, $2, $3, $4)`, [
        u.id,
        u.name,
        u.login,
        u.password,
    ]
    )
    u = await GetUser(u.id, db)
    await DB.CloseDB(cdb, db)

    return u
}


async function SaveUser(u, cdb) {
    if (!u) throw new Error(`CreateUser(): Не передан объект u`)

    let db = await DB.GetDB(cdb)
    let receivedU = await GetUser(u.id, db)

    if (!receivedU) {
        u = await CreateUser(u, db)
    } else {
        await db.Query(`update "user" 
            set "name" = $1, 
            "login" = $2
            where "id" = $3`, [
                u.name,
                u.login,
                u.id
            ]
        )
        u = await GetUser(u.id, db)
    }

    await DB.CloseDB(cdb, db)

    return u
}


async function DeleteUser(id, cdb) {
    if (!id) throw new Error(`DeleteUser(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let u = await GetUser(id, db)

    if (!u) throw new Error(`DeleteUser(): Пользователь с id := "${id}" 
        не существует`)

    await db.Query(`delete from "user" 
        where "id" = $1`, [
        id
    ])
    await DB.CloseDB(cdb, db)

    return u
}


async function ChangePassword(id, oldPsw, newPsw, cdb) {
    if (!id) throw new Error(`ChangeUserPassword(): Не указан параметр id`)
    if (!oldPsw) throw new Error(`ChangeUserPassword(): Не указан параметр 
        oldPsw`)
    if (!newPsw) throw new Error(`ChangeUserPassword(): Не указан параметр 
        newPsw`)

    let db = await DB.GetDB(cdb)
    let isPswVerify = await VerifyPsw(id, oldPsw, db)

    if (isPswVerify) {
        let hashNewPsw = pswHash.generate(newPsw)
        await db.Query(`update "user"
            set "password" = $1
            where "id" = $2`, [
                hashNewPsw,
                id
            ])
    }

    await DB.CloseDB(cdb, db)
}


async function GetUser(id, cdb) {
    if (!id) throw new Error(`GetUser(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select "id", "name", "login"
        from "user" 
        where "id" = $1`, [
        id
    ])
    let u = result.rows[0]
    await DB.CloseDB(cdb, db)

    return u
}


async function GetUserByLogin(login, cdb) {
    if (!login) throw new Error(`GetUser(): Не передан login`)

    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select "id", "name", "login"
        from "user" 
        where "login" = $1`, [
        login
    ])
    let u = result.rows[0]
    await DB.CloseDB(cdb, db)

    return u
}


async function GetUsers(cdb) {
    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select "id", "name", "login"
        from "user"`)
    let us = result.rows
    await DB.CloseDB(cdb, db)

    return us
}


async function VerifyPsw(uId, psw, cdb) {
    if (!uId) throw new Error(`VerifyPsw(): Не указан параметр uId`)
    if (!psw) throw new Error(`VerifyPsw(): Не указан параметр psw`)

    let db = await DB.GetDB(cdb)

    let result = await db.Query(`select "password" 
        from "user" 
        where "id" = $1`, [
            uId
    ])
    
    if (!result.rows[0]) throw new Error(`VerifyPsw(): пользователя с id = ${uId} не существует`)
    
    let currentPsw = result.rows[0].password
    let isPswVerify = pswHash.verify(psw, currentPsw)

    await DB.CloseDB(cdb, db)

    return isPswVerify
}


async function LogIn(uLogin, psw, cdb) {
    let db = await DB.GetDB(cdb)

    let u = await GetUserByLogin(uLogin, db)
    
    if (!u) throw new Error(`Пользователя с логином ${uLogin} не существует`)

    let isPswVerify = await VerifyPsw(u.id, psw, db)
    let token

    if (!isPswVerify) {
        throw new Error(`Пароль неверный`)
    } else {
        token = jwt.sign(u, 'Hello', {expiresIn: '1h'})
    }

    await DB.CloseDB(cdb, db)

    return token
}


function VerifyJWTToken(token) {
    try {
        var decoded = jwt.verify(token, 'Hello')
        return decoded
    } catch (error) {
        throw new Erorr(`Пользователь не авторизирован`)
    }
}


module.exports = {
    User: User,
    CreateUser: CreateUser,
    SaveUser: SaveUser,
    DeleteUser: DeleteUser,
    ChangePassword: ChangePassword,
    GetUser: GetUser,
    GetUsers: GetUsers,
    GetUserByLogin: GetUserByLogin,
    LogIn: LogIn,
    VerifyPsw: VerifyPsw,
    VerifyJWTToken: VerifyJWTToken
}