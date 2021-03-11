'use strict'

class Questions {
    constructor (db){ //el constructor recibe la DB (es decir la instancia de firebase como tal) que configuramos previamente en el index.js del modelo
        this.db = db
        this.ref = this.db.ref('/') //this.ref>>creamos una referencia, this.db.ref('/')>>referenciamos la raiz
        this.collection = this.ref.child('questions') //creamos la colección (tabla en la DB)la cual identificaremos en firebase como questions
    }

async create (info, user, filename) { //creamos la función que creará las preguntas (lo hacemnos asincrono porque tenemos que hacer await de varias cosas) //data>>recibimos la info, //usuario>>el user que la esta creando (recordemos que el usuario ya está en una cookie)
    const ask = {
        description:info.description,
        title:info.title,
        owner: user //de esta forma seteampos la información del usuario, para que el usuario que creó la pregunta quede dentro del objeto data (lo que viene por el frm de crear la pregunta)
    }
    if (filename) { //aqui preguntamos si nos llega filename(es deciri si nos llega archivo adjunto), no guardaremos el archivo en firebase, pero si guardaremos el nombre del archivo para poderlo visuarlizar despues
        ask.filename = filename
    }
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
async setAnswerRight(questionId,answerId,userCookie ) { //questionID>>es el id de la pregunta//answerId>>Es el id de la respuesta//userCookie>>El usuario que la está respondiendo
    const query = await this.collection.child(questionId).once('value')  //le solicitamos a firebase que nos devuelva la pregunta como tal//.child(questionId)>>proque ya tenemos el ID de la pregunta//.once('value')>>cuando consiga la pregunta, tendremos todas las respuestas de esa pregunta//.once('value')>>PORQUE ES UNA PROMESA
    const question = query.val() //transformamos el query en datos//query.val()>>PARA QUE NOS RETORNE EL VALOR DE ESTA PREGUNTA
    const answers = question.answers  //Obtenbemos las respuestas de esta misma pregunta

    if (!userCookie.email === question.owner.email){ //preguntamos si el usuario que tenemos en el email es igual al usuario dueño de la pregunta, esto nos va a garantizar que el usuario si es el dueño de la pregunta
        return false
    }
    for (let key in answers){//para hacer el proceso de responder hacemos el for//let key in answers>>para recorrer todas las respuestas
        answers[key].correct = (key === answerId)//vamos a coger todas las repuestas con su key, devolviendonos la respuesta actual que estamos iterando y le vamos a poner .correct, una nueva propiedad//(key===answerId)>>(key)la variable que estamos iterando es igual answerId,ESTO LO QUE HACE ES MARACAR LA PROPIEDAD CORRECT para la respuesta correcta
        console.log( answers[key].correct)
    }
    const update = await this.collection.child(questionId).child('answers').update(answers)//aqui actualizamos la pregunta//.child(questionId)>>la pregunta//child('answers')>>porque lo que vamos a actualizar es el objeto de respuestas//.update('answers')porque lo que vamos a actualizar es el objeto de respuestas con la nueva información que es 'answers'
    return update
    //console.log(update)
    }
}
module.exports = Questions