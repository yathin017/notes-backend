const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/Users');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    let user = await User.findOne({ username: req.body.username });
    if (user) return res.status(400).send('User already registered.');

    user = new User({ ...req.body });
    await user.save();

    res.status(201).send({ user: user._id });
  } catch (error) {
    res.status(500).send('Error on server');
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).send('Invalid username or password.');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid username or password.');

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.send({ token });
  } catch (error) {
    res.status(500).send('Error on server');
  }
});

module.exports = router;