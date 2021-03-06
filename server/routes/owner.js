const
  express = require('express'),
  passport = require('passport'),
  passportConfig = require('../config/passport.js'),
  ownerRouter = express.Router(),
  Dog = require('../models/Dog.js'),
  Walker = require('../models/Walker.js'),
  Owner = require('../models/Owner.js'),
  Post = require('../models/Post.js')

ownerRouter.route('/')
  .get((req,res) => {
    res.sendFile(process.env.PWD + '/client/index.html')
  })

ownerRouter.route('/signup')
  .get((req,res) => {
    res.sendFile(process.env.PWD + '/client/public/templates/ownerSignup.html', {message: req.flash('signupMessage')})
  })
  .post(passport.authenticate('local-owner-signup', {
      successRedirect: '/owner/profile',
      failureRedirect: '/owner/signup'
    }))

ownerRouter.route('/profile')
  .get((req,res) => {
    if(req.isAuthenticated()) {
      res.sendFile(process.env.PWD + '/client/public/templates/ownerProfile.html')
    } else {
        res.redirect('/')
    }
  })

ownerRouter.route('/pets')
  .get((req,res) => {
    if(req.isAuthenticated()) {
      res.sendFile(process.env.PWD + '/client/public/templates/registerDog.html')
    } else {
        res.redirect('/')
    }
  })
  .post((req,res) => {
    var newDog = new Dog(req.body)
    newDog._owner = req.user
    newDog.save((err, dog) => {
      req.user.dogs.push(dog)
      req.user.save()
      if(err) return console.log(err)
      res.redirect('/owner/profile')
    })
  })

ownerRouter.route('/login')
  .get((req,res) => {
    res.sendFile(process.env.PWD + '/client/public/templates/ownerLogin.html', {message: req.flash('loginMessage')})
  })
  .post(passport.authenticate('local-owner-login', {
    successRedirect: '/owner/profile',
    failureRedirect: '/owner/login'
  }))

ownerRouter.route('/logout')
  .get((req,res) => {
    req.logout()
    res.redirect('/')
  })

ownerRouter.route('/status')
  .get((req, res) => {
    // console.log("Current owner:")
    // console.log(req.user)
  if (!req.isAuthenticated()) return res.status(200).json({ status: false })
  res.status(200).json({ status: true, user: req.user })
  })

ownerRouter.route('/post')
  .get((req,res) => {
    if (req.isAuthenticated()) {
      res.sendFile(process.env.PWD + '/client/public/templates/ownerPost.html')
    } else {
      res.redirect('/')
    }
  })
  .post((req,res) => {
    var newPost = new Post(req.body)
    console.log(req.body)
    // newPost.dog = req.body.dog
    newPost.owner = req.user
    newPost.accepted = false
    newPost.requested = false
    newPost.save((err, post) => {
      req.user.posts.push(post)
      req.user.save()
      if(err) return console.log(err)
      res.redirect('/owner/profile')
    })
  })

ownerRouter.route('/post/:id')
  .get((req, res) => {
    if (req.isAuthenticated()) {
      Post.findById(req.params.id, (err,post) => {
        console.log(post)
        res.sendFile(process.env.PWD + '/client/public/templates/ownerPost.html', {post: post})
      })

    } else {
      res.redirect('/')
    }
  })
  .patch((req,res) => {
    console.log("walker on line 111")
    console.log(req.body.walker)
    Post.findByIdAndUpdate(req.params.id, req.body,  function(err,post) {
      Walker.findById(req.body.walker._id, (err, walker) => {
        if (err) console.log(err);
        walker.posts.push(post)
        post.requested_by = []
        walker.save()
      res.json(post)
      })
    })
  })
  .delete((req,res) => {
    Post.findByIdAndRemove(req.params.id, (err, post) => {
      if(err) throw (err)
      res.json({success: true, message: "request deleted"})
    })
  })

ownerRouter.route('/walks')
  .get((req,res) => {
    res.sendFile(process.env.PWD + '/client/public/templates/ownerWalks.html')
  })

module.exports = ownerRouter
