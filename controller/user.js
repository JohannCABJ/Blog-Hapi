'user strict'

const users = require ('../models/index.js').users //traemos el index que es el principal del directorio models con la propiedad users que es la que estoy exportando


const createUser = async(req,h)=>{
    let result
    try{
        result = await users.create(req.payload)//req.payload>>el obejto donde recibo los parámetros que nos envia el formulario (aqui creamos el usuario)
        console.log(req.payload)
        //return h.response(`Usuario creado con el ID: ${result}`)
    }catch(error){
        console.error(error)
        return h.response('Problemas creando el usuario').code(500)
    }
    return h.response(`Usuario creado con el ID: ${result}`) //tambien sirve dentro del try{}
}

function logout (req,h){ //creamos el loguot que definimos en routes.js para hacer que el usuario cierre sesión
    return h.redirect('/validate').unstate('userCookie')//redirect('login')lo que hacemos es responder con un redirect hacia el login(despues de que el usuario haga logout)//.unstate('userCookie')(lo que hace es remover la cookie)//('userCookie')(nombre de la cookie que quiero quitar)
}



const validateUsers = async (req,h)=>{
    let result
        try{
            result =  await users.validateUsers(req.payload)
            if (!result){
                return h.response('Usuario y/o contraseña incorrecto').code(401)
            }
        }catch(error){
            console.error(error)
            return h.response('Problemas validando el usuario').code(500)
        }
        return h.redirect('/').state('userCookie',{ //El estado nos permite especificar que va a llevar la cookie 'userCookie' es el nombre de la cookie que le dimos en el index.js y las propiedades que va a tener son las soguientes
           name:result.name, //name (que lo tenemos del result)
           email:result.email //son los valores que vienen del result el cual valida si el usuario que intenta ingresar es valido o no, esto a través del result
    })

}

module.exports = {
    createUser:createUser,
    validateUsers:validateUsers,
    logout:logout
}