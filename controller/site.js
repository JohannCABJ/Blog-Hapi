'use strict'

const home = (req,h)=>{
    return h.view ('index.hbs', {
        title:'home',
        message:'holaaa, soy un handlebars',
        userCookie:req.state.userCookie//nos manda la información del usuario como tal (si no hay estado no va a pasar nada)
    })
}
const register = (req,h)=>{
    return h.view ('register.hbs', {
        title:'Registro',
        message: 'Vamos, regístrate ¡¡',
        userCookie:req.state.userCookie//nos manda la información del usuario como tal (si no hay estado no va a pasar nada)
    })
}
const validate = (req,h)=>{
    return h.view('login.hbs',{
        title:'Ingreso al sistema',
        message:'Estas a punto de entrar a nuestra web app',
        userCookie:req.state.userCookie//nos manda la información del usuario como tal (si no hay estado no va a pasar nada)
    })
}

module.exports= {
    register:register,
    home:home,
    validate:validate
}