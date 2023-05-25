const {
    v4: uuidv4
} = require('uuid');
const DB = require('../db');


function Group(name) {
    this.id = uuidv4()
    this.name = name
}


async function CreateGroup(g, cdb) {
    if (!g) throw new Error(`CreateGroup(): Не передан объект g`)

    let db = await DB.GetDB(cdb)
    await db.Query(
        `insert into "group" ("id", "name") values
            ($1, $2)`, [
            g.id,
            g.name
        ]
    )
    g = await GetGroup(g.id, db)
    await DB.CloseDB(cdb, db)

    return g
}

async function SaveGroup(g, cdb) {
    if (!g) throw new Error(`SaveGroup(): Не передан объект g`)

    let db = await DB.GetDB(cdb)
    let receivedG = await GetGroup(g.id, db)

    if (!receivedG) {
        g = await CreateGroup(g, db)
    } else {
        await db.Query(`update "group" 
            set "name" = $1
            where "id" = $2`, [
                g.name,
                g.id
            ]
        )
        g = await GetGroup(g.id, db)
    }

    await DB.CloseDB(cdb, db)

    return g
}

async function DeleteGroup(id, cdb) {
    if (!id) throw new Error(`DeleteGroup(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let g = await GetGroup(id, db)

    if (!g) throw new Error(`DeleteGroup(): Группа с id := "${id}" 
        не существует`)

    await db.Query(`delete from "group" 
        where "id" = $1`, [
        id
    ])
    await DB.CloseDB(cdb, db)

    return g
}


async function GetGroup(id, cdb) {
    if (!id) throw new Error(`GetGroup(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select "id", "name"
        from "group" 
        where "id" = $1`, [
        id
    ])
    let g = result.rows[0]
    await DB.CloseDB(cdb, db)

    return g
}


async function GetGroups(cdb) {
    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select "id", "name"
        from "group"`)
    let gs = result.rows
    await DB.CloseDB(cdb, db)

    return gs
}


module.exports = {
    Group: Group,
    CreateGroup: CreateGroup,
    SaveGroup: SaveGroup,
    DeleteGroup: DeleteGroup,
    GetGroup: GetGroup,
    GetGroups: GetGroups,
}