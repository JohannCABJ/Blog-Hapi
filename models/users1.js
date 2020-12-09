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
        return newUser.key //devolvemos la referencia del nuevo objeto creado que esta alanmcenado en la propiedad .key
    }

    async validateUser (data){ //metodo en le cual va a permitir realizar la validacion de lo ingresado por el usuario para loguearse(data)>>es la info que viene por el payload(mail.password)ingresado por el usuario
        console.log(data)

        const userQuery = await this.collection.orderByChild('email').equalTo(data.email).once('value')//empezamos a definir como validamos al usuario userQuery>>El query que el usuario debe ejecutar para validarse await this.collection.orderbyChild>>Ordenar por el hijo  de la colleción(es decir la tabla de la DB) en el campo ('email')><ordenar por el email //.equalTo(data.email) lo que hace es una comparación directamente con firebase para verficar que el usuario existe //.once('value') >> como es una promesa esperamos que devuelva un valor con .once('value') la respuesta que nos va a devolver la consulta
        const userFound = userQuery.val() //Aqui obtenemos la respuesta de .once('value') sea cual sea //userQuery.val() >> esto transforma el resultado de la consulta de comparacion de emails en un string o en un objeto

        console.log(userFound)

        if (userFound){ //si encontramos el usuario
            const userID = Object.keys(userFound)[0]//nos traemos el ID del usuario encontrado //Object.keys>>estamos analizando un objeto como tal //(userFound)[0] firebase nos devuelve un objeto que tiene keys para cada uno de los elementos, con esto hacemos es extraer el id que es la clave del objeto,hasta aqui solo hemos identificado que hay un usuario
            const psswdRight = await bcrypt.compare(data.password, userFound[userID].password) //Aqui comparamos la contraseña //bcrypt.compare>>permite comparar un psswd //(data.password, userFound[userId].password)>> estamos comparando el ID que nos pasó el usuario con el password que tenemos en la DB

            console.log(userFound[userID].password)
            console.log(data.password)
            console.log(psswdRight)

            const result = (psswdRight) ? userFound[userID]: false //Para saber el resultado del compare //(psswdRight) ? >>pregutamos si el password es correcto //userfound[userID]: false>si esta bien devolvemos el objeto del usuario, si no devolvemos falso

            return result //si hay usuario lo retornamos

        }
            return ('No se ha encontrado el usuario, changos') //si no se encuentra ningun usario se retorna falso para controlar el error de que no se encontró el usuario
    }

static async encrypt (password) {//Con bcrypt inmportado vamos a crear un nuevo método de forma asícncrona.AQUI VAMOS A ENCRYIPTAR EL PSSWD COMO TAL (passwd)>>recibimos el psswd
    const saltRound = 10 //conf. del salt que es un parámetro que nos pide bcrypt
    const hashedPassword = await bcrypt.hash (password,saltRound) //Este es el psswd que va a ser encryptado bcrypt.hash>>devuelve una promesa (por eso el await) bcrypt.hash>> tiene dos parámetros, 1.El psswd a encriptar y 2.el SaltRound
    return hashedPassword

    }
}
module.exports = Users