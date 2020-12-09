'use strict'

const site = require('./controller/site')
const user = require('./controller/user')
const Joi = require('joi')

module.exports = [
{
    method:'GET',
    path:'/',
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
    method:'POST',
    path:'/create-user',
    handler:user.createUser,
    options:{
        validate:{
            payload:Joi.object({
                name: Joi.string().required().min(3),
                email:Joi.string().required().email(),
                password:Joi.string().required().min(6)
            })
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
            })
        }
    }
},
{
    method:'GET',
    path:'/{param*}', //comodín para hacer la ruta más general
    handler:{
        directory:{
            path:'.',
            index:['index.html']
        }
    }
}
]