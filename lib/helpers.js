'use strict'

const handlebars = require('handlebars') //Hacemos el llamado a handlebars ahora desde aqui

function registerHelpers (){  //con esto vamos a registrar los helpers
    handlebars.registerHelper('answerNumber',(answers) =>{//registerHelper>>es una fucnion que nos permite crear un helper personalizado //el helper tiene dos parametros, el primero es el nombre,el cual recibe una función (2 parametro), esta función recibe un parametro que son las repuestas 
        const keys = Object.keys(answers) //
        return keys.length //est nos devuelve el numero de repsuestas que ya tiene el objeto, como ya esta registrado, podemos usarlo en el home
    })

    handlebars.registerHelper('ifEquals',(a, b, options) =>{ //ifEquals>>debe recibir 2 parametros,1 (a)debe ser el user dueño de la pregunta y el otro (b) debe ser el usuario actual//options>>por definicion debemos poner opciones, porque este es un helper de bloque
        if (a === b) {
            return options.fn (this) //fn>> es una funcion con el contexto actual 
        }
        return options.inverse(this)   //si esto no pasa se debe retornar //options.inverse>>
    })
    return handlebars
}

module.exports = registerHelpers()//exportamos la ejecución de esta función, ejecutnado va a retornar handlebar que es el modulo que necesita vision para poder hacer las plnatillas (views)