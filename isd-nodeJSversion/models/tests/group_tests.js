const DB = require('../../db')
let group = require('../group')


async function group_tests(cdb) {
    console.log('Тестирование модуля group')
    let db = await DB.GetDB(cdb)

    // Тест 1: Создание группы
    console.log('Тест 1: Создание группы')
    let g = new group.Group('group_test')
    await group.SaveGroup(g, db)
    let newG = await group.GetGroup(g.id, db)

    if (newG.id !== g.id) throw new Error(`Тестовая группа не создалась`)

    // Тест 2: Изменение группы
    console.log('Тест 2: Изменение группы')
    newG.name += '_upd'
    newG = await group.SaveGroup(newG, db)

    if (g.name === newG.name) throw new Error(`Поле name не обновилось`)

    // Тест 3: Получение всех групп
    console.log('Тест 3: Получение всех групп')
    let result = await db.Query(`select "id"
        from "group"`)
    let validGs = result.rows
    let gs = await group.GetGroups(db)

    if (validGs.length !== gs.length) throw new Error(`Получено неверное 
        количество пользователей`)
    
    await db.Rallback()
    console.log('Все тесты пройдены \n')
    await DB.CloseDB(cdb, db)
}

module.exports = group_tests