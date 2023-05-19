const DB = require('../../db')
let dataType = require('../dataType')

async function dataType_tests(cdb){
    console.log('Тестирование модуля dataType')
    let db = await DB.GetDB(cdb)

    // Тест 1: Получение всех типов данных
    console.log('Тест 1: Получение всех типов данных')
    let result = await db.Query(`select *
        from "dataType"`)
    let validDTs = result.rows
    let dts = await dataType.GetDataTypes(db)

    if (validDTs.length !== dts.length) throw new Error(`Получено неверное 
        количество типов данных`)

    await db.Rallback()
    console.log('Все тесты пройдены \n')
    await DB.CloseDB(cdb, db)
}

module.exports = dataType_tests