'use strict'

const firebase = require('firebase-admin')
const serviceAccount = require('../config/FirebasePruebaOverflow.json')

firebase.initializeApp({
    credential:firebase.credential.cert(serviceAccount),
    databaseURL:'https://prueba-overflow.firebaseio.com/'
})

const db = firebase.database() //Esto crea la conexión con la DB y nos da un modelo básico

const Users = require('./users') //Importamos el modelo de usuarios a este archivo principal ('/.Users')>>porque está en este mismo directorio (models)
const Questions = require('./questions')

module.exports = {
    users:new Users(db), //Una nueva instanacia de la clase para que cada vez que se importe el modelo tengamos una solo instancia de la referencia de usuarios de firebase
    questions:new Questions(db) //exportamos una instancio de la clase (con new) para que no haya duplicados
}

