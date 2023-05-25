const {
    v4: uuidv4
} = require('uuid');
const DB = require('../db');
const group = require('./group');
const entity = require('./entity')
const Ref = require('./ref')

function Permit(p) {
    if (p && p.id) this.id = p.id
    else this.id = uuidv4()
    this.entity
    this.group
    this.access = p.access
    this.update = p.update
    this.create = p.create
    this.delete = p.delete

    this.SetGroup = async function (groupOrId, cdb) {
        if (!groupOrId) throw new Error(`Permit.SetGroup(): Не передан 
            параметр groupOrId`)

        switch (typeof (groupOrId)) {
            case 'string':
                let db = await DB.GetDB(cdb)
                let refGroup = await group.GetGroup(groupOrId, cdb)
                if (!refGroup) throw new Error(`Permit.SetGroup(): Группа
                    c id = ${groupOrId} не существует`)
                this.group = new Ref(refGroup)
                await DB.CloseDB(cdb, db)
                break;
            case 'object':
                this.group = new Ref(groupOrId)
                break;
            default:
                throw new Error(`Permit.SetGroup(): Параметр groupOrId
                    должен быть объектом сущности или его id`)
        }
    }


    this.SetEntity = async function (entityOrId, cdb) {
        if (!entityOrId) throw new Error(`Permit.SetEntity(): Не передан 
            параметр entityOrId`)

        switch (typeof (entityOrId)) {
            case 'string':
                let db = await DB.GetDB(cdb)
                let refEntity = await entity.GetEntity(entityOrId, cdb)
                if (!refEntity) throw new Error(`Permit.SetEntity(): Сущности
                    c id = ${entityOrId} не существует`)
                this.entity = new Ref(refEntity)
                await DB.CloseDB(cdb, db)
                break;
            case 'object':
                this.entity = new Ref(entityOrId)
                break;
            default:
                throw new Error(`Permit.SetEntity(): Параметр entityOrId
                    должен быть объектом сущности или его id`)
        }
    }
}

async function NewPermit(p, cdb) {
    let db = await DB.GetDB(cdb)
    let newP = new Permit(p)
    await newP.SetGroup(p.group, db)
    await newP.SetEntity(p.entity, db)
    await DB.CloseDB(cdb, db)

    return newP
}

async function CreatePermit(p, cdb) {
    if (!p) throw new Error(`CreatePermit(): Не передан объект p`)

    let db = await DB.GetDB(cdb)
    p = await NewPermit(p, db)

    await db.Query(
        `insert into "permit" ("id", "group", "access", "entity", "update", "create", "delete") values
            ($1, $2, $3, $4, $5, $6, $7)`, [
            p.id,
            p.group.id,
            p.access,
            p.entity.id,
            p.update,
            p.create,
            p.delete
        ]
    )
    p = await GetPermit(p.id, db)
    await DB.CloseDB(cdb, db)

    return p
}

async function SavePermit(p, cdb) {
    if (!p) throw new Error(`CreatePermit(): Не передан объект p`)

    let db = await DB.GetDB(cdb)
    p = await NewPermit(p, db)
    recievedP = await GetPermit(p.id, db)

    if (!recievedP) {
        CreatePermit(p, db)
    } else {
        await db.Query(
            `update "permit"
            set "access" = $1,
            "update" = $2,
            "create" = $3,
            "delete" = $4
            where "id" = $5`, [
            p.access,
            p.update,
            p.create,
            p.delete,
            p.id
        ])
    }

    p = await GetPermit(p.id, db)
    await DB.CloseDB(cdb, db)

    return p
}


async function DeletePermit(id, cdb) {
    if (!id) throw new Error(`DeletePermit(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let p = await GetPermit(id, db)

    if (!p) throw new Error(`DeletePermit(): Не существует разрешения с id = ${id}`)

    await db.Query(`delete from "permit" 
        where "id" = $1`, [
        id
    ])
    await DB.CloseDB(cdb, db)

    return p
}


async function GetPermit(id, cdb) {
    if (!id) throw new Error(`GetPermit(): Не передан id`)

    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select "id", "entity", "group", "access", "update", "create", "delete"
        from "permit" 
        where "id" = $1`, [
        id
    ])
    let p = result.rows[0]
    if (p) p = NewPermit(p, db)
    await DB.CloseDB(cdb, db)

    return p
}


async function GetPermitsOfGroup(groupId, cdb) {
    if (!groupId) throw new Error(`GetPermitsOfGroup(): Не передан groupId`)

    let db = await DB.GetDB(cdb)
    let result = await db.Query(`select "id"
        from "permit" 
        where "group" = $1`, [
            groupId
    ])
    let psId = result.rows
    let p
    let ps = []

    for (let pId of psId) {
        p = await GetPermit(pId.id, db)
        ps.push(p);
    }
    await DB.CloseDB(cdb, db)

    return ps
}

module.exports = {
    Permit: Permit,
    NewPermit: NewPermit,
    CreatePermit: CreatePermit,
    SavePermit: SavePermit,
    DeletePermit: DeletePermit,
    GetPermit: GetPermit,
    GetPermitsOfGroup: GetPermitsOfGroup,
}