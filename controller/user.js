'user strict'

const users = require ('../models/index.js').users //traemos el index que es el principal del directorio models con la propiedad users que es la que estoy exportando
const Boom = require ('@hapi/boom') //para el manejo de errores

const createUser = async(req,h)=>{
    let result
    try{
        result = await users.create(req.payload)//req.payload>>el obejto donde recibo los parámetros que nos envia el formulario (aqui creamos el usuario)
        console.log(req.payload)
        //return h.response(`Usuario creado con el ID: ${result}`)
    }catch(error){
        console.error(error)
        return h.view('register',{     //renderizamos register.hbs ya que tienen sentido porque estamos en el handler de crear usuario
            title:'Registro', //las propiedades que le vamos a enviar al usuario
            error: 'Error creando el usuario'//Como estamos en el catch, es decir que hubo error al crear el usuario, por eso vamos a pasar el error
        })
    }
    return h.view ('register',{  //tambien sirve dentro del try{}
        title:'Creación de usuario',
        message:'Creacion de usuario satisfactoria',
        success:'Usuario creado satisfactoriamente'
    })
}

function logout (req,h){ //creamos el loguot que definimos en routes.js para hacer que el usuario cierre sesión
    return h.redirect('/validate').unstate('userCookie')//redirect('login')lo que hacemos es responder con un redirect hacia el login(despues de que el usuario haga logout)//.unstate('userCookie')(lo que hace es remover la cookie)//('userCookie')(nombre de la cookie que quiero quitar)
}

const validateUsers = async (req,h)=>{
    let result
        try{
            result =  await users.validateUsers(req.payload)
            if (!result){
                return h.view('login',{
                    title:'Login',
                    error:'Email o contraseña incorrecta'
                })
            }
        }catch(error){
            console.error(error)
                return h.view('login',{
                title:'Login',
                error:'Problemas validando el usuario'
            })
        }
        return h.redirect('/').state('userCookie',{ //El estado nos permite especificar que va a llevar la cookie 'userCookie' es el nombre de la cookie que le dimos en el index.js y las propiedades que va a tener son las soguientes
           name:result.name, //name (que lo tenemos del result)
           email:result.email //son los valores que vienen del result el cual valida si el usuario que intenta ingresar es valido o no, esto a través del result
    })

}
const failValidation = (req, h, err) =>{ //además del req y h, recibe por parámetro el error, que será el que nos va a indicar que pasó extactamente
    const templates = {
        '/create-user':'register', //createuser//la accion que se ejecuta en el reigstro (el path para ir a registrarse //register//la vista que renderiza la ruta create-user
        '/validate-user':'login', //validate //accion de loguearse, //login //vista que renderiza la ruta validate
        '/create-question':'ask'
    }
    return h.view (templates[req.path],{ //con esto mostrarmos el layout disponible en la const templates dependiendo de la ruta en la que caiga (ya sea create-user ó validate)
        title:'Error de validacion',
        error:'Por favor complete los campos requeridos'
    }).code(400).takeover() //Ponemos codigo 400 porque es un badRequest y con esto reemplazamos la osguente linea de Boom
    //return Boom.badRequest('Falló la validación', req.payload)  //aqui lanzamos un bad request, el cual en su primer parámetro lleva un mensaje,y el segundo parámetro es lo que estamos validando, en este caso estamos validando lo que ingresó el usuario cuando spretendia darse de alta
}
module.exports = {
    createUser:createUser,
    validateUsers:validateUsers,
    logout:logout,
    failValidation:failValidation
}