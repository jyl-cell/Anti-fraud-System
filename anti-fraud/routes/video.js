const express = require('express')
const router = express.Router()
const mysql = require('mysql2/promise')
const config = require('../config')

// 从数据库获取所有视频，按sort从小到大排序
router.get('/list', async (req, res) => {
  try {
    const db = await mysql.createConnection(config)
    const [rows] = await db.query('SELECT * FROM anti_fraud.video ORDER BY sort ASC')
    await db.end()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 视频点赞接口（更新likes）
router.post('/like', async (req, res) => {
  const { videoId, userId } = req.body
  const db = await mysql.createConnection(config)
  await db.query('UPDATE anti_fraud.video SET likes = likes + 1 WHERE id = ?', [videoId])
  await db.end()
  res.json({ status: 'ok', msg: '点赞成功' })
})

// 视频收藏接口（你以后可以扩展，先留着）
router.post('/favorite', (req, res) => {
  const { videoId, userId } = req.body
  console.log('收藏视频ID：', videoId, '用户ID：', userId)
  res.json({ status: 'ok', msg: '收藏成功' })
})

module.exports = router