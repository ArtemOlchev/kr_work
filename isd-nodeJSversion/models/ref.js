function Ref(obj) {
    if (!obj) throw new Error('Ref(): Не передан obj')
    if (!obj.id) throw new Error('Ref(): У obj не указан id')
    if (!obj.name) throw new Error('Ref(): У obj не указан name')
    this.id = obj.id
    this.name = obj.name
    if (obj.code) this.code = obj.code
}

module.exports = Ref