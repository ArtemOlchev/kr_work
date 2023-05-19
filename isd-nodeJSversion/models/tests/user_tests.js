const DB = require('../../db')
let user = require('../user')


async function user_tests(cdb) {
    console.log('Тестирование модуля user')
    let db = await DB.GetDB(cdb)

    // Тест 1: Создание пользователя
    console.log('Тест 1: Создание тестового пользователя')
    let u = new user.User('user_tests', 'user_tests')
    u.password = 'user_test'
    await user.SaveUser(u, db)
    let newU = await user.GetUser(u.id, db)

    if (newU.id !== u.id) throw new Error(`Тестовый пользователь не создался`)
    
    // Тест 2: Изменение пользователя
    console.log('Тест 2: Изменение тестового пользователя')
    newU.name += '_upd'
    newU.login += '_upd'
    newU = await user.SaveUser(newU, db)

    if (u.name === newU.name) throw new Error(`Поле name не обновилось`)
    if (u.login === newU.login) throw new Error(`Поле login не обновилось`)

    // Тест 3: Получение всех пользователей
    console.log('Тест 3: Получение всех типов свойств')
    let result = await db.Query(`select "id"
        from "user"`)
    let validUs = result.rows
    let us = await user.GetUsers(db)

    if (validUs.length !== us.length) throw new Error(`Получено неверное 
        количество пользователей`)

    // Тест 4: Смена пароля пользователя
    console.log('Тест 4: Смена пароля пользователя')
    await user.ChangePassword(u.id, 'user_test', 'user_test_upd', db)
    let isPswVerify = await user.VerifyPsw(u.id, 'user_test_upd', db)
    if (!isPswVerify) throw new Error(`Пароль не сменился`)

    // Тест 5: Получение пользователя по логину
    console.log('Тест 5: Получение пользователя по логину')
    u = await user.GetUserByLogin(newU.login, db)
    if (!u) throw new Error('Пользователь не получен')

    // Тест 6: Авторизация пользователя
    console.log('Тест 6: Авторизация пользователя')
    let token = await user.LogIn(u.login, 'user_test_upd', db)
    if (!token) throw new Error(`Не создался токен`)

    // Тест 7: Проверка токена
    console.log('Тест 7: Проверка токена')
    let isVerifyToken = user.VerifyJWTToken(token)
    console.log(isVerifyToken)


    // Тест 6: Удаление пользователя
    console.log('Тест 6: Удаление пользователя')
    await user.DeleteUser(newU.id, db)
    newU = await user.GetUser(newU.id, db)

    if (newU) throw new Error(`Пользователь не удалился`)


    await db.Rallback()
    console.log('Все тесты пройдены \n')
    await DB.CloseDB(cdb, db)
}

module.exports = user_tests