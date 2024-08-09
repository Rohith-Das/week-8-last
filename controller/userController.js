const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();
const User = require("../model/userModel");


// const loadHome = async (req, res) => {
//     try {
//         let userData;
//         if (req.session.user_id) {
//             userData = await User.findById(req.session.user_id);
//         }
//         res.render("home", { user: userData });
//     } catch (error) {
//         res.send(error.message);
//     }
// };

const loadHome = async (req, res) => {
    try {
        let userData;
        if (req.session.user_id) {
            userData = await User.findById(req.session.user_id);
        }
        res.render("home", { user: userData });
    } catch (error) {
        res.send(error.message);
    }
};


const loadLogin = (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        res.send(error.message);
    }
};

const authenticateUser = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            req.session.user_id = user._id;
            res.redirect('/home');
        } else {
            res.send("Invalid email or password");
        }
    } catch (error) {
        res.send(error.message);
    }
};

const loadRegister = (req, res) => {
    try {
        res.render("register");
    } catch (error) {
        res.send(error.message);
    }
};

const insertUser = async (req, res) => {
    try {
       
        const { name, email, phone, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.send("Passwords do not match");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name:name,
            email:email,
            phone:phone,
            password: hashedPassword,
            otpVerified: true
        });
        console.log("haiiiii");
        await user.save();
        await generateAndSendOTP(email);

        req.session.email = email;
        res.render("otp", { email });
    } catch (error) {
        res.send(error.message);
    }
};

const loadProfile = async (req, res) => {
    try {
        if (!req.session.user_id) {
            return res.redirect('/login');
        }
        const user = await User.findById(req.session.user_id);
        if (!user) {
            return res.redirect('/login');
        }
        res.render("profile", { user });
    } catch (error) {
        res.send(error.message);
    }
};

const logoutUser = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send(err.message);
        }
        res.redirect('/home');
    });
};

// OTP management
let otpStore = {}; // Temporary store for OTPs

// Generate OTP and send it
const generateAndSendOTP = async (email) => {
    const otp = crypto.randomInt(100000, 999999); // Generate a 6-digit OTP
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 minutes validity
    console.log(`Generated OTP for ${email}: ${otp}`);

    // Setup email transport
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Send OTP email
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It expires in 5 minutes.`
        });
        console.log(`OTP sent to ${email,otp}`);
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        throw new Error('Error sending OTP');
    }
};



// Endpoint to request OTP
const requestOTP = async (req, res) => {
    try {
        const { email } = req.body;
        await generateAndSendOTP(email);
        res.send("OTP sent to your email");
    } catch (error) {
        res.send(error.message);
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        console.log(`Verifying OTP for ${email}: ${otp}`);

        const stored = otpStore[email];

        if (stored && stored.otp === parseInt(otp) && Date.now() < stored.expires) {
            delete otpStore[email]; // OTP valid, remove from store
            console.log("OTP verified successfully");
            res.json({ success: true, message: "OTP verified successfully" }); // Send JSON response
        } else {
            console.log("Invalid or expired OTP");
            res.json({ success: false, message: "Invalid or expired OTP" }); // Send JSON response
        }
    } catch (error) {
        console.error('Error verifying OTP:', error.message);
        res.status(500).json({ success: false, message: "Internal server error" }); // Send JSON response
    }
};




module.exports = {
    insertUser,
    loadRegister,
    loadLogin,
    loadHome,
    loadProfile,
    logoutUser,
    authenticateUser,
    requestOTP,
    verifyOTP,
    generateAndSendOTP,
};
