'use strict'
const questions = require('../models/index').questions

const createQuestion = async(req,h) =>{ //funcion que controlará la vista como tal, (el handlebar va aqui, por lo tanto trae el req,h)
    let result

    try {
        result = await questions.create(req.payload, req.state.userCookie) //questions.create()>>recibe el payload que viene del frm enviado por el usuario, //req.state.usercookie>>tambien tenemos que enviar el usuario el cual tenemos en la cookie 'userCookie' CON ESTO YA TENEMOS LO NECESARIO PARA CREAR UNA PREGUNTA QUE SE LO ENVIAMOS A LA FUCNION CREATE DEL MODELO QUESTION.JS
        console.log(`Pregunta creada con el ID ${result}`)
    } catch (error) {
        console.error(`Ocurrio un error ${error}`)

        return h.view ('ask',{
            title:'Crear pregunta',
            error:'Problema creando la pregunta'
        }).code(500).takeover() //el .code(500) es opcional //takeover()ya que no me interesa que este request vaya mas allá del ciclo como tal por eso hay que ponerlo para que responda inmeditamente
    }

    return h.response(`Pregunta creada con el ID ${result}`)//si todo sale bien
    }

const answerQuestion = async (req,h) =>{
    let result //definimos una variable para el resultado
    try {
        result = await questions.answer(req.payload,req.state.userCookie) //questions>>que es nuestro modelo
        console.log(`Respuesta insertada ${result}`)//si se inserta la respuesta vamos a imprimirla,//${result}>>es una referencia de firebase
    } catch (error) {
        console.error(error)
    }
    return h.redirect (`/question/${req.payload.id}`)  //'/question/redireccionamos a la ruta de la pregunta, retornar a la ruta de la pregunta//'/{req.payload.id}'>>parametro de la ruta, con esto estamos redireccionando el usuario despues de responder a la pregunta que se está respondiendo
}

    module.exports = {
        createQuestion:createQuestion,
        answerQuestion
    }