const DB = require('../../db')
let userGroup = require('../userGroup')
let group = require('../group')
let user = require('../user')

async function userGroup_tests(cdb) {
    console.log('Тестирование модуля userGroup_tests')
    let db = await DB.GetDB(cdb)

    // Тест 1: Добавление пользователя в группу
    console.log('Тест 1: Добавление пользователя в группу')
    let g = new group.Group('group_test')
    await group.SaveGroup(g, db)
    g = await group.GetGroup(g.id, db)

    let u = new user.User('user_tests', 'user_tests')
    u.password = 'user_test'
    await user.SaveUser(u, db)
    u = await user.GetUser(u.id, db)

    let ug = {
        user: u,
        group: g
    }

    ug = await userGroup.CreateUserGroup(ug, db)
    if (!ug) throw new Error(`Пользователь не добавился в группу`)


    // Тест 2: Получение групп пользователя
    console.log('Тест 2: Получение групп пользователя')

    let gs = await userGroup.GetGroupsOfUser(u.id, db)
    if (gs.length !== 1) throw new Error(`Не получены группы пользователя`)


    // Тест 3: Получение пользователей группы
    console.log('Тест 3: Получение пользователей группы')

    let us = await userGroup.GetUsersOfGroup(g.id, db)
    if (us.length !== 1) throw new Error(`Не получены пользователи группы`)


    // Тест 4: Удаление пользователя из группы
    console.log('Тест 4: Удаление пользователя из группы')
    
    await userGroup.DeleteUserGroup(ug.id, db)
    ug = await userGroup.GetUserGroup(ug.id, db)
    if (ug) throw new Error(`Пользователь не удалился из группы`)


    await db.Rallback()
    console.log('Все тесты пройдены \n')
    await DB.CloseDB(cdb, db)
}

module.exports = userGroup_tests