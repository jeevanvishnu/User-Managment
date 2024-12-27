const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const admin_route = require('../routers/adminRoute')
const userModel = require('../models/userModel')
const randomString = require('randomstring')
const nodemailer = require('nodemailer')
const { name } = require('ejs')
// Add bcrypt
const securePassword = async (password) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
    } catch (error) {
      console.log(error.message);
    }
  };
  // Reset mail code

const ResetVerifyMail = async (name, email, token) => {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: "jeevanvishnu18@gmail.com",
          pass: "jjkgunptibvqdkvv",
        },
      });
      const mailOptions = {
        from: "jeevanvishnu18@gmail.com",
        to: email,
        subject: "Verify your Mail",
        html: `<p>Hi ${name},</p> 
                <p>Please click here and Verify your Email: <a href="http://localhost:4000/forgotPassward?token=${token}">Reset Your Password Click here</a></p>`,
      };
  
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`user send email ${info}`);
        }
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  
// nodemailer using send to email
const addUserMail = async (name, email,password, user_id) => {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: "jeevanvishnu18@gmail.com",
          pass: "jjkgunptibvqdkvv",
        },
      });
      const mailOptions = {
        from: "jeevanvishnu18@gmail.com",
        to: email,
        subject: "Admin verification ",
        html: `<p>Hi ${name},</p> 
              <p>Please click here and Verify your Email: <a href="http://localhost:4000/verify?id=${user_id}">Click here</a></p>`,
      };
  
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`user send email ${info}`);
        }
      });
    } catch (error) {
      console.log(error.message);
    }
  };

// Load Login page

const loadLogin = async (req,res) =>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}

// admin Verify Login

const verifyLogin = async (req,res) =>{
    
    try {
      
        const {email , password} = req.body


        const userData = await User.findOne({email:email})
      
        if(userData){
          const passwordMatch = await  bcrypt.compare(password,userData.password)
            

            if(passwordMatch){

                if(!userData.is_Admin === 0){
                    res.render('login',{message:"Email and password incrroct "})
                }else{
                    req.session.user_id = userData._id
                    res.redirect('/admin/home')
                }

            }else{
                res.render('login',{message:"Email and password incrroct  "})
            }

        }else{
            res.render('login',{message:"Email and password incrroct "})
        }


    } catch (error) {
        console.log(error.message)
    }
}

// load home page 
const loadDashBoard = async (req,res) =>{
    try {
      const userData =   await User.findById({_id:req.session.user_id})
        res.render('home',{admin:userData})
    } catch (error) {
       console.log(error.message) 
    }
}

// setup Logout 

const logout = async (req,res)=>{
  try {
    req.session.destroy()
    res.redirect('/admin')
  } catch (error) {
    console.log(error.message)
  }
}

// setup adminDashBoard
const admindashBoard = async (req,res)=>{
    try {
        let search = "";
        
        if(req.query.search){
            search = req.query.search
        }
        
        const userData = await userModel.find({is_Admin:0,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ]
        })
        console.log(userData)
        res.render('dashboard',{user:userData})
    } catch (error) {
        console.log(error.message)
    }
}

// call add new user 

const loadNewUSer = async(req,res) =>{

    try {

        res.render('newuser')
        
    } catch (error) {
        console.log(error.message)
    }
}

// add user 

const  addUser = async (req,res) =>{
    
    try {

        const {name,email,mobile} = req.body
        const password = randomString.generate(8)
        const image = req.file.filename
        const sPassword = await securePassword(password)

        const user = new User ({
            name:name,
            email:email,
            mobile:mobile,
            image:image,
            password:sPassword,
            is_Admin:0
        })
        const userData = await user.save()

        if(userData){
            addUserMail(userData.name , userData.email ,userData.password ,userData._id)
            res.redirect('/admin/dashboard')
        }else{
            res.render('newuser',{message:'Something Wrong'})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}
// Edit user functions

const edituser = async (req,res) =>{
    try {
        const id = req.query.id
        const findData = await User.findById({_id:id})
        console.log(findData)
        if (findData) {
            res.render('edituser',{user:findData})
        } else {
            res.redirect('/admin/dashboard')
        }
      

    } catch (error) {
        console.log(error.message)
    }
}

// setup udateuser 
const updateUser = async (req,res) =>{
    try {
        const {name,email,mobile} =req.body
      const userData =   await User.findByIdAndUpdate({_id:req.body.id},{$set:{name:name,email:email,mobile:mobile}})
      console.log(userData)
      res.redirect('/admin/dashboard')
    } catch (error) {
        console.log(error.message)
    }
}
// setup delete user 
const deleteUSer = async (req,res)=>{

    try {
        const id = req.query.id
        console.log(id)
        const userData = await User.deleteOne({_id:id})
        res.redirect('/admin/dashboard')
    } catch (error) {
        console.log(error.message)
    }
}
module.exports = {
    loadLogin,
    verifyLogin,
    loadDashBoard,
    logout,
    admindashBoard,
    loadNewUSer,
    addUser,
    edituser,
    updateUser,
    deleteUSer
}