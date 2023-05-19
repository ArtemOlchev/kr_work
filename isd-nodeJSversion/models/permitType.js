const { 
    v4: uuidv4 
} = require('uuid');
const DB = require('../db');

function PermitType(code, name){
    this.id = uuidv4()
    this.code = code
    this.name = name
}


async function CreatePermitType(pt, cdb){
    if (!pt) throw new Error(`CreatePermitType(): Не передан объект pt`)

    let db = await DB.GetDB(cdb)
    await db.Query(
        `insert into "permitType" values 
            ($1, $2, $3)`, [
                pt.id, 
                pt.code, 
                pt.name
            ])
    pt = await GetPermitType(pt.id, db)
    await DB.CloseDB(cdb, db)

    return pt
}


async function SavePermitType(pt, cdb){
    if (!pt) throw new Error(`SavePermitType(): Не передан объект pt`)

    let db = await DB.GetDB(cdb)
    let receivedPt = await GetPermitType(pt.id, db)

    if (!receivedPt){
        pt = await CreatePermitType(pt, db) 
    } else {
        await db.Query(
            `update "permitType"
            set "code" = $1,
            "name" = $2
            where "id" = $3`, [
                pt.code, 
                pt.name,
                pt.id
            ]
        )
        pt = await GetPermitType(pt.id, db)
    }

    await DB.CloseDB(cdb, db)

    return pt
}


async function DeletePermitType(id, cdb){
    if (!id) throw new Error(`DeletePermitType(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let pt = await GetPermitType(id, db)
    
    if (!pt) throw new Error(`DeletePermitType(): Типа доступа с id := "${id}" не существует`)

    await db.Query(`delete from "permitType" 
        where "id" = $1`, [
            id
        ])
    await DB.CloseDB(cdb, db)

    return pt
}


async function GetPermitType(id, cdb){
    if (!id) throw new Error(`GetPermitType(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select * 
        from "permitType" 
        where "id" = $1`, [
            id
        ])
    let pt = result.rows[0]
    await DB.CloseDB(cdb, db)

    return pt
}


async function GetPermitTypes(cdb){
    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select * 
        from "permitType"`)
    let pts = result.rows
    await DB.CloseDB(cdb, db)

    return pts
}

module.exports = {
    PermitType: PermitType,
    SavePermitType: SavePermitType,
    DeletePermitType: DeletePermitType,
    GetPermitType: GetPermitType,
    GetPermitTypes: GetPermitTypes,
}