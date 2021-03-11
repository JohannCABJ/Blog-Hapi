'use strict'

const authBasic = require('@hapi/basic')
const Joi = require('joi')
const questions = require('../models/index').questions
const Boom = require('@hapi/boom')
const users =  require('../models/index').users

module.exports = {
    name:'api-rest', //nombre de nuestro plugin
    version:'1.0.0',
    async register (server,options) { //el metodo register lo vamos a hacer asincrono porque vamos a consumir funciones del modelo
        const prefix = options.prefix || 'api' //vamos a definir el prefijo de la ruta con el cual vamos a registrar el plugin, aqui registramos las rutas necesarias para el plugin //options.prefix>>es la unica opcion que vamos a usar//|| 'api>>con esto estamos diciendo que la ruta será /api

    await server.register(require('@hapi/basic'))
    server.auth.strategy('simple','basic', {validate:validateAuth})//strategy recibe un nombre (simple)//basic>>es el esquema el cual debemos instalar, el tercer parametro son unas opciones las cuales son un método, que en este casi (validate) es el metodo que va a validar a los usuarios

    server.route({ //hacemos el registro de rutas como haciamos en nuestro primer servidor
        method:'GET', //solo usaremos el metodo, ya que solo queremos obtener una o varias preguntas
        path:`/${prefix}/question/{key}`, //${prefix}>>es le prefijo que definimos arriba (api)///question/{key}>>paramétro de ruta que sería el ID de la pregunta
        options:{
            auth:'simple',//con  el nombre que le pusimos arriba (simple) va a validar, con lo cual la estrategia de autenticación automáticamente va a validar con la función que creamos abajo (validateAuth)
            validate:{
                params: Joi.object({
                    key:Joi.string().required() //solo tenemos una validacion porque tenemos un solo parámetro que sería el ID de la pregunta con esto aeguramos que se pase por parámetro el ID de la pregunta
                }),
                failAction:failValidation
            }
        },
        handler: async (req, h) => { //el handler seria la función que recupera una sola pregunta, método el cual ya tenemos definido cuando es un usuario el que solicita una sola pregunta, eso está en models/questions en la funcion getOne
            let result
            try {
                result = await questions.getOne(req.params.key) //llamamos aqui al modelo de questions (getOne) que es el que obtiene una pregunta específica//(req.params.key)se trae de los parámetros de la ruta y va a consultar la pregunta
                if(!result){
                    return Boom.notFound(`No se pudo encontrar la pregunta ${req.params.key}`)//utilizamos boom para mostrarle correctamente el error al desarrollador si no se llega a obtener la pregunta solicitada en el parámetro (todos los metodos de Boom se debe especificar con return)
                }
            } catch (error) {
                return  Boom.badImplementation(`Hubo un error buscando ${req.params.key} -${error}`) //este mensaje será solo para el desarrollador que es quien está consumiendo el API REST (con la ruta /apì) y al usuario le llegára un error 500
            }
            return result //por defecto hapi responde con JSON, lo cual es perfecto para una API REST
        }
    })
    server.route({ //hacemos el registro de rutas como haciamos en nuestro primer servidor
        method:'GET', //solo usaremos el metodo, ya que solo queremos obtener una o varias preguntas
        path:`/${prefix}/questions/{amount}`, //${prefix}>>es le prefijo que definimos arriba (api)///questions/{asmount}>>paramétro de ruta que sería ela cantidad de preguntas que queremos mostrar
        options:{
            auth:'simple',//con  el nombre que le pusimos arriba (simple) va a validar, con lo cual la estrategia de autenticación automáticamente va a validar con la función que creamos abajo (validateAuth)
            validate:{
                params: Joi.object({
                    amount:Joi.number().integer().min(1).max(20).required() //solo tenemos una validacion porque tenemos un solo parámetro que sería el ID de la pregunta con esto aeguramos que se pase por parámetro el ID de la pregunta, en la validacion como {amount}es la cantiodad de preguntas que queremos mostrar,vamos a esperar que ingresen solo numeros, con cantidad minima y maxima de pregutnas a mostrar
                }),
                failAction:failValidation
            }
        },
        handler: async (req, h) => { //el handler seria la función que recupera una sola pregunta, método el cual ya tenemos definido cuando es un usuario el que solicita una sola pregunta, eso está en models/questions en la funcion getOne
            let result
            try {
                result = await questions.getLast(req.params.amount) //llamamos aqui al modelo de questions (getOne) que es el que obtiene una pregunta específica//(req.params.key)se trae de los parámetros de la ruta y va a consultar la pregunta
                if(!result){
                    return Boom.notFound(`No se pudo recuperar las preguntas`)//utilizamos boom para mostrarle correctamente el error al desarrollador si no se llega a obtener la pregunta solicitada en el parámetro (todos los metodos de Boom se debe especificar con return)
                }
            } catch (error) {
                return  Boom.badImplementation(`Hubo un error buscando las preguntas -${error}`) //este mensaje será solo para el desarrollador que es quien está consumiendo el API REST (con la ruta /apì) y al usuario le llegára un error 500
            }
            return result //por defecto hapi responde con JSON, lo cual es perfecto para una API REST
        }
    })

    function failValidation(req,h,err){
        return Boom.badRequest('Por favor use los parametros correctos')//Con esto le decimos al desarrollador que no está usando la API como debe usarse
    }
    async function validateAuth (req, username,passwd,h){ //con esto hacemos validar con estos parámetros (req,username,password) que un usario es valido en nuestro sistema
        let user
        try {
            user = await users.validateUsers({email: username, password: passwd})
        } catch (error) {
            console.error(error)
        }
        return {
            credentials: user || {}, //si hay usuario retornamos un objeto (que sería el usario)//{}>> si el usuario no existe devolvemos un usuario vacio
            isValid:(user !== false) //isValid>>es una propiedad que devuelve true o false donde preguntamos si hay usuario y si lo hay, lo asignamos como válido
        }
    }

    }
}