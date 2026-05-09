const express = require('express')
const router = express.Router()
const mysql = require('mysql2/promise')
const crypto = require('crypto')
const config = require('../config')

// 密码加密
function hashPassword(pwd) {
  return crypto.createHash('sha256').update(pwd).digest('hex')
}

// 生成登录令牌
function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

// 1. 注册
router.post('/register', async (req, res) => {
  const {
    elder_name,
    elder_id_card,
    elder_phone,
    child_name,
    child_id_card,
    child_phone,
    password
  } = req.body

  try {
    const db = await mysql.createConnection(config)

    // 检查身份证是否已注册
    const [exists] = await db.query(
      'SELECT * FROM user WHERE elder_id_card = ?',
      [elder_id_card]
    )
    if (exists.length > 0) {
      return res.status(400).json({ error: '该身份证已注册' })
    }

    const hashedPwd = hashPassword(password)

    // 插入用户
    await db.query(`
      INSERT INTO user (
        elder_name, elder_id_card, elder_phone,
        child_name, child_id_card, child_phone,
        password, score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `, [
      elder_name,
      elder_id_card,
      elder_phone,
      child_name,
      child_id_card,
      child_phone,
      hashedPwd
    ])

    await db.end()
    res.json({ status: 'ok', msg: '注册成功！请登录' })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// 2. 登录（姓名 + 密码）
router.post('/login', async (req, res) => {
  const { elder_name, password } = req.body

  try {
    const db = await mysql.createConnection(config)
    const hashedPwd = hashPassword(password)

    const [users] = await db.query(`
      SELECT * FROM user WHERE elder_name = ? AND password = ?
    `, [elder_name, hashedPwd])

    if (users.length === 0) {
      return res.status(401).json({ error: '姓名或密码错误' })
    }

    const user = users[0]
    const token = generateToken()

    // 保存登录状态
    await db.query('UPDATE user SET login_token = ? WHERE id = ?', [token, user.id])
    await db.end()

    res.json({
      status: 'ok',
      token,
      user: {
        id: user.id,
        name: user.elder_name,
        score: user.score,
        // 加上子女信息，传给前端
        child_name: user.child_name
      }
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// 3. 检查是否登录（记住设备）
router.get('/check', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.json({ isLogin: false })

  try {
    const db = await mysql.createConnection(config)
    const [users] = await db.query('SELECT * FROM user WHERE login_token = ?', [token])
    await db.end()

    if (users.length > 0) {
      res.json({
        isLogin: true,
        user: {
          id: users[0].id,
          name: users[0].elder_name,
          score: users[0].score,
          child_name: users[0].child_name
        }
      })
    } else {
      res.json({ isLogin: false })
    }
  } catch (e) {
    res.json({ isLogin: false })
  }
})

module.exports = router