// const http = require('http')
// const host = 'localhost'
// const port = 8000

// const requestListener = function (req, res) {
//     res.writeHead(200)
//     res.end("My first server!")
// };

// const server = http.createServer(requestListener)
// server.listen(port, host, () => {
//     console.log(`Server is running on http://${host}:${port}`)
// });

const express = require('express')
const cors = require('cors')
const DB = require('../db')
const entity = require('../models/entity')
const property = require('../models/property')
const dataType = require('../models/dataType')
const object = require('../models/object')
const user = require('../models/user')
const bodyParser = require("body-parser")
const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function(req, res) {
    console.log(req.body.sendTest)
    res.send(JSON.stringify({
        test: 'hello',
        test1: 'hello1'
    }))
})

app.post('/entity/', async function(req, res) {
    let reqEntity = req.body
    let e = new entity.Entity(reqEntity.name, reqEntity.systemName)
    e = await entity.CreateEntity(e)
    res.send(JSON.stringify(e))
})

app.delete('/entity/:id', async function(req, res) {
    let e = await entity.DeleteEntity(req.params.id)
    res.send(JSON.stringify(e))
})

app.put('/entity/', async function(req, res) {
    let reqEntity = req.body
    let e = await entity.SaveEntity(reqEntity)
    res.send(JSON.stringify(e))
})

app.get('/entity/:id', async function(req, res) {
    let e = await entity.GetEntity(req.params.id)
    res.send(JSON.stringify(e))
})

app.get('/entity/', async function(req, res) {
    let es = await entity.GetEntities()
    res.send(JSON.stringify(es))
})


app.post('/entity/:entityId/property/', async function(req, res) {
    let reqProperty = req.body
    reqProperty.entity = req.params.entityId
    let p = await property.NewProperty(reqProperty)
    p = await property.CreateProperty(p)
    res.send(JSON.stringify(p))
})

app.delete('/entity/:entityId/property/:propertyId', async function(req, res) {
    let p = await property.DeleteProperty(req.params.propertyId)
    res.send(JSON.stringify(p))
})

app.put('/entity/:entityId/property/', async function(req, res) {
    let reqProperty = req.body
    reqProperty.entity = req.params.entityId
    let p = await property.SaveProperty(reqProperty)
    res.send(JSON.stringify(p))
})

app.get('/entity/:entityId/property/:propertyId', async function(req, res) {
    let p = await property.GetProperty(req.params.propertyId)
    res.send(JSON.stringify(p))
})

app.get('/entity/:entityId/property/', async function(req, res) {
    let ps = await property.GetEntityProperties(req.params.entityId)
    res.send(JSON.stringify(ps))
})


app.get('/dataType/', async function(req, res) {
    let dts = await dataType.GetDataTypes()
    res.send(JSON.stringify(dts))
})

app.get('/dataType/:id', async function(req, res) {
    let dt = await dataType.GetDataType(req.params.id)
    res.send(JSON.stringify(dt))
})


app.post('/entity/:entityId/object', async function(req, res) {
    let reqObj = req.body
    reqObj.entity = req.params.entityId
    let obj = await object.NewObj(req.params.entityId, reqObj)
    obj = await object.CreateObject(obj)
    res.send(JSON.stringify(obj))
})

app.delete('/entity/:entityId/object/:objId', async function(req, res) {
    let obj = await object.DeleteObject(req.params.entityId, req.params.objId)
    res.send(JSON.stringify(obj))
})

app.put('/entity/:entityId/object', async function(req, res) {
    let reqObj = req.body
    reqObj.entity = req.params.entityId
    let obj = await object.NewObj(req.params.entityId, reqObj)
    obj = await object.SaveObject(obj)
    res.send(JSON.stringify(obj))
})

app.get('/entity/:entityId/object/:objId', async function(req, res) {
    let obj = await object.GetObject(req.params.entityId, req.params.objId)
    res.send(JSON.stringify(obj))
})

app.get('/entity/:entityId/object', async function(req, res) {
    let objects = await object.GetEntityObjects(req.params.entityId)
    res.send(JSON.stringify(objects))
})



app.post('/auth/', async function(req, res) {
    try {
        let u = req.body
        let token = await user.LogIn(u.login, u.password)
        res.send(JSON.stringify({"token": token}))
    } catch (error) {
        res.status(401)
        console.log(error.message)
        res.send(JSON.stringify({message: error.message}))
    }
    
})


app.listen(8000)