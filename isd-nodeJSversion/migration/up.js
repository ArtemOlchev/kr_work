let type = require('../models/propertyType')
let dataType = require('../models/dataType')

// 11.02.2023
let dataTypes = [
    {
        id: 'e3026503-1aa0-4bd0-a637-562431abe516',
        code: 'integer',
        name: 'Целое число' 
    },
    {
        id: '774436ad-597c-4f5f-9da9-8e87960901d5',
        code: 'numeric(12, 2)',
        name: 'Вещественное число' 
    },
    {
        id: '76d813c3-7fef-40d7-9ecf-db2c6abc229b',
        code: 'varchar(2000)',
        name: 'Строка' 
    },
    {
        id: 'cf8293e3-dd35-43e6-b57d-95be66949fa9',
        code: 'varchar(36)',
        name: 'Ссылка' 
    },
    {
        id: 'c694561a-105f-4ca6-ace3-2a68353d6326',
        code: 'timestamp',
        name: 'Дата и время' 
    },
]

let types = [
    {
        id: '7ab92b3c-dbad-464e-b3fd-5deed23def99',
        code: 'reference',
        name: 'Ссылка' 
    },
    {
        id: 'aad87ab3-e982-4d99-b8b9-b421ada915fa',
        code: 'value',
        name: 'Значение' 
    },
]

for (let t of types) {
    type.SavePropertyType(t)
}

for (let dt of dataTypes) {
    dataType.SaveDataType(dt)
}