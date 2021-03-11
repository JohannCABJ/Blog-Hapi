'use strict'
const questions = require('../models/index').questions

const setAnswerRight = async (questionId,answerId,userCookie)=>{  //funcion asincrona porque va a trabajar con el modelo
    let result //vamos a poner un resultado

    try {   //ahora en el try-catch a  usar el modelo
        result = await questions.setAnswerRight(questionId,answerId,userCookie) //(questionId,answerId,userCookie)>>ya tenemos los parametros para usarlo
    } catch (error) {
        return  false
    }
    return result
}
const getLast = async (amount)=>{ //con esto volvemos a getLast un metodo de servidor (trayendonos esta misma funciones desde site.js (en la función llamada gestLast de site.js))
    let data
    try {
        data = await questions.getLast(amount) //recuperamos las últimas 10 preguntas desde firebase
    } catch (error) {
        console.error(error)
    }
    console.log('Se ejecutó el método')
    return data
}

module.exports = {
    getLast,
    setAnswerRight
}