const { v4: uuidv4 } = require('uuid')
const DB = require('../db')
const dataType = require('./dataType')
const entity = require('./entity')
const Ref = require('./ref')

function Property(p) {
    if (p.id) this.id = p.id
    else this.id = uuidv4()
    this.name = p.name
    this.systemName = p.systemName
    this.entity
    this.dataType
    this.refEntity
    this.isNull = p.isNull


    this.SetEntity = async function (entityOrId, cdb) {
        if (!entityOrId) throw new Error(`Property.SetEntity(): Не передан 
            параметр entityOrId`)

        switch (typeof (entityOrId)) {
            case 'string':
                let db = await DB.GetDB(cdb)
                let refEntity = await entity.GetEntity(entityOrId, cdb)
                if (!refEntity) throw new Error(`Property.SetEntity(): Сущности
                    c id = ${entityOrId} не существует`)
                this.entity = new Ref(refEntity)
                await DB.CloseDB(cdb, db)
                break;
            case 'object':
                this.entity = new Ref(entityOrId)
                break;
            default:
                throw new Error(`Property.SetEntity(): Параметр entityOrId
                    должен быть объектом сущности или его id`)
        }
    }

    this.SetRefEntity = async function (refEntityOrId, cdb) {
        if (!refEntityOrId) throw new Error(`Property.SetRefEntity(): Не передан 
            параметр refEntityOrId`)

        switch (typeof (refEntityOrId)) {
            case 'string':
                let db = await DB.GetDB(cdb)
                let refEntity = await entity.GetEntity(refEntityOrId, cdb)
                if (!refEntity) throw new Error(`Property.SetRefEntity(): Сущности
                    c id = ${refEntityOrId} не существует`)
                this.refEntity = new Ref(refEntity)
                await DB.CloseDB(cdb, db)
                break;
            case 'object':
                this.refEntity = new Ref(refEntityOrId)
                break;
            default:
                throw new Error(`Property.SetRefEntity(): Параметр refEntityOrId
                    должен быть объектом сущности или его id`)
        }
    }


    this.SetDataType = async function (dataTypeOrId, cdb) {
        if (!dataTypeOrId) throw new Error(`Property.SetDataType(): Не передан 
            параметр dataTypeOrId`)

        switch (typeof (dataTypeOrId)) {
            case 'string':
                let db = await DB.GetDB(cdb)
                let refDataType = await dataType.GetDataType(dataTypeOrId, cdb)
                if (!refDataType) throw new Error(`Property.SetDataType(): Типа
                    данных c id = ${dataTypeOrId} не существует`)
                this.dataType = new Ref(refDataType)
                await DB.CloseDB(cdb, db)
                break;
            case 'object':
                this.dataType = new Ref(dataTypeOrId)
                break;
            default:
                throw new Error(`Property.SetDataType(): Параметр dataTypeOrId
                    должен быть объектом сущности или его id`)
        }
    }
}


async function NewProperty(p, cdb) {
    let db = await DB.GetDB(cdb)
    let newP = new Property(p)
    await newP.SetDataType(p.dataType, db)
    await newP.SetEntity(p.entity, db)
    let dt = await dataType.GetDataType(newP.dataType.id, db)
    if (dt.code == 'reference') await newP.SetRefEntity(p.refEntity, db)
    await DB.CloseDB(cdb, db)

    return newP
}


