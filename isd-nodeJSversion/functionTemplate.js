const DB = require('../db')


// Макет функции, в которой происходит работа с БД
// cdb - текущая БД
// Если параметр cdb не установлен, то создается новый объект БД db
// db открывается и закрывается в текущей функции
async function _create_name_(cdb) {
    let db = await DB.GetDB(cdb)

    // code ...

    await DB.CloseDB(cdb, db)
}