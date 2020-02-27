const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll(
      { nest: true, raw: true, include: [Category] }
    ).then(restaurants => {
      callback({ restaurants: restaurants })
    })
  },

  postRestaurant: (req, res, callback) => {
    if (!req.body.name) {
      return callback({
        status: 'error', message: "name didn't exist"
      })
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
            callback({
              status: 'success', message: 'restaurant was successfully created'
            })
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
        callback({ status: 'success', message: 'restaurant was successfully created' })
      })
    }
  },

  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { nest: true, raw: true, include: [Category] }).then(restaurant => {
      callback({ restaurant: restaurant })
    })
  },

  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy()
          .then(restaurant => {
            callback({ status: 'success', message: '' })
          })
      })
  }
}

module.exports = adminService