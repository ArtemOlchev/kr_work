const { v4: uuidv4 } = require('uuid')
const DB = require('../../db')
let object = require('../object')
let property = require('../property')
let entity = require('../entity')

async function object_tests(cdb){
    console.log('Тестирование модуля object')
    let db = await DB.GetDB(cdb)

    // Тест 1: Создание нового объекта
    console.log(`Тест 1: Создание нового объекта`)
    // Создание тестовой сущности
    let testEntity = new entity.Entity('testEntity', 'testEntity')
    testEntity = await entity.SaveEntity(testEntity, db)
    
    let testProperty1 = await property.NewProperty({
        name: 'propertyTests1', 
        systemName: 'propertyTests1', 
        entity: testEntity, 
        dataType: '701fbcfd-0025-4eb8-94c0-08e79ffb9155'}, db)

    testProperty1 = await property.SaveProperty(testProperty1, db)

    let testProperty2 = await property.NewProperty({
        name: 'propertyTests2', 
        systemName: 'propertyTests2', 
        entity: testEntity, 
        dataType: '96ab401b-592a-42c3-81f2-55fc01abd81c'}, db)

    testProperty2 = await property.SaveProperty(testProperty2, db)

    let newObj = await object.NewObj(testEntity.id, {}, db)


    // Тест 2: Создание объекта
    console.log(`Тест 2: Создание объекта`)
    newObj.name = 'testObject'
    newObj.propertyTests1 = 'Hello Test'
    newObj.propertyTests2 = 987
    await object.CreateObject(newObj, db)


    // Тест 3: Получение объекта
    console.log(`Тест 3: Получение объекта`)
    let receivedObj = await object.GetObject(testEntity.id, newObj.id, db)


    // Тест 4: Создание родительского объекта
    console.log(`Тест 4: Создание родительского объекта`)

    // Создание тестовой родительской сущности
    let testParentEntity = new entity.Entity('testParentEntity', 'testParentEntity')
    testParentEntity = await entity.SaveEntity(testParentEntity, db)
    
    let testRefProperty = await property.NewProperty({
        name: 'testRefProperty', 
        systemName: 'testRefProperty', 
        entity: testParentEntity, 
        dataType: '9da254b1-0835-4e9d-ab81-2877f92daa9d',
        refEntity: testEntity}, db)

        testRefProperty = await property.SaveProperty(testRefProperty, db)

    let newRefObj = await object.NewObj(testParentEntity.id, {testRefProperty: receivedObj.id}, db)
    newRefObj.name = 'testRefObj'
    newRefObj = await object.CreateObject(newRefObj, db)


    // Тест 5: Изменение объекта
    console.log(`Тест 5: Изменение объекта`)
    newObj = await object.NewObj(testEntity.id, {}, db)
    newObj.name = 'testObject5'
    newObj.propertyTests1 = 'Hello Test'
    newObj.propertyTests2 = 987
    newObj = await object.CreateObject(newObj, db)

    newRefObj.testRefProperty = newObj
    newRefObj.name += '_updated'

    newRefObj = await object.SaveObject(newRefObj, db)


    // Тест 6: Получение всех объектов сущности
    console.log(`Тест 6: Получение всех объектов сущности`)
    let objects = await object.GetEntityObjects(newObj.entity.id, db);


    // Тест 7: Удаление объекта
    console.log(`Тест 7: Удаление объекта`)
    await object.DeleteObject(newRefObj.entity.id, newRefObj.id, db)
    await object.DeleteObject(newObj.entity.id, newObj.id, db)


    await db.Rallback()
    console.log('Все тесты пройдены \n')
    await DB.CloseDB(cdb, db)
}

module.exports = object_tests