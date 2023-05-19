const DB = require('../../db')
let propertyType = require('../propertyType')

async function propertyType_tests(cdb){
    console.log('Тестирование модуля propertyType')
    let db = await DB.GetDB(cdb)

    // Тест 1: Создание типа свойств
    console.log('Тест 1: Создание типа свойств')
    let pt = new propertyType.PropertyType('propertyType_tests_code', 'propertyType_tests_value')
    await propertyType.SavePropertyType(pt, db)
    let newPt = await propertyType.GetPropertyType(pt.id, db)
    if (!newPt) throw new Error('Тестовый тип свойств не создался')

    // Тест 2: Изменение типа свойств
    console.log('Тест 2: Изменение типа свойств')
    newPt.code += '_upd'
    newPt.name += '_upd'
    await propertyType.SavePropertyType(newPt, db)
    newPt = await propertyType.GetPropertyType(pt.id, db)

    if (pt.name === newPt.name) throw new Error(`Не изменилось свойство name`)
    if (pt.code === newPt.code) throw new Error(`Не изменилось свойство code`)

    // Тест 3: Получение всех типов свойств
    console.log('Тест 3: Получение всех типов свойств')
    let result = await db.Query(`select *
        from "propertyType"`)
    let validPTs = result.rows
    let pts = await propertyType.GetPropertyTypes(db)

    if (validPTs.length !== pts.length) throw new Error(`Получено неверное 
        количество типов свойств`)

    // Тест 4: Удаление типа свойств
    console.log('Тест 4: Удаление типа свойств')
    await propertyType.DeletePropertyType(newPt.id, db)
    newPt = await propertyType.GetPropertyType(pt.id, db)
    if (newPt) throw new Error(`Тип свойств с id := ${newPt.id} не удалился`)


    await db.Rallback()
    
    console.log('Все тесты пройдены \n')

    await DB.CloseDB(cdb, db)
}

module.exports = propertyType_tests