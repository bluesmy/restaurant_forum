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

  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { nest: true, raw: true, include: [Category] }).then(restaurant => {
      callback({ restaurant: restaurant })
    })
  }
}

module.exports = adminService