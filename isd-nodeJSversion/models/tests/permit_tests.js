const DB = require('../../db')
let userGroup = require('../userGroup')
let group = require('../group')
let user = require('../user')
let entity = require('../entity')
let permit = require('../permit')

async function permit_tests(cdb) {
    console.log('Тестирование модуля permit_tests')
    let db = await DB.GetDB(cdb)

    // Тест 1: Добавление разрешения группе
    console.log('Тест 1: Добавление разрешения группе')
    let g = new group.Group('group_test')
    await group.SaveGroup(g, db)
    g = await group.GetGroup(g.id, db)

    let u = new user.User('user_tests', 'user_tests')
    u.password = 'user_test'
    await user.SaveUser(u, db)
    u = await user.GetUser(u.id, db)

    let e = new entity.Entity('testEntity', 'testEntity')
    await entity.SaveEntity(e, db)
    e = await entity.GetEntity(e.id, db)

    let ug = {
        user: u,
        group: g
    }

    ug = await userGroup.CreateUserGroup(ug, db)

    let p = {
        entity: e,
        group: g,
        access: true,
        create: true
    }

    p = await permit.CreatePermit(p, db)
    if (!p) throw new Error(`Группе не добавилось разрешение`)




    // Тест 2: Сохранение разрешения
    console.log('Тест 2: Сохранение разрешения')

    p.update = true
    p = await permit.SavePermit(p, db)
    if (!p.update) throw new Error(`Разрешение не сохранилось`)


    // Тест 3: Получение разрешений группы
    console.log('Тест 3: Получение разрешений группы')

    let ps = await permit.GetPermitsOfGroup(g.id, db)
    if (ps.length !== 1) throw new Error(`Не получены разрешения группы`)


    // Тест 4: Удаление разрешения
    console.log('Тест 4: Удаление разрешения')
    
    await permit.DeletePermit(p.id, db)
    p = await permit.GetPermit(p.id, db)
    if (p) throw new Error(`Разрешение не удалилось`)


    await db.Rallback()
    console.log('Все тесты пройдены \n')
    await DB.CloseDB(cdb, db)
}

module.exports = permit_tests