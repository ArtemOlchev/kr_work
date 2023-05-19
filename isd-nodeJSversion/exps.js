const DB = require('./db')
const entity = require('./models/entity')
const dataType = require('./models/dataType')
const user = require('./models/user')


// Макет функции, в которой происходит работа с БД
// cdb - текущая БД
// Если параметр cdb не установлен, то создается новый объект БД db
// db открывается и закрывается в текущей функции
async function main(cdb) {
    let db = await DB.GetDB(cdb)
    let u = new user.User('admin', 'admin')
    u.password = 'admin'
    await user.SaveUser(u, db)

    await DB.CloseDB(cdb, db)
}

main()

function test() {
    console.log('hello')
}