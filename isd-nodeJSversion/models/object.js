const {
    v4: uuidv4
} = require('uuid')
const DB = require('../db')
let property = require('./property')
let entity = require('./entity')
const Ref = require('./ref')

function Obj(obj) {
    if (obj.id) this.id = obj.id
    else this.id = uuidv4()
    if (obj.name) this.name = obj.name
    else this.name = this.id

    this.assign = function(obj) {
        let value
        for (let key in obj) {
            value = obj[key]
            if (typeof(value) == 'function') continue
            this[key] = value
        }
    }
    this.assign(obj)
}

async function NewObj(entityId, objTemplate, cdb) {
    let db = await DB.GetDB(cdb)
    let e = await entity.GetEntity(entityId, db)
    let ps = await property.GetEntityProperties(e.id, db)
    let obj = {entity: new Ref(e)}
    let value, refObj

    if (objTemplate && objTemplate.id) obj.id = objTemplate.id
    if (objTemplate && objTemplate.name) obj.name = objTemplate.name

    for (let p of ps) {
        obj[p.systemName] = objTemplate[p.systemName] || objTemplate[p.systemName] === false ? objTemplate[p.systemName] : null

        if (p.dataType.code == 'reference' && obj[p.systemName]) {
            refObj = await GetObject(p.refEntity.id, obj[p.systemName], db)
            obj[p.systemName] = new Ref(refObj)
        }
    }

    let newObj = new Obj(obj)
    await DB.CloseDB(cdb, db)
    return newObj
}


async function CreateObject(obj, cdb) {
    let db = await DB.GetDB(cdb)
    let e = await entity.GetEntity(obj.entity.id, db)
    let ps = await property.GetEntityProperties(e.id, db)
    let sqlPropertiesStr = `"id", "name", `
    let sqlObjDataStr = `$1, $2, `
    let objData = [
        obj.id,
        obj.name
    ]
    let i = 3
    for (let p of ps) {
        sqlPropertiesStr += `"${p.systemName}", `
        sqlObjDataStr += `$${i}, `
        i += 1
        
        if (p.dataType.code == 'reference' && obj[p.systemName]) {
            objData.push(obj[p.systemName].id)
        } else objData.push(obj[p.systemName])
        
    }

    sqlPropertiesStr = sqlPropertiesStr.slice(0, -2)
    sqlObjDataStr = sqlObjDataStr.slice(0, -2)

    let sql = `insert into "${e.systemName}" (${sqlPropertiesStr})
        values (${sqlObjDataStr})`
    
    await db.Query(sql, objData)

    await db.Query(
        `insert into "object" ("id", "name", "entity")
            values ($1, $2, $3)`, [
                obj.id,
                obj.name,
                e.id
            ]
    )

    let newObj = await GetObject(e.id, obj.id, db)

    await DB.CloseDB(cdb, db)

    return newObj
}


async function SaveObject(obj, cdb) {
    let db = await DB.GetDB(cdb)

    let receivedObj = await GetObject(obj.entity.id, obj.id, db)
    let newObj

    if (!receivedObj) {
        newObj = await CreateObject(obj, db)
    } else {
        let e = await entity.GetEntity(obj.entity.id, db)
        let ps = await property.GetEntityProperties(obj.entity.id, db)
        let setSql = `"name" = $1, `
        let setObjData = [obj.name]
        let value
        let i = 2

        for (let p of ps) {
            setSql += `"${p.systemName}" = $${i}, `
            i += 1

            if (p.dataType.code == 'reference') {
                value = obj[p.systemName] ? obj[p.systemName].id : null
            } else value = obj[p.systemName] || obj[p.systemName] === false ? obj[p.systemName] : null
            
            setObjData.push(value)
        }

        setSql = setSql.slice(0, -2)

        let sql = `update "${e.systemName}"
            set ${setSql}
            where "id" = '${obj.id}'`

        await db.Query(sql, setObjData)

        await db.Query(
            `update "object"
                set "name" = $1
                where "id" = $2`, [
                    obj.name, e.id
                ]
        )
        
        newObj = await GetObject(e.id, obj.id, db)
    }

    await DB.CloseDB(cdb, db)

    return newObj
}


async function DeleteObject(entityId, objId, cdb) {
    let db = await DB.GetDB(cdb)
    let receivedObj = await GetObject(entityId, objId, db)

    if (!receivedObj) throw new Error(`DeleteObject(): Удаляемый объект не существует`)

    let e = await entity.GetEntity(entityId, db)
    try {
        await db.Query(
            `delete from "${e.systemName}"
                where "id" = $1`, [
                    objId
                ]
        )
    } catch (error) {
        throw new Error(error.detail)
    }

    await db.Query(
        `delete from "object"
            where "id" = $1`, [
                objId
            ]
    )
    

    await DB.CloseDB(cdb, db)
    
    return receivedObj
}


async function GetObject(entityId, objId, cdb) {
    let db = await DB.GetDB(cdb)
    let e = await entity.GetEntity(entityId, db)
    let ps = await property.GetEntityProperties(e.id, db)
    let obj

    let result = await db.Query(
        `select *
            from "${e.systemName}"
            where "id" = $1`, [
                objId
            ]
    )

    if (result.rows.length > 0) {
        obj = await NewObj(e.id, result.rows[0], db)
    } else obj = null
    
    await DB.CloseDB(cdb, db)

    return obj
}

async function GetEntityObjects(entityId, cdb) {
    if (!entityId) throw new Error(`GetEntityProperties(): Не передан entityId`)

    let db = await DB.GetDB(cdb)
    let e = await entity.GetEntity(entityId, db)

    let result = await db.Query(
        `select id
            from "${e.systemName}"`
    )

    let objects = []
    let obj

    for(let item of result.rows) {
        obj = await GetObject(e.id, item.id, db)
        objects.push(obj)
    }

    await DB.CloseDB(cdb, db)

    return objects
}

module.exports = {
    Obj: Obj,
    NewObj: NewObj,
    CreateObject: CreateObject,
    SaveObject: SaveObject,
    DeleteObject: DeleteObject,
    GetObject: GetObject,
    GetEntityObjects: GetEntityObjects
}