async function CreateProperty(p, cdb) {
    if (!p) throw new Error(`CreateProperty(): Не передан объект p`)

    let db = await DB.GetDB(cdb)
    let refE 
    p = await NewProperty(p, db)

    let dt = await dataType.GetDataType(p.dataType.id, db)
    if (dt.code == 'reference') refE = await entity.GetEntity(p.refEntity.id, db)
    await db.Query(
        `insert into "property" ("id", "name", "systemName", "entity", 
            "dataType", "isNull", "refEntity") values 
            ($1, $2, $3, $4, $5, $6, $7)`,
        [
            p.id, 
            p.name, 
            p.systemName, 
            p.entity.id, 
            p.dataType.id,
            p.isNull ? true : false,
            refE ? refE.id : null
        ]
    )
    
    let e = await entity.GetEntity(p.entity.id, db)
    let dbDataTypeCode

    switch (dt.code) {
        case 'string':
            dbDataTypeCode = 'varchar(2000)'
            break;
        case 'integer':
            dbDataTypeCode = 'bigint'
            break;
        case 'real':
            dbDataTypeCode = 'decimal'
            break;
        case 'boolean':
            dbDataTypeCode = 'boolean'
            break;
        case 'date':
            dbDataTypeCode = 'date'
            break;
        case 'reference':
            dbDataTypeCode = 'varchar(36)'
        default:
            break;
    }

    let sqlAddTableColumn = `alter table "${e.systemName}"
        add "${p.systemName}" ${dbDataTypeCode}`
    
    if (!p.isNull) {
        sqlAddTableColumn += ` not null`
    }

    await db.Query(
       sqlAddTableColumn
    )

    if (dt.code == 'reference') {
        sqlAddTableColumn = `alter table "${e.systemName}"
            add constraint fk_property_${e.systemName} foreign key 
                ("${p.systemName}") references "${refE.systemName}" ("id")`
        await db.Query(
        sqlAddTableColumn
        )
    }

    // TODO: добавить получение свойства
    p = await GetProperty(p.id, db)

    await DB.CloseDB(cdb, db)

    return p
}


async function SaveProperty(p, cdb) {
    if (!p) throw new Error(`SaveProperty(): Не передан объект p`)

    let db = await DB.GetDB(cdb)
    let receivedP = await GetProperty(p.id, db)

    if (!receivedP) {
        p = await CreateProperty(p, db)
    } else {
        await db.Query(
            `update "property"
            set "name" = $1,
            "systemName" = $2,
            "isNull" = $3
            where "id" = $4`, [
            p.name,
            p.systemName,
            p.isNull,
            p.id
        ])

        let sql
        let e = await entity.GetEntity(receivedP.entity.id, db)
        if (receivedP.systemName != p.systemName) {
            sql = `alter table "${e.systemName}"
                rename column "${receivedP.systemName}" to "${p.systemName}"`
            await db.Query(sql)
        }

        if (receivedP.isNull != p.isNull && p.isNull != null && p.isNull != undefined) {
            if (p.isNull) {
                sql = `alter table "${e.systemName}"
                    alter column "${p.systemName}" drop not null`
            } else {
                sql = `alter table "${e.systemName}"
                    alter column "${p.systemName}" set not null`
            }
            await db.Query(sql)
        }

        p = await GetProperty(p.id, db)
    }

    await DB.CloseDB(cdb, db)

    return p
}


async function DeleteProperty(id, cdb) {
    if (!id) throw new Error(`DeleteProperty(): Не передан id`)

    let db = await DB.GetDB(cdb)

    let p = await GetProperty(id, db)
    if (!p) throw new Error(`DeleteProperty(): Свойство с id="${id}" не существует`)

    let e = await entity.GetEntity(p.entity.id, db)

    db.Query(
        `delete from "property"
            where "id" = $1`, [
                id
            ]
    )

    db.Query(
        `alter table "${e.systemName}" drop column "${p.systemName}"`
    )

    await DB.CloseDB(cdb, db)

    return p
}


async function GetProperty(id, cdb) {
    if (!id) throw new Error(`GetProperty(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select * 
        from "property" 
        where "id" = $1`, [
        id
    ])
    let p = result.rows[0]
    if (p) p = await NewProperty(p, db)
    await DB.CloseDB(cdb, db)

    return p
}


async function GetEntityProperties(entityId, cdb){
    if (!entityId) throw new Error(`GetEntityProperties(): Не передан entityId`)

    let db = await DB.GetDB(cdb)
    let result = await db.Query(
        `select "id"
            from "property"
            where entity = $1`, [
                entityId
            ]
    )

    let ps = []
    let p

    for (let item of result.rows) {
        p = await GetProperty(item.id, db)
        ps.push(p)
    }

    await DB.CloseDB(cdb, db)

    return ps
}


module.exports = {
    Property: Property,
    NewProperty: NewProperty,
    CreateProperty: CreateProperty,
    SaveProperty: SaveProperty,
    DeleteProperty: DeleteProperty,
    GetProperty: GetProperty,
    GetEntityProperties: GetEntityProperties,
}