const bcrypt = require('bcryptjs')
const db = require('../models')
const { User, Comment, Restaurant, Favorite, Like } = db
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    const userId = Number(req.params.id)
    return User.findByPk(userId, { nest: true, raw: true, include: [{ model: Comment, include: [Restaurant] }] }).then(results => {
      res.render('users/profile', { profile: results })
    })
  },

  editUser: (req, res) => {
    const userId = Number(req.params.id)
    if (userId !== req.user.id) {
      req.flash('error_msg', '非本人無編輯權限！')
      return res.redirect(`/users/${req.params.id}`)
    }
    return User.findByPk(userId).then(user => {
      res.render('users/edit', { profile: user.get() })
    })
  },

  putUser: (req, res) => {
    const userId = Number(req.params.id)
    if (userId !== req.user.id) {
      req.flash('error_msg', '非本人無編輯權限！')
      return res.redirect(`/users/${req.params.id}`)
    }
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(userId).then(user => {
          user.update({
            name: req.body.name,
            image: file ? img.data.link : user.image,
          }).then(user => {
            req.flash('success_messages', 'user was successfully to update')
            res.redirect(`/users/${user.id}`)
          })
        })
      })
    } else {
      return User.findByPk(userId).then(user => {
        user.update({
          name: req.body.name,
          image: user.image
        }).then(user => {
          req.flash('success_messages', 'user was successfully to update')
          res.redirect(`/users/${user.id}`)
        })
      })
    }
  },

  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(restaurant => {
        return res.redirect('back')
      })
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        favorite.destroy()
          .then(restaurant => {
            return res.redirect('back')
          })
      })
  },

  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(restaurant => {
        return res.redirect('back')
      })
  },

  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        like.destroy()
          .then(restaurant => {
            return res.redirect('back')
          })
      })
  }
}

module.exports = userController