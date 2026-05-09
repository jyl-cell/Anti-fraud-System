const express = require('express')
const cors = require('cors')
const app = express()

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.use('/api/auth', require('./routes/auth'))
app.use('/api/video', require('./routes/video'))
app.use('/api/home', require('./routes/home'))
app.use('/api/game', require('./routes/game'))
app.use('/api/moment', require('./routes/moment'))
app.use('/api/mall', require('./routes/mall'))
app.use('/api/user', require('./routes/user'))

// 启动
app.listen(8080, () => {
  console.log('✅ 后端运行在 http://localhost:8080')
})