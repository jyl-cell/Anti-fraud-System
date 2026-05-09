const express = require('express')
const router = express.Router()
const mysql = require('mysql2/promise')
const config = require('../config')

// 获取用户信息
router.get('/info/:id', async (req, res) => {
  try {
    const db = await mysql.createConnection(config)
    const [rows] = await db.query('SELECT * FROM user WHERE id = ?', [req.params.id])
    res.json(rows[0] || {})
    await db.end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body
    const db = await mysql.createConnection(config)
    await db.query(
      'INSERT INTO user (username, password) VALUES (?, ?)',
      [username, password]
    )
    res.json({ status: 'ok', msg: '注册成功' })
    await db.end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const db = await mysql.createConnection(config)
    const [rows] = await db.query(
      'SELECT * FROM user WHERE username = ? AND password = ?',
      [username, password]
    )
    if (rows.length > 0) {
      res.json({ status: 'ok', user: rows[0] })
    } else {
      res.json({ status: 'fail', msg: '账号或密码错误' })
    }
    await db.end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ===================== 我新增的代码 =====================
// 增加积分（点赞、评论、看视频用）
router.post('/addScore', async (req, res) => {
  try {
    const { id, score } = req.body
    const db = await mysql.createConnection(config)
    await db.query('UPDATE user SET score = score + ? WHERE id = ?', [score, id])
    res.json({ status: 'ok' })
    await db.end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 减少积分（商城兑换用）
router.post('/reduceScore', async (req, res) => {
  try {
    const { id, score } = req.body
    const db = await mysql.createConnection(config)
    await db.query('UPDATE user SET score = score - ? WHERE id = ? AND score >= ?', [score, id, score])
    res.json({ status: 'ok' })
    await db.end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
// ======================================================

module.exports = router