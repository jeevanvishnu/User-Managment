const express = require('express')
const app =express()
const userRoute = require('./routers/userRoute')
const adminRoute = require('./routers/adminRoute')
const mongoose = require('mongoose')
require('dotenv').config()

// for user router
app.use('/',userRoute)

//  for admin route
app.use('/admin',adminRoute)

const URL = process.env.Monogo_URL
// Prot from dotenv
const PORT = process.env.PORT
mongoose.connect((URL),{

}).then(()=>console.log("connecting Sever"))


app.listen((PORT || 3000),()=>console.log("The port has running on", PORT))
