const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { ObjectId } = require("mongodb");
const user_route = require("../routers/userRoute");
const rondomString = require("randomstring");
// Add bcrypt
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

// nodemailer using send to email
const sendVerifyMail = async (name, email, user_id) => {
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

const loasdRegister = async (req, res) => {
  try {
    res.render("regestration");
  } catch (err) {
    console.log(err);
  }
};

// inserted Data
const insertUser = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    const spassword = await securePassword(req.body.password);
    const image = req.file ? req.file.filename : null;
    const user = new User({
      name,
      password: spassword,
      mobile,
      email,
      image,
      is_Admin: 0,
    });
    console.log(user);

    const userDetails = await user.save();

    if (userDetails) {
      sendVerifyMail(name, email, userDetails._id);
      res.render("regestration", {
        message: "Your regestration sucessfully , Please check your Mail",
      });
    } else {
      res.render("regestration", {
        message: "your regestration has been Failed",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const verifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: new ObjectId(req.query.id) },
      {
        $set: {
          is_verified: 1,
        },
      }
    );
    console.log(req.query.id);
    console.log(updateInfo);
    res.render("emailverify");
  } catch (error) {
    console.log(error.message);
  }
};

// login session

const loginLoad = async (req, res) => {
  res.render("login");
};
const loginVerify = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_verified === 0) {
          res.render("login", { message: "please Verify Your Email" });
        } else {
          req.session.user_id = userData._id;
          res.redirect("home");
        }
      } else {
        res.render("login", { message: " incorrect Password " });
      }
    } else {
      res.render("login", { message: "Email or Password incorrect" });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadHome = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    res.render("home", { user: userData });
  } catch (error) {
    console.log(error);
  }
};

// setup Logout

const Logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

// forgot passward setup
const forgotLoad = async (req, res) => {
  try {
    res.render("forgot");
  } catch (error) {
    console.log(error.message);
  }
};

// forgot verify

const forgotVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const forgotData = await User.findOne({ email: email });

    if (forgotData) {
      if (forgotData.is_verified === 0) {
        res.render("forgot", { message: "Please Verify Your Mail" });
      } else {
        const randomString = rondomString.generate();
        await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        ResetVerifyMail(forgotData.name, forgotData.email, forgotData._id);

        res.render("forgot", { message: "Please Check Your Mail" });
      }
    } else {
      res.render("forgot", { message: "User email is not correct" });
    }
  } catch (error) {
    console.log(error);
  }
};

// const forgotPasswardLoad

const forgotPasswardLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ _id: token });
    if (tokenData) {
      res.render("forgotPassward", { user_id: tokenData._id });
    } else {
      res.render("404", { message: "Token is invailed" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// forgot Password

const passwordForgot = async (req, res) => {
  try {
    res.render("forgot-psw");
  } catch (error) {
    console.log(error.message);
  }
};

// Reset Password

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;
    const secure_Password = await securePassword(password);
    const update = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: secure_Password } }
    );
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};
// for verification send link
const verificaionLoad = async (req, res) => {
  try {
    res.render("verify");
  } catch (error) {
    console.log(error.message);
  }
};
// send verification Link

const verificationLink = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.find({ email: email });
    console.log(userData);
    if (userData) {
      sendVerifyMail(userData.name, userData.email, userData._id);
      res.render("verify", {
        message: "Reset verification mail send your mail",
      });
    } else {
      res.render("verify", { message: "This email not exist" });
    }
  } catch (error) {
    console.log(error);
  }
};

// user profile nad update

const profileUpdate = async (req, res) => {
  try {
    const id = req.query.id;

    const userData = await User.findOne({ _id: id });

    if (userData) {
      res.render("edit", { user: userData });
    } else {
      res.redirect("home");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// edit profile

const updateProfile = async (req, res) => {
  const image = req.file ? req.file.filename : null;

  console.log(image);

  try {
    if (req.file) {
      const update = await User.findByIdAndUpdate(
        { _id: req.body.user_id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            image: req.file.filename,
          },
        }
      );
    } else {
      const update = await User.findByIdAndUpdate(
        { _id: req.body.user_id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
          },
        }
      );
    }

    res.redirect("/home");
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  loasdRegister,
  insertUser,
  verifyMail,
  loginLoad,
  loginVerify,
  loadHome,
  Logout,
  forgotLoad,
  forgotVerify,
  forgotPasswardLoad,
  passwordForgot,
  resetPassword,
  verificaionLoad,
  verificationLink,
  profileUpdate,
  updateProfile,
};
