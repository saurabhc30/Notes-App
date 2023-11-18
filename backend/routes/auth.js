const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'SourabhChavan30';

// Route 1 : create a user
router.post('/createuser', [
  body('name', 'Name is Not Valid').isLength({ min: 3 }),
  body('email', 'Invalid Email').isEmail(),
  body('password', 'Length Must be 6 ').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // check whether the user with this email exists already 

  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "User already exists" })
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    // create new user
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass,
    });

    const data = {
      user: {
        id: user.id
      }
    }

    const authtoken = jwt.sign(data, JWT_SECRET);

    res.json({ authtoken });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured");
  }
})

//Route 2: Authenticate user
router.post('/login', [
  body('email', 'Invalid Email').isEmail(),
  body('password', 'Length Must be 6 ').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Please Log in with correct Credential" })
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: "Please Log in with correct Credential" })
    }

    const data = {
      user: {
        id: user.id
      }
    }

    const authtoken = jwt.sign(data, JWT_SECRET);

    res.json({ authtoken });

  } catch (error) {
    return res.status(500).send({ error: "Internal Server Error" })
  }
})

// Route 3 : Get User details using Login
router.post('/getuser', fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)

  } catch (error) {
    return res.status(500).send({ error: "Internal Server Error" })
  }
})

module.exports = router;