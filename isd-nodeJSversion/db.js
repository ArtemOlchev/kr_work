const { Pool } = require('pg');

function DB(){

    this.pool = new Pool({
        user: 'postgres',
        database: 'kr_work',
        password: 'Zx123456789',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    })

    this.con = null
    this.isConnected = false
    this.hasOpenTransaction = false
    
    this.Connect = async function(){
        if (this.con) return
        this.con = await this.pool.connect()
        this.isConnected = true
        await this.con.query('BEGIN')
        this.hasOpenTransaction = true
    }

    this.End = async function(){
        if (!this.con) throw new Error('У базы данных нет открытого подключения')
        if (this.hasOpenTransaction) {
            await this.con.query('COMMIT')
            this.hasOpenTransaction = false
        } 
        await this.con.release()
        this.con = null
        this.isConnected = false
    }

    this.Rallback = async function(){
        if (!this.con) throw new Error('У базы данных нет открытого подключения')
        if (!this.hasOpenTransaction) throw new Error('У подключения нет открытой транзакции')
        
        await this.con.query('ROLLBACK')
        await this.con.query('BEGIN')
    }

    this.EndPool = async function(){
        if (!this.pool.ended) this.pool.end()
    }

    this.Query = async function(sql, params){
        if (!sql) throw new Error('DB.Query(): не передан входной параметр sql')
        if (!this.isConnected) throw new Error('Отсутствует подключение к БД')
        return await this.con.query(sql, params)
    }
}

async function GetDB(db){
    if (!db) {
        let db = new DB()
        await db.Connect()
        return db
    }
    
    return db
}


async function CloseDB(inDB, db){
    if (inDB) return
    await db.End()
    await db.EndPool()
}

module.exports = {
    DB: DB,
    GetDB: GetDB,
    CloseDB: CloseDB,
}