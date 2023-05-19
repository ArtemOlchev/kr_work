const DB = require('../../db')
let property = require('../property')
let entity = require('../entity')

async function property_tests(cdb){
    console.log('Тестирование модуля property')
    let db = await DB.GetDB(cdb)

    // Тест 1: Получение нового свойства с передачей id ссылочных свойств
    console.log(`Тест 1: Получение нового свойства с передачей id ссылочных 
        свойств`)
    
    let testEntity = new entity.Entity('testEntity', 'testEntity')
    testEntity = await entity.SaveEntity(testEntity, db)
    
    let p = await property.NewProperty({
        name: 'property_tests', 
        systemName: 'property_tests', 
        entity: testEntity, 
        dataType: '701fbcfd-0025-4eb8-94c0-08e79ffb9155'}, db)

    if (!p) throw new Error(`Новый объект не получен`)
    

    // Тест 2: Создание нового свойства типа строка
    console.log(`Тест 2: Создание нового свойства типа строка`)
    p = await property.CreateProperty(p, db)
    
    
    // Тест 3: Создание ссылочного свойства
    console.log(`Тест 3: Создание ссылочного свойства`)
    let testRefEntity = new entity.Entity('testRefEntity', 'testRefEntity')
    testRefEntity = await entity.SaveEntity(testRefEntity, db)

    let refP = await property.NewProperty({
        name: 'ref_property_test',
        systemName: 'ref_property_test',
        entity: testEntity,
        dataType: '9da254b1-0835-4e9d-ab81-2877f92daa9d',
        refEntity: testRefEntity,
        isNull: true
    }, db)

    refP = await property.SaveProperty(refP, db)


    // Тест 4: Изменение системного наименования свойства
    console.log(`Тест 4: Изменение системного наименования свойства`)
    p.systemName += `_updated`;
    updatedP = await property.SaveProperty(p, db)
    let e = await entity.GetEntity(updatedP.entity.id, db)

    if (updatedP.systemName != p.systemName) throw new Error(`Не изменилось системное наименование свойства`)

    db.Query(
        `select "${updatedP.systemName}"
            from "${e.systemName}"`
    )


    // Тест 5: Измение ограничения isNull свойства
    console.log(`Тест 5: Измение ограничения isNull свойства`)
    p.isNull = true
    updatedP = await property.SaveProperty(p, db)

    if (updatedP.isNull != p.isNull) throw new Error(`Не изменилось ограничение isNull свойства`)


    // Тест 6: Получение свойств сущности
    console.log(`Тест 6: Получение свойств сущности`)
    let ps = await property.GetEntityProperties(testEntity.id, db)

    if (ps.length !== 2) throw new Error(`Ожидалось 2 свойства, а получено ${ps.length}`)


    // Тест 7: Удаление свойства
    console.log(`Тест 7: Удаление свойства`)
    p = await property.DeleteProperty(refP.id, db)
    p = await property.GetProperty(p.id, db)

    if (p) throw new Error(`Свойство не удалилось`)

    await db.Rallback()
    console.log('Все тесты пройдены \n')
    await DB.CloseDB(cdb, db)


}

module.exports = property_tests