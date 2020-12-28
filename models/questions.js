'use strict'

class Questions {
    constructor (db){ //el constructor recibe la DB (es decir la instancia de firebase como tal) que configuramos previamente en el index.js del modelo
        this.db = db
        this.ref = this.db.ref('/') //this.ref>>creamos una referencia, this.db.ref('/')>>referenciamos la raiz
        this.collection = this.ref.child('questions') //creamos la colección (tabla en la DB)la cual identificaremos en firebase como questions
    }

async create (data, user) { //creamos la función que creará las preguntas (lo hacemnos asincrono porque tenemos que hacer await de varias cosas) //data>>recibimos la info, //usuario>>el user que la esta creando (recordemos que el usuario ya está en una cookie)
    const ask = {
        ...data
    }
    ask.owner = user//de esta forma seteampos la información del usuario, para que el usuario que creó la pregunta quede dentro del objeto data (lo que viene por el frm de crear la pregunta)
    const question = this.collection.push()//aqui insertamos el resultado de la inserción en esta variable, //this.collection.push ()>> lo que hace es crear la referencia
    question.set(ask) //le damos la informacion a la referencia creada en la variable question, //question.set(data)>>esto haria la inserción

    return question.key //firebase devuelve una referencia, un key
}

async getLast (amount) {//con esta funcion obtenemos las ultimas preguntas, lo hacemos parametrizable (para que se puedan incluir el # de preguntas a mostrar)
    const query = await this.collection.limitToLast (amount).once('value')  //hacemos el query //limitToLast>>es una propiedad de Firebase que nos permite es recuperar los últimos 'X' registros que en este caso es lo que le pasamos en amount//.once(value)>>como este es un proceso asincrono, esperamos enotnces un valor, ya con esto tenemnos la promesa resuelta
    const data = query.val()//obtenemos el valor del query, devolviendonos la consulta
    return data
}

async getOne (id) { //getOne>>va a recibir el ID de una pregunta que vamos a encontrarr
    const query =  await this.collection.child(id).once('value') //definimos un query//.child(id)>>esto va a seleccionar el hijo con ese ID //.once('value')>>esperamos el valor devolviendonos el objeto del cual ontendremos la información
    const data = query.val() //almacenamos en data //query.val() >>nos retorna el valor como tal
    console.log(data)
    return data //retornamos la información al usuario
}
async answer (data,userCookie){ //data>>es un objeto del payload,//user>>el usuario que está respondiendo
    const answers = await  this.collection.child(data.id).child('answers').push()//incresión de la respuesta a firebase//data.id>>es el payload de la pregutna que estamos respondiendo el cual debe incluir el id de la pregunta//child('answers')>>para seleccionar internamente el objeto de respuestas, en donde cada pregunta va a tener un arreglo de respuestas dentro//.push()>>es la inserción
    answers.set({text:data.answer, user:userCookie})  //le damos los valores a answers, //{text:data.answer, user:userCookie}>>le damos el valor a la respuesta, esto va a insertar la respuesta dentro del objeto de answer de la pregunta que tenemos actualmente
    return answers
}
}
module.exports = Questions