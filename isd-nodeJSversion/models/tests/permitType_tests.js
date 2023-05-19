const DB = require('../../db')
let permitType = require('../permitType')

async function permitType_tests(cdb){
    console.log('Тестирование модуля permitType')
    let db = await DB.GetDB(cdb)

    // Тест 1: Создание типа доступа
    console.log('Тест 1: Создание типа доступа')
    let pt = new permitType.PermitType('permitType_tests_code', 'permitType_tests_value')
    await permitType.SavePermitType(pt, db)
    let newPt = await permitType.GetPermitType(pt.id, db)
    if (!newPt) throw new Error('Тестовый тип доступа не создался')

    // Тест 2: Изменение типа доступа
    console.log('Тест 2: Изменение типа доступа')
    newPt.code += '_upd'
    newPt.name += '_upd'
    await permitType.SavePermitType(newPt, db)
    newPt = await permitType.GetPermitType(pt.id, db)

    if (pt.name === newPt.name) throw new Error(`Не изменилось свойство name`)
    if (pt.code === newPt.code) throw new Error(`Не изменилось свойство code`)

    // Тест 3: Получение всех типов доступа
    console.log('Тест 3: Получение всех типов доступа')
    let result = await db.Query(`select *
        from "permitType"`)
    let validPTs = result.rows
    let pts = await permitType.GetPermitTypes(db)

    if (validPTs.length !== pts.length) throw new Error(`Получено неверное 
        количество типов доступа`)

    // Тест 4: Удаление типа доступа
    console.log('Тест 4: Удаление типа доступа')
    await permitType.DeletePermitType(newPt.id, db)
    newPt = await permitType.GetPermitType(pt.id, db)
    if (newPt) throw new Error(`Тип доступа с id := ${newPt.id} не удалился`)


    await db.Rallback()
    
    console.log('Все тесты пройдены \n')

    await DB.CloseDB(cdb, db)
}

module.exports = permitType_tests