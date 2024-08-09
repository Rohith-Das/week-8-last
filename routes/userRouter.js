const express = require('express');
const router = express.Router();  // Use express.Router() to create a router instance
const bodyParser = require('body-parser');

const UserController = require('../controller/userController');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Define routes
router.get('/', UserController.loadHome);
router.get('/home', UserController.loadHome);

router.get('/login', UserController.loadLogin);
router.post('/login', UserController.authenticateUser);
router.get('/register', UserController.loadRegister);
router.post('/register', UserController.insertUser);
router.get('/profile',UserController.loadProfile);
router.post('/logout', UserController.logoutUser);

router.post('/request-otp', UserController.requestOTP);

router.post('/verify-otp', UserController.verifyOTP);





module.exports = router;