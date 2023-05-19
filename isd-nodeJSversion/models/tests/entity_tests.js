const DB = require('../../db')
const { Entity } = require('../entity')
let entity = require('../entity')

async function entity_tests(cdb) {
    console.log('Тестирование модуля entity')
    let db = await DB.GetDB(cdb)

    // Тест 1: Создание сущности
    console.log('Тест 1: Создание сущности')
    let e = new entity.Entity('testEntity', 'testEntity')
    await entity.SaveEntity(e, db)
    let newE = await entity.GetEntity(e.id, db)

    if (!newE) throw new Error('Сущность не создалась')

    await db.Query(`select * from "${e.systemName}"`)

    // Тест 2: Обновление сущности
    console.log('Тест 2: Изменение сущности')
    newE.name += '_upd'
    newE.systemName += '_upd'
    await entity.SaveEntity(newE, db)
    newE = await entity.GetEntity(newE.id, db)

    if (e.name === newE.name) throw new Error(`Не изменилось поле name`)
    if (e.systemName === newE.systemName) throw new Error(`Не изменилось поле 
        systemName`)
    await db.Query(`select * from "${newE.systemName}"`)

    // Тест 3: Получение всех сущностей
    console.log('Тест 3: Получение всех сущностей')
    let result = await db.Query(`select *
        from "entity"`)
    let validEs = result.rows
    let es = await entity.GetEntities(db)

    if (validEs.length !== es.length) throw new Error(`Получено неверное 
        количество сущностей`)

    // Тест 4: Удаление сущности
    console.log('Тест 4: Удаление сущности')
    await entity.DeleteEntity(e.id, db)
    newE = await entity.GetEntity(e.id, db)

    if (newE) throw new Error(`Сущность с id := ${newE.id} не удалилась`)

    await db.Rallback()
    await DB.CloseDB(cdb, db)
    console.log('Все тесты пройдены \n')
}

module.exports = entity_tests