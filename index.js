'use strict'

const Hapi = require ('@hapi/hapi')
//import Hapi from 'hapi'
const inert = require ('@hapi/inert')
const path = require('path')
const routes = require('./routes')
const handlebars = require('handlebars')
const vision = require('@hapi/vision')

const server = Hapi.server({
    port: process.env.PORT || 3000,//para efectos prácticos pasamos el puerto por variables de entorno
    host: 'localhost',
    routes:{
        files:{
            relativeTo: path.join(__dirname,'public')//Esto para que todos los archivos que sirvamos se hagan desde este directorio que ya hemos creado (es decir public)
        }
    }
})

const init = async () =>{

    try {
        await server.register(inert) //poner esta linea para que no devuelva error de h.file in not a function, con esto le decimos a hapi que vamos a usar inert, ya que solo con importarlo no basta
        await server.register(vision)

        server.state('userCookie',{  //server.state tiene dos parametros; 1.El nombre de la cookie y 2.especificando las propiedades
            ttl: 1000 * 60 * 60 * 24 * 7, //ttl: >time to life Se calcula por milisegundos, //1000 =1 segundo //60 =1 minuto //60 = 1hora // 24 =24 horas * 7= 7 dias, con esto estamos dejando valido el time to life por 1 semana
            isSecure:process.env.NODE_ENV ==='prod', //Esta es una propiedad para preguntar si la cookie es seguro o no,como estamos en un localhost de desarrollo se toma como no seguro, para ello preguntamos si el entorno es = al de produccion entonces será una cookie segura si no va a conisderar que la cookie es de desarrollo y por eso sea insegura
            encoding:'base64json'//Aqui especificamos al codificación, decimos que es una cookie hecha en base64 tipo json.
        })


        server.views ({ //en el server.hapi ya viene esta objeto .views el cual es un objeto de configuracion
            engines:{ //engines nos permite definir que motor de plantillas vamos a usar, porque vision soporta muchos motores de plantillas, en nuestro caso es handlebars
                hbs: handlebars //la propiedad hbs hace referencia al motor de plantillas handlebars y le damos el valor handlebars el cual ya tenemos importado, ya con esto vision va a buscar plantillas en hbs y las va a rendereizar con el modulo handlebars
            },
                relativeTo:__dirname, //Esta propieadad la vamos a usar, pero aqui la vamos a configurar al directorio actual (ya no será al public), esto con el fin de que las vistas estén fuera del public, porque esto debe ser código del proyecto
                path:'views', //Aqui le decimos en que rutas van a estar,en este caso debemos tener una carpeta llamada views dentro de nuestro proyecto
                layout:true,//Esta es una característica de handlebars, para que no nos toque repetir los mismos pedazos de html en todas las vistas
                layoutPath:'views' //aqui le decimos donde van a estar los layouts (aqui lo vamos a poner junto con las vistas)
        })

        server.route (routes)
        await server.start()
    }catch(error){
        console.error(error)
        process.exit(1)
    }
    console.log (`Servidor lanzado en ${server.info.uri}`)
}
init()