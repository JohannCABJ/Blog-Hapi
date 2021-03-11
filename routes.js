'use strict'

const site = require('./controller/site')
const user = require('./controller/user')
const Joi = require('@hapi/joi')
const question = require('./controller/question')

module.exports = [
{
    method:'GET',
    path:'/',
    options:{ //objeto donde configuramos las opciones del caché
        cache:{ //definimos las propieades del caché
            expiresIn: 1000 * 30, //especificamos la duración del cache,//1000*3>>(3 miliseg ó 30 seg.)
            privacy:'private' //privacidad del caché
        }
    },
    handler: site.home
},
{
    method:'GET',
    path:'/register',
    handler: site.register
},
{
    method:'GET',
    path:'/validate',
    handler: site.validate

},
{
    method:'GET',
    path:'/logout',
    handler: user.logout

},

{
    method:'GET',
    path:'/question/{id}', //para definir un parametro en una ruta de hapi usamos{}y dentro la variable con la que se debe leer, esto permite leer con el objeto de params luego esa variable que en este caso es el id del objeto (la pregunta)que intentamos recuperar de firebase
    handler:site.viewQuestion //de esta manera ya tenemos una ruta que podemos consumir para marcar la repuesta correcta
},
{
    method:'GET',
    path:'/ask',
    handler: site.ask

},
{
    method:'POST',
    path:'/create-user',
    handler:user.createUser,
    options:{
        validate:{
            payload:Joi.object({
                name: Joi.string().required().min(3),
                email:Joi.string().required().email(),
                password:Joi.string().required().min(6)
            }),
            failAction:user.failValidation //creamos una funcion el controlador de user.js que se llame failValidation y nos va a permitir controlar todo esto
    }
        }
},
{
    method:'POST',
    path:'/validate-user',
    handler:user.validateUsers,
    options:{
        validate:{
            payload:Joi.object({
                email:Joi.string().required().email(),
                password:Joi.string().required().min(6)
            }),
            failAction:user.failValidation
        }
    }
},
{
    method:'POST',
    path:'/create-question',
    handler:question.createQuestion,
    options:{
        payload:{
            multipart:true,
            parse:true
        },
        validate:{
            payload:Joi.object({
                title:Joi.string().required(),
                description:Joi.string().required(),
                image:Joi.any().optional(),
                }),
            failAction:user.failValidation
        }
    }
},
{
    method:'POST',
    path:'/answer-question',
    handler:question.answerQuestion,
    options:{
        validate:{
            payload:Joi.object({
                answer:Joi.string().required(),
                id:Joi.string().required()
            }),
            failAction:user.failValidation
        }
    }
},
{
    method:'GET',
    path:'/answer/{questionId}/{answerId}', //esta ruta lleva 2 parámetros, por lo que la ruta va a recibir ambos parámetros
    handler:question.setAnswerRight
},
{
    method:'GET',
    path:'/assets/{param*}', //assets (prefijo) todos los assets van a estar servidos desde esta url (tendremos que cambiar nuestros layout para que lo reflejen)
    handler:{
        directory:{
            path:'.',
            index:['index.html']
        }
    }
},
{
    method:['GET','POST'], //para definiri que metodos pueden acceder a esta ruta (en este caso GET y POST) los metemos en un array para poder meter varios,
    path: '/{any*}',    //Este es un path con comodin, es decir para cualquier parámetro que esté ahi (es decir cualquier cosa que caiga en cualquier ruta)
     //las rutas resuleven en orden, es decir que se resolveran todas las rutas que definimos anteriormente y si se llega hasta esta ruta es porque se ha ingresado una ruta que no existe, (por esta razon esta ruta se deja de ultimas porque se resuelven todas las primeras rutas)
    handler: site.notFound  //función del contraolador del site que llamaremos notFound
    }
]