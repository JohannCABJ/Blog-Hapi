'use strict'

const questions = require('../models/index').questions

const home = async (req,h)=>{
    const data = await req.server.methods.getLast(10)//recordemos que los metodos del servidor los accedemos desde el request//.getLast(10)>>el parámetro que le pasamos para recuperar las ultimas 10 preguntas

    return h.view ('index.hbs', {
        title:'home',
        message:'holaaa, soy un handlebars',
        userCookie:req.state.userCookie,//nos manda la información del usuario como tal (si no hay estado no va a pasar nada)
        questions:data
    })
}
const register = (req,h)=>{
    if(req.state.userCookie){ //Esta validacion es para verificar si hay un usuario logueado
        return h.redirect('/') //enviamos al usuario logueado al home del sitio
    }
    return h.view ('register.hbs', {
        title:'Registro',
        message: 'Vamos, regístrate ¡¡',
        userCookie:req.state.userCookie//nos manda la información del usuario como tal (si no hay estado no va a pasar nada)
    })
}
const validate = (req,h)=>{
    if(req.state.user){ //Esta validacion es para verificar si hay un usuario logueado
        return h.redirect('/') //enviamos al usuario logueado al home del sitio
    }
    return h.view('login.hbs',{
        title:'Ingreso al sistema',
        message:'Estas a punto de entrar a nuestra web app',
        userCookie:req.state.userCookie//nos manda la información del usuario como tal (si no hay estado no va a pasar nada)
    })
}

const viewQuestion = async (req, h)=>{   //como esta consumiendo datos del modelo debemos pasarla de modo asincrono, esto vamos a enlazarlo a una ruta
    let data //aqui vamos a almacenar la información
    try {
        data = await questions.getOne(req.params.id) //params>>es un objeto que nos permite traer el parámetro de la ruta//id>>nombre de la variable que necesitamos en este caso
        console.log(data)
        if (!data){  //nos puede o no, devolver un valor
            return notFound (req,h) //si la pregunta no existe devolvemos el método notFound(definido despues de este (lineas abajo)) con el cual manejamos el 404
        }
    } catch (error) {
        console.error('aqui tambien',error)
    }
    return h.view ('question',{
        title:'Detalles de la pregunta',
        userCookie:req.state.userCookie, //para saber si el usuario está logueado y así imprimir los botones segun el estado
        question:data, //question es el objeto que ya recuperamos de firebase
        key:req.params.id //key>>es el ID de la pregunta
    })
}
const notFound = (req,h) =>{
    return h.view('404', {}, {layout:'error-layout'}).code(404)
}

const fileNotFound = (req,h) =>{ //validacion de estaticos o assets
    const response = req.response //aqui obtenemos el objeto response del request
    if (!req.path.startsWith('/api') && response.isBoom && response.output.statusCode === 404) {//preguntamos si este response tiene una variable que se llama isBoom, esto con el fin de interceptar el error && output.statusCode //Accedemos a la propiedad de statuscode de este response para ver si devuelve un 404//!req.path.startsWith('/api')>>si en el browser no viene la ruta /api siga con el boom de usuario (error para el usuario), si viene ruta '/api' entonces muestre error de desarrollador (404 de la api, en JSON)
        return h.view ('404',{ }, {layout:'error-layout'}).code (404) //Ya con la validacion del error, en caso de que suceda podemos retornar una vista
    }
    return h.continue //lo que hace es continuar con el lifecycle del request si este no se cumple (si no se cumple con el if)
}

const ask = (req,h)=>{
     if(!req.state.userCookie){ //Esta validacion es para verificar si hay un usuario logueado, para hacer preguntas se debe estar logueado
        return h.redirect('/validate') //como no está logueado lo enviamos a la ruta del login
    }
        return h.view('ask',{   //si esto pasa entonces ya podemos renderizar la vista
            title:'Crear pregunta',
            userCookie: req.state.userCookie  //para que se vea el nombre del usuario que está haciendo la pregunta
        })
}
    module.exports= {
    register:register,
    ask:ask,
    viewQuestion,
    home:home,
    validate:validate,
    fileNotFound:fileNotFound,
    notFound:notFound
}