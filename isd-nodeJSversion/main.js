const user = require('./models/user')

async function main(){
    
    let u = await user.GetUser('f693aba8-7443-49b5-854a-8d15ed95526f')
    console.log(u)
}

main()