const dataType_tests = require('./dataType_tests')
const propertyType_tests = require('./propertyType_tests')
const permitType_tests = require('./permitType_tests')
const user_tests = require('./user_tests')
const entity_tests = require('./entity_tests')
const property_tests = require('./property_tests')
const object_tests = require('./object_tests')

async function tests(){
    await dataType_tests()
    // await permitType_tests()
    await entity_tests()
    await property_tests()
    await object_tests()
    await user_tests()
}

tests()