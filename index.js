'use strict'

const Hapi = require ('@hapi/hapi')
//import Hapi from 'hapi'
const inert = require ('@hapi/inert')
const path = require('path')
const good = require('@hapi/good')
const routes = require('./routes')
const handlebars = require('./lib/helpers')
const site = require('./controller/site')
const vision = require('@hapi/vision')
const methods = require ('./lib/methods')
const blankie = require('blankie')
const scooter = require('@hapi/scooter')
const hapiDevErrors =  require('hapi-dev-errors')


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
        await server.register(inert) //poner esta linea para que no devuelva error de h.file iS not a function, con esto le decimos a hapi que vamos a usar inert, ya que solo con importarlo no basta
        await server.register(vision)

        await server.register ({ //good se regsitra de una forma muy diferente de las que hemos visto hasta ahora,//vamos a registrar a good con la otra forma que existe para registrar un plugin que es con un objeto
            plugin:good, //Es el módulo que ya requerimos
            ops:{ //aqui las options de good que son los 'reportes'
            interval: 2000,
            },
                reporters:{ //reportes es la propiedad que define cuales son los transporters del logging
                    myConsoleReporter:[
                        {
                            module:'good-console' //module>>el modulo que va a usar el cual es good-console, que ya lo instalamos
                        },
                        'stdout' //imprimimos aqui que es la salida standard
                    ]
                }
        })

        await server.register([scooter, { //register admite resgitrar dos plugins en un solo register, gracias a que se meten en un array
            plugin: blankie,
            options: { //aqui definimos la opciones de blankie como tal (estan descritas en la documentacion del plugin),basicamente se definen los parámetros de CSP
              defaultSrc: `'self' 'unsafe-inline'`, //defautlSrc>>desde donde podemos requerir cosas//self>>aceptamos scripts desde self//unsafe-inline>>para que nos deje poner codigo CSS en linea (tenemos algunos asi)
              styleSrc: `'self' 'unsafe-inline' https://maxcdn.bootstrapcdn.com`,//styleSrc>>Le vamos a decir desde donde podemos requerir estilos, por ahora nuestros estilos vienen desde self (todo nuestro CSS esta desde self), pero como usamos bootstrap podemos usar el CDN de boostrap como tal
              fontSrc: `'self' 'unsafe-inline' data:`,//fontSrc>>es el origen de las fuentes que usamos,//data>>tambien podemos aceptar ademas de las fuentes en linea (unsafe-inline),adeptar fuentes con data(algunas plantillas de bootsrtap lo utilizan, por lo tanto lo aseguramos de una vez)
              scriptSrc: `'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://maxcdn.bootstrapcdn.com/ https://code.jquery.com/`,//tenemos de diferenes origenes el código, por lo tanto tenemos que hacer referencia a las url de donde obtenemos el script (por lo que usamos bootstrap)
              generateNonces: false //Esta propiedad hace que se genere unas anotaciones adicionales que ahora no la deseamos en este momento
            }
        }])
        await server.register({
            plugin:hapiDevErrors,
            options:{
                showErrors: process.env.NODE_ENV !== 'prod' //showErrors es la que va a activar el plugin, si esto es diferente de prod vamoos a mostrar los errores
            }
        })
        await server.register({ //Para registrar el plugin vamos a utilizar la misma estructura que utilizamos para registrar Boom
            plugin:require('./lib/api'),
            options:{
                prefix:'api' //aqui le pasamos el prefijo que definimos en api.js donde de dejamos como default uno con el mismo nombre que definimos aqui 'api', si aqui no lo definieramos, por default lo dejaria como 'api' ya que así lo dejamos predeterminado en 'api.js'
            }
        })

        server.method('setAnswerRight', methods.setAnswerRight) //para regitrar los metodos vamos a pasarle dos paramaetros, el primero es nombre(cualquiera),el segundo el método en si, la función, el código que se va a ejecutar
        server.method('getLast',methods.getLast, {
            cache:{
                expiresIn: 1000 * 60, //cacheamos el home en el servidor por 1 minuto
                generateTimeout:2000//la idea de esta propiedad es la de eu si el método falla despues de este tiempo (2000 ms)se genere un error o se vaya automaticamente a ejecutar por fuera del caché 
            }
        })

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
        server.ext ('onPreResponse', site.fileNotFound) //server.ext//método del servidor que nos permite escuchar un hook del lifecycle 'onPreResponse'//significa antes de que se envie la respuesta analice el controlador de site site.fileNotFound//intecpeta el response con la funcion que hay en site.fileNotFound
        server.route (routes)
        await server.start()
    }catch(error){
        console.error(error)
        process.exit(1)
    }
    console.log (`Servidor lanzado en ${server.info.uri}`)
    server.log('info',`Servidor lanzado en ${server.info.uri}`)//la sitnaxis de server.log es:como primer parámetro viene in 'TAG',seguido del mensaje que queremos mostrar en la console
}

process.on ('unhandledRejection', error =>{   //unhandledRejection (tiene dos parámetros, el 1. el 'unhandledException' y el 2. El cb con el error), error que nos genera una promesa que no está siendo controlada, siendo esto un catchOut de todos estos errores a nivel de proceso //error=> (funcion que loguea la excepcion)
    console.error('unhandledRejection',error.message,error)
    server.log('unhandledRejection',error)  //loguenamos el error, decimos que es un unhandledRejection, definimos el error.message, error (imprimimos el error completo)
})

process.on('unhandledException', error => { //unhandledException es un error general de todo el sistema cuando hay una excepcion que no fue controlada
    console.error ('unhandledException', error.message, error)
    server.log('unhandledException',error)
} )
init()