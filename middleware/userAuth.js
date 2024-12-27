const isLogin = async(req,res,next)=>{
   try {
    if(!req.session.user_id){
        res.redirect('/')
    }
    next()
   } catch (error) {
     console.log(error.message)
   }
}

const isLogout = async (req,res,next) =>{
    try {
        if(req.session.user_id){
            res.redirect('/home')
        }
        next()
    } catch (error) {
        console.log(error.message)
    }
}

const checkUser = async (req, res, next) => {
    if(req.session.user_id){
        res.redirect('/home')
    }else{
        res.redirect("/")
    }
  }


module.exports ={
    isLogin,
    isLogout,
    checkUser
}