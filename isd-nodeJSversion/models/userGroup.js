const {
    v4: uuidv4
} = require('uuid');
const DB = require('../db');
const user = require('./user');
const group = require('./group');
const Ref = require('./ref')

function UserGroup(ug) {
    if (ug && ug.id) this.id = ug.id
    else this.id = uuidv4()
    this.user
    this.group

    this.SetGroup = async function (groupOrId, cdb) {
        if (!groupOrId) throw new Error(`UserGroup.SetGroup(): Не передан 
            параметр groupOrId`)

        switch (typeof (groupOrId)) {
            case 'string':
                let db = await DB.GetDB(cdb)
                let refGroup = await group.GetGroup(groupOrId, cdb)
                if (!refGroup) throw new Error(`UserGroup.SetGroup(): Группа
                    c id = ${groupOrId} не существует`)
                this.group = new Ref(refGroup)
                await DB.CloseDB(cdb, db)
                break;
            case 'object':
                this.group = new Ref(groupOrId)
                break;
            default:
                throw new Error(`UserGroup.SetGroup(): Параметр groupOrId
                    должен быть объектом сущности или его id`)
        }
    }


    this.SetUser = async function (userOrId, cdb) {
        if (!userOrId) throw new Error(`UserGroup.SetUser(): Не передан 
            параметр userOrId`)

        switch (typeof (userOrId)) {
            case 'string':
                let db = await DB.GetDB(cdb)
                let refUser = await user.GetUser(userOrId, cdb)
                if (!refUser) throw new Error(`UserGroup.SetUser(): Пользователь
                    c id = ${userOrId} не существует`)
                this.user = new Ref(refUser)
                await DB.CloseDB(cdb, db)
                break;
            case 'object':
                this.user = new Ref(userOrId)
                break;
            default:
                throw new Error(`UserGroup.SetUser(): Параметр userOrId
                    должен быть объектом сущности или его id`)
        }
    }
}

async function NewUserGroup(ug, cdb) {
    let db = await DB.GetDB(cdb)
    let newUG = new UserGroup(ug)
    await newUG.SetGroup(ug.group, db)
    await newUG.SetUser(ug.user, db)
    await DB.CloseDB(cdb, db)

    return newUG
}

async function CreateUserGroup(ug, cdb) {
    if (!ug) throw new Error(`CreateUserGroup(): Не передан объект ug`)

    let db = await DB.GetDB(cdb)
    ug = await NewUserGroup(ug, db)
    await db.Query(
        `insert into "userGroup" ("id", "user", "group") values
            ($1, $2, $3)`, [
            ug.id,
            ug.user.id,
            ug.group.id
        ]
    )
    ug = await GetUserGroup(ug.id, db)
    await DB.CloseDB(cdb, db)

    return ug
}


async function DeleteUserGroup(id, cdb) {
    if (!id) throw new Error(`DeleteUserGroup(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let ug = await GetUserGroup(id, db)

    if (!ug) throw new Error(`DeleteUserGroup(): Пользователь не добавлен в группу`)

    await db.Query(`delete from "userGroup" 
        where "id" = $1`, [
        id
    ])
    await DB.CloseDB(cdb, db)

    return ug
}


async function GetUserGroup(id, cdb) {
    if (!id) throw new Error(`GetUserGroup(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select "id", "user", "group"
        from "userGroup" 
        where "id" = $1`, [
        id
    ])
    let ug = result.rows[0]
    if (ug) ug = NewUserGroup(ug, db)
    await DB.CloseDB(cdb, db)

    return ug
}


async function GetGroupsOfUser(userId, cdb) {
    if (!userId) throw new Error(`GetGroupsOfUser(): Не передан userId`)

    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select "group"
        from "userGroup" 
        where "user" = $1`, [
            userId
    ])
    let gsId = result.rows
    let g
    let gs = []

    for (let gId of gsId) {
        g = await group.GetGroup(gId.group, db)
        gs.push(g);
    }
    await DB.CloseDB(cdb, db)

    return gs
}


async function GetUsersOfGroup(groupId, cdb) {
    if (!groupId) throw new Error(`GetUsersOfGroup(): Не передан groupId`)

    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select "user"
        from "userGroup" 
        where "group" = $1`, [
            groupId
    ])
    let usId = result.rows
    let u
    let us = []

    for (let uId of usId) {
        u = await user.GetUser(uId.user, db)
        us.push(u);
    }
    await DB.CloseDB(cdb, db)

    return us
}


module.exports = {
    UserGroup: UserGroup,
    NewUserGroup: NewUserGroup,
    CreateUserGroup: CreateUserGroup,
    DeleteUserGroup: DeleteUserGroup,
    GetUserGroup: GetUserGroup,
    GetGroupsOfUser: GetGroupsOfUser,
    GetUsersOfGroup: GetUsersOfGroup,
}