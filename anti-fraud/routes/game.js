const express = require('express')
const router = express.Router()
const mysql = require('mysql2/promise')
const config = require('../config')

// 1. 游戏记录接口（保存积分/通关记录）
router.post('/record', async (req, res) => {
  const { userId, gameType, score, level } = req.body
  try {
    const db = await mysql.createConnection(config)
    await db.query(`
      INSERT INTO game_record (user_id, game_type, score, level, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [userId, gameType, score, level])
    await db.end()
    res.json({ status: 'ok', msg: '记录保存成功' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 2. 获取用户游戏积分/排行榜
router.get('/rank/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    const db = await mysql.createConnection(config)
    const [rows] = await db.query(`
      SELECT * FROM game_record WHERE user_id = ? ORDER BY created_at DESC
    `, [userId])
    await db.end()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router