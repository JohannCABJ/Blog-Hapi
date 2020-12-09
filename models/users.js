'user strict'

const bcrypt = require('bcrypt')

class Users {//funcion que nos va a permitir crear usuarios en la DB
    constructor (db) {//Aqui recibe la DB ya inicializada
    this.db = db //=db ya que fue lo que recibimos por el constructor
    this.ref = this.db.ref('/')//Como firebase funciona con referencias vamos a referenciar donde va a trabajar este modelo,(this.db>>La DB que acabamos de guardar, ('/')>> referenciamos la raiz de la DB )
    this.collection = this.ref.child('users')//Aqui creamos una colección, this.ref.child(users)>> estamos creando un hijo en la raiz y el hijo se va a llamar users (nombre de la 'tabla' en la DB), con esto vamos a crear objetos dentro de una referencia que se llama users y es ahi donde vamos a crear todos nuestros usuarios
    }
    async create (data){//crear un metodo de esta clase (firebase almacena de forma asíncrona) (data)>> recibimos la información a crear
        data.password = await this.constructor.encrypt(data.password)//Aqui estamos esperando la encriptacion del passwd como tal y la está guardando dentro de data.password
        const user = {
            ...data
        }
        user.password =await
        this.constructor.encrypt(user.password)
        const newUser = this.collection.push(user) //Guardamos la información .push >> va a crear una nueva referencia dentro de esta colección
       // newUser.set(data) //.set >> para guardar la información, (data)>> la info que nos llega
        return newUser.key //devolvemos la referencia del nuevo objeto creado que esta almacenado en la propiedad .key
    }

    async validateUsers(data){
        const userQuery = await this.collection.orderByChild('email').equalTo(data.email).once('value')
        const userFound = userQuery.val()
        console.log(userFound)

        if (userFound){
            const userID =  Object.keys(userFound)[0]
            const passwordRight = bcrypt.compare (data.password,userFound[userID].password)
            const result = (passwordRight) ? userFound[userID]:false

            console.log(userID)
            console.log(data.password)
            console.log(userFound[userID].password)
            console.log(passwordRight)
            console.log(result)

            return result
        }
        return false
    }

static async encrypt (password) {//Con bcrypt inmportado vamos a crear un nuevo método de forma asícncrona.AQUI VAMOS A ENCRYIPTAR EL PSSWD COMO TAL (passwd)>>recibimos el psswd
    const saltRound = 10 //conf. del salt que es un parámetro que nos pide bcrypt
    const hashedPassword = await bcrypt.hash (password,saltRound) //Este es el psswd que va a ser encryptado bcrypt.hash>>devuelve una promesa (por eso el await) bcrypt.hash>> tiene dos parámetros, 1.El psswd a encriptar y 2.el SaltRound
    return hashedPassword

    }
}
module.exports = Users