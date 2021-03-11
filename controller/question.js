'use strict'
const questions = require('../models/index').questions
const {writeFile} = require('fs')//requerimos herramientas específicas de fs(fileSystem) de node, desesrcuturamos para utilizar solo {writeFile} que es la que necesitamos
const {promisify} = require('util')//promisify ya que estamos usando async-await
const {join} = require ('path')
const {v1:uuidv1} = require ('uuid')

const write = promisify(writeFile)//vamos a promoisificar la parte del writefile, hace wrapper de la funcion WriteFile como una promesa y la podemos utilizar con async-await

const createQuestion = async(req,h) =>{ //funcion que controlará la vista como tal, (el handlebar va aqui, por lo tanto trae el req,h)
    if (!req.state.userCookie){
        return h.redirect('/validate')
    }
    let result, filename
    try {
        var x = Buffer.from(req.payload.image)
        console.log(x)
        if (Buffer.isBuffer(x)){ //image sera el campo que le pondremos al frm, con esto lo que hacemos es verificar si llegó un buffer para almacenar el archivo, si hay buffer es porque enviaron archivo para almacenar
            filename = `${uuidv1()}.png` //${uuid}`>>llamamos al modulo que nos va a generar el nombre devolviendos un string/ que es el que le pone el nombre al archivo//.png>>solo recibiremos archivos png
            await write(join(__dirname,'..','public','uploads',filename),req.payload.image) //aqui vamos a escribir el archivo //write>>es la version promificada de writeFile//(join) es lo que pusimos de path para tener la ruta//__dirname>>es el directorio actual//'..'>>subimos un nivel porque estamos en el directorio de controladores y tenemos que ir a la carpeta 'public'//'uploads'//la carpeta donde vamos a guaradar los archjivos que se suban//filename>>es el nombre del archivo(que lo tenemos arriba con el uuid)//req.payload.image>>la informacion como tal que nos llega por el formulario
        }else{
            console.log('no viene imagen')
        }
        result = await questions.create(req.payload, req.state.userCookie,filename) //questions.create()>>recibe el payload que viene del frm enviado por el usuario, //req.state.usercookie>>tambien tenemos que enviar el usuario el cual tenemos en la cookie 'userCookie' CON ESTO YA TENEMOS LO NECESARIO PARA CREAR UNA PREGUNTA QUE SE LO ENVIAMOS A LA FUCNION CREATE DEL MODELO QUESTION.JS
        console.log(`Pregunta creada con el ID ${result}`)
        console.log(filename)
    } catch (error) {
        console.error(`Ocurrio un error ${error}`)

        return h.view ('ask',{
            title:'Crear pregunta',
            error:'Problema creando la pregunta'
        }).code(500).takeover() //el .code(500) es opcional //takeover()ya que no me interesa que este request vaya mas allá del ciclo como tal por eso hay que ponerlo para que responda inmeditamente
    }

    return h.redirect(`question/${result}`)//si todo sale bien
    }

const answerQuestion = async (req,h) =>{
    if (!req.state.userCookie){
        return h.redirect('/validate')
    }
    let result //definimos una variable para el resultado
    try {
        result = await questions.answer(req.payload,req.state.userCookie) //questions>>que es nuestro modelo
        console.log(`Respuesta insertada ${result}`)//si se inserta la respuesta vamos a imprimirla,//${result}>>es una referencia de firebase
    } catch (error) {
        console.error(error)
    }
    return h.redirect (`/question/${req.payload.id}`)  //'/question/redireccionamos a la ruta de la pregunta, retornar a la ruta de la pregunta//'/{req.payload.id}'>>parametro de la ruta, con esto estamos redireccionando el usuario despues de responder a la pregunta que se está respondiendo
}

async function setAnswerRight (req,h){
    if (!req.state.userCookie){
        return h.redirect('/validate')
    }
    let result
    try{
        result = await req.server.methods.setAnswerRight(req.params.questionId, req.params.answerId,req.state.userCookie)//hacemos await del método como tal//aqui vamos a usar el metodo de servidor, sacandolo del objeto request//req.server.methods.setAnswerRight>>aqui ejecutamos el metodo como tal(setAnswerRight), este metodo ya está guardado//req.params.questionId,req.params.answerId,req.state.userCookie>>estos son los parámetros que requiere, con esto ya tenemos la ejecucion del codigo como tal
        //console.log(req.params.questionId)
       // console.log(req.params.answerId)
        console.log(result)
    }catch(error){
        console.error(error)
    }
    return h.redirect(`/question/${req.params.questionId}`) //si todo funciona redireccionamos a la ruta de la pregunta
}

    module.exports = {
        createQuestion:createQuestion,
        setAnswerRight,
        answerQuestion
    }