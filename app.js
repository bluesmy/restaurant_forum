const express = require('express')
const handlebars = require('express-handlebars')
const db = require('./models') // 引入資料庫
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')

const app = express()
const port = 3000

app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(flash())

// 把 req.flash 放到 res.locals 裡面
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  next()
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})

require('./routes')(app)