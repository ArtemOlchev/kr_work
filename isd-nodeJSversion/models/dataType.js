const {
    v4: uuidv4
} = require('uuid');
const DB = require('../db');

function DataType(code, name) {
    this.id = uuidv4()
    this.code = code
    this.name = name
}


async function CreateDataType(dt, cdb) {
    if (!dt) throw new Error(`CreateDataType(): Не передан объект dt`)
    if (!dt.id) dt.id = uuidv4()

    let db = await DB.GetDB(cdb)
    await db.Query(
        `insert into "dataType" values 
            ($1, $2, $3)`, [
        dt.id,
        dt.code,
        dt.name
    ])
    dt = await GetDataType(dt.id, db)
    await DB.CloseDB(cdb, db)

    return dt
}


async function SaveDataType(dt, cdb) {
    if (!dt) throw new Error(`SaveDataType(): Не передан объект dt`)

    let db = await DB.GetDB(cdb)
    let receivedDt = await GetDataType(dt.id, db)

    if (!receivedDt) {
        dt = await CreateDataType(dt, db)
    } else {
        await db.Query(
            `update "dataType"
            set "code" = $1,
            "name" = $2
            where "id" = $3`, [
            dt.code,
            dt.name,
            dt.id
        ]
        )
        dt = await GetDataType(dt.id, db)
    }

    await DB.CloseDB(cdb, db)

    return dt
}


async function DeleteDataType(id, cdb) {
    if (!id) throw new Error(`DeleteDataType(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let dt = await GetDataType(id, db)

    if (!dt) throw new Error(`DeleteDataType(): Типа данных с id := "${id}" не существует`)

    await db.Query(`delete from "dataType" 
        where "id" = $1`, [
        id
    ])
    await DB.CloseDB(cdb, db)

    return dt
}


async function GetDataType(id, cdb) {
    if (!id) throw new Error(`GetDataType(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select * 
        from "dataType" 
        where "id" = $1`, [
        id
    ])
    let dt = result.rows[0]
    await DB.CloseDB(cdb, db)

    return dt
}


async function GetDataTypes(cdb) {
    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select * 
    from "dataType"`)
    let dts = result.rows
    await DB.CloseDB(cdb, db)

    return dts
}

module.exports = {
    DataType: DataType,
    SaveDataType: SaveDataType,
    DeleteDataType: DeleteDataType,
    GetDataType: GetDataType,
    GetDataTypes: GetDataTypes,
}