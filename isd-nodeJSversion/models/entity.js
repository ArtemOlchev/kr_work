const {
    v4: uuidv4
} = require('uuid')
const DB = require('../db')

function Entity(name, systemName) {
    this.id = uuidv4()
    this.name = name
    this.systemName = systemName
}


async function CreateEntity(e, cdb) {
    if (!e) throw new Error(`CreateEntity(): Не передан объект e`)

    let db = await DB.GetDB(cdb)
    await db.Query(`insert into "entity" ("id", "name", "systemName") values
        ($1, $2, $3)`, [
        e.id,
        e.name,
        e.systemName
    ])
    await db.Query(`create table "${e.systemName}"
        (
            "id" varchar(36) primary key,
            "name" varchar(200) not null
        )`)
    e = await GetEntity(e.id, db)
	
	// await CreateIdProperty(e, db)
		
    await DB.CloseDB(cdb, db)
    return e
}


async function SaveEntity(e, cdb) {
    if (!e) throw new Error(`SaveEntity(): Не передан объект e`)

    let db = await DB.GetDB(cdb)
    let receivedE = await GetEntity(e.id, db)

    if (!receivedE) {
        e = await CreateEntity(e, db)
    } else {
        await db.Query(`update "entity"
            set "name" = $1,
            "systemName" = $2
            where "id" = $3`, [
            e.name,
            e.systemName,
            e.id
        ])

        if (receivedE.systemName !== e.systemName) {
            await db.Query(`alter table "${receivedE.systemName}" rename to 
                "${e.systemName}"`)
        }

        e = await GetEntity(e.id, db)
    }

    await DB.CloseDB(cdb, db)

    return e
}


async function DeleteEntity(id, cdb) {
    if (!id) throw new Error(`DeleteEntity(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let e = await GetEntity(id, db)

    if (!e) throw new Error(`DeleteEntity(): Сущности с id := "${id}" не 
        существует`)

    await db.Query(`delete from "entity"
        where "id" = $1`, [
        id
    ])
    await db.Query(`drop table "${e.systemName}"`)
    await DB.CloseDB(cdb, db)

    return e
}


async function GetEntity(id, cdb) {
    if (!id) throw new Error(`GetEntity(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select * 
        from "entity" 
        where "id" = $1`, [
        id
    ])
    let e = result.rows[0]
    await DB.CloseDB(cdb, db)

    return e
}


async function GetEntities(cdb) {
    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select *
        from "entity"`)
    let es = result.rows
    await DB.CloseDB(cdb, db)

    return es
}


// async function CreateIdProperty(e, cdb) {
//     if (!e) throw new Error(`CreateIdProperty(): Не передан объект e`)

//     let db = await DB.GetDB(cdb)

//     await db.Query(
//         `insert into "property" ("id", "name", "systemName", "entity", 
//             "dataType", "isNull", "refEntity") values 
//             ($1, $2, $3, $4, $5, $6, $7)`,
//         [
//             uuidv4(), 
//             'id', 
//             'id', 
//             e.id, 
//             '701fbcfd-0025-4eb8-94c0-08e79ffb9155',
//             false,
//             null
//         ]
//     )

//     let sqlAddTableColumn = `alter table "${e.systemName}"
//         add "id" varchar(36) not null`

//     console.log(sqlAddTableColumn)
//     await db.Query(
//        sqlAddTableColumn
//     )
//     // TODO: добавить получение свойства

//     await DB.CloseDB(cdb, db)
// }


module.exports = {
    Entity: Entity,
    CreateEntity: CreateEntity,
    SaveEntity: SaveEntity,
    DeleteEntity: DeleteEntity,
    GetEntity: GetEntity,
    GetEntities: GetEntities,
}