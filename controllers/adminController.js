const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category

const adminService = require('../services/adminService.js')

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', data)
    })
  },

  createRestaurant: (req, res) => {
    Category.findAll({ raw: true }).then(categories => {
      return res.render('admin/create', {
        categories: categories
      })
    })
  },

  postRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req // equal to const file = req.file
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        })
          .then(restaurant => {
            req.flash('success_messages', 'restaurant was successfully created')
            res.redirect('/admin/restaurants')
          })
      })
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null,
        CategoryId: req.body.categoryId
      }).then(restaurant => {
        req.flash('success_messages', 'restaurant was successfully created')
        return res.redirect('/admin/restaurants')
      })
    }
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { nest: true, raw: true, include: [Category] }).then(restaurant => {
      return res.render('admin/restaurant', { restaurant: restaurant })
    })
  },

  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true }).then(restaurant => {
      Category.findAll({ raw: true }).then(categories => {
        return res.render('admin/create', ({ categories: categories, restaurant: restaurant }))
      })
    })
  },

  putRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id).then(restaurant => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: file ? img.data.link : restaurant.image,
            CategoryId: req.body.categoryId
          }).then((restaurant) => {
            req.flash('success_messages', 'restaurant was successfully to update')
            res.redirect('/admin/restaurants')
          })
        })
      })
    } else {
      return Restaurant.findByPk(req.params.id)
        .then(restaurant => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: restaurant.image,
            CategoryId: req.body.categoryId
          })
            .then(restaurant => {
              req.flash('success_messages', 'restaurant was successfully to update')
              res.redirect('/admin/restaurants')
            })
        })
    }
  },

  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy()
          .then(restaurant => {
            res.redirect('/admin/restaurants')
          })
      })
  },

  getUsers: (req, res) => {
    return User.findAll({ raw: true }).then(users => {
      return res.render('admin/users', { users: users })
    })
  },

  putUsers: (req, res) => {
    return User.findByPk(req.params.id)
      .then(user => {
        const { name, email, password, isAdmin } = user
        user.update({
          name,
          email,
          password,
          isAdmin: !isAdmin
        })
          .then((user) => {
            req.flash('success_messages', 'user was successfully to update')
            res.redirect('/admin/users')
          })
      })
  }
}
module.exports = adminController