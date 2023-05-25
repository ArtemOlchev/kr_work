const dataType_tests = require('./dataType_tests')
const propertyType_tests = require('./propertyType_tests')
const permitType_tests = require('./permitType_tests')
const user_tests = require('./user_tests')
const group_tests = require('./group_tests')
const entity_tests = require('./entity_tests')
const property_tests = require('./property_tests')
const object_tests = require('./object_tests')
const userGroup_tests = require('./userGroup_tests')
const permit_tests = require('./permit_tests')

async function tests(){
    await dataType_tests()
    // await permitType_tests()
    await entity_tests()
    await property_tests()
    await object_tests()
    await user_tests()
    await group_tests()
    await userGroup_tests()
    await permit_tests()
}

tests()