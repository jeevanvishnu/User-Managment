const express = require('express')
const admin_route = express()
require('dotenv').config()
const adminControl = require('../controllers/adminController')
const session = require('express-session')
const bodyParse = require('body-parser')
const multer = require('multer')
const path = require('path')
// middleware
const auth = require('../middleware/adminAuth')
const authLogin = auth.isLogin
const authLogout = auth.isLogout
// setup session

const sessionKey = process.env.sesssionKey
admin_route.use(
    session({
        secret:sessionKey,
        resave:false,
        saveUninitialized: false,  
    cookie: {
        maxAge: 60 * 60 * 1000 
    }
    })
)

// multer setup
admin_route.use(express.static('public'))
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null, path.join(__dirname, '../public/userImage'))
    },
    filename:function(req,file,cb){
        cb(null, Date.now() + '-' + file.originalname);
    }
})
const upload = multer({ storage: storage });
const imageUpload = upload.single('image')
// body parse
admin_route.use(bodyParse.json())
admin_route.use(bodyParse.urlencoded({extended:true}))


admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')



admin_route.get('/',authLogout,adminControl.loadLogin)
admin_route.post('/',adminControl.verifyLogin)

admin_route.get('/home',authLogin,adminControl.loadDashBoard)
admin_route.get('/logout',adminControl.logout)

admin_route.get('/dashboard',authLogin,adminControl.admindashBoard)
admin_route.get('/newuser',adminControl.loadNewUSer)

admin_route.post('/newuser',imageUpload,adminControl.addUser)
admin_route.get('/edituser',authLogin,adminControl.edituser)

admin_route.post('/edituser',adminControl.updateUser)
admin_route.get('/deleteuser',authLogin,adminControl.deleteUSer)
module.exports = admin_route