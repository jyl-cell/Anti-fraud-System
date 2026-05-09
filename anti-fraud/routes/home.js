const API_BASE = "http://localhost:8080/api";
const express = require('express')
const router = express.Router()

router.get('/test', (req, res) => {
  res.json({ status: 'ok', msg: '反诈平台后端运行正常' })
})


const multer = require('multer')

// 配置上传：照片存在 uploads 文件夹
const upload = multer({ dest: 'uploads/' })

// 拍照 → 发给子女
router.post('/send-to-child', upload.single('photo'), (req, res) => {
  console.log('✅ 用户上传照片：', req.file)
  console.log('用户ID：', req.body.userId)

  res.json({
    status: 'ok',
    msg: '照片已发送给子女，正在帮您核实真假'
  })
})



module.exports = router