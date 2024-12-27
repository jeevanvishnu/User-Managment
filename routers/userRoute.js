const express = require('express')
const app =express()
const user_route = express()
const multer = require('multer')
const nocatche = require('nocache')
const path = require('path')
const session = require('express-session')
const userAuth = require('../middleware/userAuth')
user_route.set('view engine','ejs')
user_route.set('views','views/users')
user_route.use(express.static('public'))
// use nocatche
user_route.use(nocatche())

// Add body parse 
const bodyParse = require('body-parser')
user_route.use(bodyParse.json())
user_route.use(bodyParse.urlencoded({extended:true}))


require('dotenv').config()
// Add Session key from env 
const sessionKey = process.env.sesssionKey
user_route.use(
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
const userController = require('../controllers/userController')

//destructur auth route
const loginAuth = userAuth.isLogin
const logoutAuth = userAuth.isLogout
const userCheck = userAuth.checkUser
user_route.get('/register' ,logoutAuth, userController.loasdRegister)
user_route.post('/register' ,imageUpload , userController.insertUser)
user_route.get('/verify', userController.verifyMail)

user_route.get('/',logoutAuth,userController.loginLoad)
user_route.get('/login',logoutAuth,userCheck,userController.loginLoad)

user_route.post('/login',userController.loginVerify)
user_route.get('/home',loginAuth,userController.loadHome)

user_route.get('/logout',loginAuth,userController.Logout)
user_route.get('/forgot',logoutAuth,userController.forgotLoad)

user_route.post('/forgot',userController.forgotVerify)
user_route.get('/forgotPassward',logoutAuth,userController.forgotPasswardLoad)

user_route.post('/forgotPassward',userController.resetPassword)
user_route.get('/verified',userController.verificaionLoad)

user_route.post('/verified',userController.verificationLink)
user_route.get('/edit',userController.profileUpdate)

user_route.post('/edit',upload.single('image'),loginAuth,userController.updateProfile)
module.exports = user_route