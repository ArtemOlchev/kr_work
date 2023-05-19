const { 
    v4: uuidv4 
} = require('uuid');
const DB = require('../db');

function PropertyType(code, name){
    this.id = uuidv4()
    this.code = code
    this.name = name
}


async function CreatePropertyType(pt, cdb){
    if (!pt) throw new Error(`CreatePropertyType(): Не передан объект pt`)
    if (!pt.id) pt.id = uuidv4()

    let db = await DB.GetDB(cdb)
    await db.Query(
        `insert into "propertyType" values 
            ($1, $2, $3)`, [
                pt.id, 
                pt.code, 
                pt.name
            ])
    pt = await GetPropertyType(pt.id, db)
    await DB.CloseDB(cdb, db)

    return pt
}


async function SavePropertyType(pt, cdb){
    if (!pt) throw new Error(`SavePropertyType(): Не передан объект pt`)

    let db = await DB.GetDB(cdb)
    let receivedPt = await GetPropertyType(pt.id, db)

    if (!receivedPt){
        pt = await CreatePropertyType(pt, db) 
    } else {
        await db.Query(
            `update "propertyType"
            set "code" = $1,
            "name" = $2
            where "id" = $3`, [
                pt.code, 
                pt.name,
                pt.id
            ]
        )
        pt = await GetPropertyType(pt.id, db)
    }

    await DB.CloseDB(cdb, db)

    return pt
}


async function DeletePropertyType(id, cdb){
    if (!id) throw new Error(`DeletePropertyType(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let pt = await GetPropertyType(id, db)
    
    if (!pt) throw new Error(`DeletePropertyType(): Типа свойств с id := "${id}" не существует`)

    await db.Query(`delete from "propertyType" 
        where "id" = $1`, [
            id
        ])
    await DB.CloseDB(cdb, db)

    return pt
}


async function GetPropertyType(id, cdb){
    if (!id) throw new Error(`GetPropertyType(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select * 
        from "propertyType" 
        where "id" = $1`, [
            id
        ])
    let pt = result.rows[0]
    await DB.CloseDB(cdb, db)

    return pt
}


async function GetPropertyTypes(cdb){
    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select * 
        from "propertyType"`)
    let pts = result.rows
    await DB.CloseDB(cdb, db)

    return pts
}

module.exports = {
    PropertyType: PropertyType,
    SavePropertyType: SavePropertyType,
    DeletePropertyType: DeletePropertyType,
    GetPropertyType: GetPropertyType,
    GetPropertyTypes: GetPropertyTypes,
}