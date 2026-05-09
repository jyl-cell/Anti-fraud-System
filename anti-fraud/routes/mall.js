const express = require('express')
const router = express.Router()
const mysql = require('mysql2/promise')
const config = require('../config')

// 获取商品列表
router.get('/goods', async (req, res) => {
  try {
    const db = await mysql.createConnection(config)
    const [rows] = await db.query('SELECT * FROM goods')
    res.json(rows)
    await db.end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ================= 修复完成：兑换商品 =================
router.post('/exchange', async (req, res) => {
  try {
    const { userId, goodsId, cost } = req.body
    const db = await mysql.createConnection(config)

    // 1. 检查用户积分够不够
    const [users] = await db.query('SELECT score FROM user WHERE id = ?', [userId])
    if (users.length === 0 || users[0].score < cost) {
      res.json({ status: 'fail', msg: '积分不足' })
      await db.end()
      return
    }

    // 2. 检查商品库存
    const [goods] = await db.query('SELECT stock FROM goods WHERE id = ?', [goodsId])
    if (goods.length === 0 || goods[0].stock <= 0) {
      res.json({ status: 'fail', msg: '库存不足' })
      await db.end()
      return
    }

    // 3. 扣积分
    await db.query(
      'UPDATE user SET score = score - ? WHERE id = ?',
      [cost, userId]
    )

    // 4. 扣库存
    await db.query(
      'UPDATE goods SET stock = stock - 1 WHERE id = ?',
      [goodsId]
    )

    // 5. 查询最新积分（关键！前端要靠这个同步！）
    const [newUser] = await db.query('SELECT score FROM user WHERE id = ?', [userId])
    const newScore = newUser[0].score

    res.json({
      status: 'ok',
      msg: '兑换成功',
      newScore: newScore  // 关键！返回最新积分
    })

    await db.end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router