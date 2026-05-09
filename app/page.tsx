'use client';
import { getUserInfo, addScore, exchangeGoods } from './api';
import { speak } from './voice';
import { sendPhotoToChild } from './api'
import { getVideoList, likeVideo, favoriteVideo } from './api'
import { useState, useEffect } from 'react'
import { login, register, checkLogin } from './api'

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home');
  const [score, setScore] = useState(100);
  const [menuOpen, setMenuOpen] = useState(false);
  // 防骗剧场视频状态
  const [videoList, setVideoList] = useState<any[]>([])
  const [currentVideoUrl, setCurrentVideoUrl] = useState('')
  const [currentVideoId, setCurrentVideoId] = useState(1)
  // 登录注册
  const [isLogin, setIsLogin] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 登录表单
  const [loginForm, setLoginForm] = useState({
    elder_name: '',
    password: ''
  })

  // 注册表单
  const [registerForm, setRegisterForm] = useState({
    elder_name: '',
    elder_id_card: '',
    elder_phone: '',
    child_name: '',
    child_id_card: '',
    child_phone: '',
    password: ''
  })

  const API = 'http://localhost:8080/api';

  // 获取用户积分（绑定当前登录用户）
  useEffect(() => {
    if (userInfo?.id) {
      fetch(`${API}/user/info/${userInfo.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.score !== undefined) {
            setScore(data.score);
          }
        });
    }
  }, [userInfo?.id]);

  // 刷新积分（绑定当前用户）
  const refreshScore = async () => {
    if (userInfo?.id) {
      const data = await getUserInfo(userInfo.id);
      if (data.score) setScore(data.score);
    }
  };

  // 退出登录函数
  const handleLogout = () => {
    // 清除本地存储的token
    localStorage.removeItem('token');
    // 重置状态
    setIsLogin(false);
    setUserInfo(null);
    setLoading(true);
    // 刷新页面，回到未登录状态
    window.location.reload();
  };

  // 点赞逻辑，改成用当前用户ID
  const handleLike = async () => {
    if (!userInfo?.id) return;
    await likeVideo(currentVideoId, userInfo.id);
    await addScore(userInfo.id, 5);
    refreshScore();
    speak("点赞成功加五分");
  };

  // 自动检查登录状态（带 token，获取最新用户信息）
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token')
      const res = await checkLogin(token)
      if (res.isLogin) {
        setIsLogin(true)
        setUserInfo(res.user)
      }
      setLoading(false)
    }
    init()
  }, [])

  // 页面挂载时自动加载视频列表
  useEffect(() => {
    const loadVideo = async () => {
      try {
        const list = await getVideoList();
        setVideoList(list);
        if (list.length > 0) {
          setCurrentVideoUrl(list[0].url);
          setCurrentVideoId(list[0].id);
        }
      } catch (err) {
        console.error("加载视频列表失败：", err);
      }
    };
    loadVideo();
  }, []);

  // 登录
  const handleLogin = async () => {
    const res = await login(loginForm.elder_name, loginForm.password)
    if (res.status === 'ok') {
      localStorage.setItem('token', res.token)
      setIsLogin(true)
      setUserInfo(res.user)
      // 登录成功后，立刻刷新积分
      setScore(res.user.score)
      setCurrentPage('home')
      alert('登录成功！')
    } else {
      alert(res.error)
    }
  }

  // 注册
  const handleRegister = async () => {
    const res = await register(registerForm)
    if (res.status === 'ok') {
      alert('注册成功！请登录')
      setCurrentPage('login')
    } else {
      alert(res.error)
    }
  }

  return (
    <>
    {loading ? (
      <div className="p-10 text-center text-xl">加载中...</div>
    ) : isLogin ? (
      <div className="flex flex-col h-screen bg-[#F0F2F5]">
        {/* 顶部状态栏（动态显示用户名） */}
        <div className="bg-[#E8F5E9] text-[#2E7D32] text-center py-2 font-bold text-lg">
          🏅 反诈先锋：{userInfo?.name || '用户'}，欢迎您！
        </div>

        {/* 头部 */}
        <header className="bg-[#2E7D32] text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">🛡️ 常青守护</h1>
          {/* 退出登录按钮 */}
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
          >
            退出登录
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl md:hidden">
            ☰
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* 侧边栏导航（电脑显示 / 手机隐藏） */}
          <nav className={`hidden md:block w-44 bg-white p-4 border-r border-gray-200 flex flex-col`}>
            <button onClick={() => setCurrentPage('home')} className={`p-4 text-left rounded-lg mb-2 text-lg ${currentPage === 'home' ? 'bg-[#2E7D32] text-white' : ''}`}>🏠 首页</button>
              <button onClick={() => setCurrentPage('video')} className={`p-4 text-left rounded-lg mb-2 text-lg ${currentPage === 'video' ? 'bg-[#2E7D32] text-white' : ''}`}>🎬 剧场</button>
              <button onClick={() => setCurrentPage('game')} className={`p-4 text-left rounded-lg mb-2 text-lg ${currentPage === 'game' ? 'bg-[#2E7D32] text-white' : ''}`}>🎮 闯关</button>
              <button onClick={() => setCurrentPage('circle')} className={`p-4 text-left rounded-lg mb-2 text-lg ${currentPage === 'circle' ? 'bg-[#2E7D32] text-white' : ''}`}>👥 亲友圈</button>
              <button onClick={() => setCurrentPage('mall')} className={`p-4 text-left rounded-lg mb-2 text-lg ${currentPage === 'mall' ? 'bg-[#2E7D32] text-white' : ''}`}>🎁 商城</button>


          {/* 守护人 */}
          {/* 守护人 */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <p className="text-gray-500 text-sm mb-2">我的守护人</p>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">👩</div>
              <div>
                <b>{userInfo?.child_name || ''}</b>
                <p className="text-[#2E7D32] text-xs">● 在线守护中</p>
              </div>
            </div>
          </div>
          </nav>
          {/* 手机端弹出菜单 */}
          {menuOpen && (
            <div className="absolute top-16 left-0 w-full bg-white z-50 p-4 shadow-lg">
              <button onClick={() => { setCurrentPage('home'); setMenuOpen(false); }} className="block w-full text-left p-3 text-lg">🏠 首页</button>
              <button onClick={() => { setCurrentPage('video'); setMenuOpen(false); }} className="block w-full text-left p-3 text-lg">🎬 剧场</button>
              <button onClick={() => { setCurrentPage('game'); setMenuOpen(false); }} className="block w-full text-left p-3 text-lg">🎮 闯关</button>
              <button onClick={() => { setCurrentPage('circle'); setMenuOpen(false); }} className="block w-full text-left p-3 text-lg">👥 亲友圈</button>
              <button onClick={() => { setCurrentPage('mall'); setMenuOpen(false); }} className="block w-full text-left p-3 text-lg">🎁 商城</button>
              
            </div>
          )}

          {/* 主内容区 */}
          <main className="flex-1 p-4 overflow-y-auto">
            {/* 首页 */}
            {currentPage === 'home' && (
              <div className="space-y-6">
                <div className="bg-[#e8f5e9] rounded-xl p-8 text-center">
                  <h2 className="text-3xl font-bold mb-4">守住钱袋子 • 守护幸福家</h2>
                  <p className="text-xl mb-6">发现可疑情况，孩子帮忙把关</p>
                  <div className="flex flex-wrap justify-center gap-6">
                    <button 
                      onClick={() => {
                        // 创建弹窗
                        const modal = document.createElement('div');
                        modal.style.cssText = `
                          position: fixed;
                          top: 0;
                          left: 0;
                          width: 100vw;
                          height: 100vh;
                          background: rgba(0,0,0,0.7);
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          z-index: 9999;
                        `;

                        const box = document.createElement('div');
                        box.style.cssText = `
                          background: white;
                          padding: 40px;
                          border-radius: 20px;
                          text-align: center;
                          width: 80%;
                          max-width: 400px;
                        `;

                        const title = document.createElement('h3');
                        title.innerText = '请选择图片方式';
                        title.style.cssText = `
                          font-size: 24px;
                          font-weight: bold;
                          margin-bottom: 30px;
                        `;

                        const btnGroup = document.createElement('div');
                        btnGroup.style.cssText = `
                          display: flex;
                          flex-direction: column;
                          gap: 15px;
                        `;

                        // 拍照按钮
                        const btnCamera = document.createElement('button');
                        btnCamera.innerText = '📷 拍照发送';
                        btnCamera.style.cssText = `
                          background: #2E7D32;
                          color: white;
                          font-size: 22px;
                          padding: 15px 30px;
                          border: none;
                          border-radius: 12px;
                          width: 100%;
                          cursor: pointer;
                        `;

                        // 相册按钮
                        const btnAlbum = document.createElement('button');
                        btnAlbum.innerText = '🖼️ 从相册选择';
                        btnAlbum.style.cssText = `
                          background: #FF9800;
                          color: white;
                          font-size: 22px;
                          padding: 15px 30px;
                          border: none;
                          border-radius: 12px;
                          width: 100%;
                          cursor: pointer;
                        `;

                        // 取消按钮
                        const btnCancel = document.createElement('button');
                        btnCancel.innerText = '取消';
                        btnCancel.style.cssText = `
                          background: #ccc;
                          color: black;
                          font-size: 20px;
                          padding: 10px 20px;
                          border: none;
                          border-radius: 10px;
                          width: 100%;
                          cursor: pointer;
                        `;

                        btnCamera.onclick = () => {
                          modal.remove();
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
                            input.setAttribute('capture', 'camera');
                          }
                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            speak('正在发送照片给子女...');
                            const res = await sendPhotoToChild(file, 1);
                            if (res.status === 'ok') {
                              speak('照片已发送给女儿小丽，她会马上帮您核实');
                              alert('✅ 发送成功！子女已收到您的照片！');
                            } else {
                              speak('发送失败，请重试');
                            }
                          };
                          input.click();
                        };

                        btnAlbum.onclick = () => {
                          modal.remove();
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            speak('正在发送照片给子女...');
                            const res = await sendPhotoToChild(file, 1);
                            if (res.status === 'ok') {
                              speak('照片已发送给女儿小丽，她会马上帮您核实');
                              alert('✅ 发送成功！子女已收到您的照片！');
                            } else {
                              speak('发送失败，请重试');
                            }
                          };
                          input.click();
                        };

                        btnCancel.onclick = () => {
                          modal.remove();
                        };

                        btnGroup.appendChild(btnCamera);
                        btnGroup.appendChild(btnAlbum);
                        btnGroup.appendChild(btnCancel);
                        box.appendChild(title);
                        box.appendChild(btnGroup);
                        modal.appendChild(box);
                        document.body.appendChild(modal);
                      }}
                      className="bg-[#FF9800] text-white text-xl px-8 py-4 rounded-full font-bold"
                    >
                      📸发图给孩子
                    </button>
                    <button 
                      onClick={() => {
                        // 判断是否手机
                        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

                        if (isMobile) {
                          // 手机：直接跳转到拨号盘 96110
                          speak("正在打开反诈专线 96110");
                          window.location.href = "tel:96110";
                        } else {
                          // 电脑：超大字体友好提示
                          speak("当前是电脑，请使用手机拨打 96110");
                          alert("⚠️  请使用手机拨打反诈专线：96110\n免费咨询，守护财产安全");
                        }
                      }}
                      className="bg-[#D32F2F] text-white text-xl px-8 py-4 rounded-full font-bold"
                    >
                      📞拨打96110
                    </button>
                  </div>
                </div>

                <div className="text-2xl font-bold mt-8">📊 防骗工具箱</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-xl text-center shadow hover:scale-105 transition">
                    <div className="text-4xl mb-2">📞</div>
                    <h3 className="text-xl font-bold">陌生电话</h3>
                    <p className="text-gray-500">先核实，不相信</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl text-center shadow hover:scale-105 transition">
                    <div className="text-4xl mb-2">🎁</div>
                    <h3 className="text-xl font-bold">中奖信息</h3>
                    <p className="text-gray-500">全是假的，不要信</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl text-center shadow hover:scale-105 transition">
                    <div className="text-4xl mb-2">💊</div>
                    <h3 className="text-xl font-bold">神医推销</h3>
                    <p className="text-gray-500">不转账，不购买</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl text-center shadow hover:scale-105 transition">
                    <div className="text-4xl mb-2">💰</div>
                    <h3 className="text-xl font-bold">安全转账</h3>
                    <p className="text-gray-500">先问子女，再决定</p>
                  </div>
                </div>
              </div>
            )}

            
            {/* 防骗剧场（通用跳转播放版，适配B站/央视频/所有平台） */}
            {currentPage === 'video' && (
              <div className="flex flex-col h-[85vh] bg-[#1A1A1A] text-white rounded-xl overflow-hidden">
                {/* 顶部栏（和你原来一模一样） */}
                <div className="flex justify-between items-center p-4">
                  <button 
                    onClick={() => { setCurrentPage('home'); speak('返回首页'); }}
                    className="bg-white/10 border border-white/30 px-4 py-2 rounded-full text-sm md:text-base"
                  >
                    ← 返回
                  </button>
                  <h2 className="text-lg md:text-xl font-bold">防骗剧场</h2>
                  <div className="text-xs md:text-sm text-gray-400 hidden md:block">点击卡片跳转到原平台观看</div>
                </div>

                {/* 视频卡片列表（通用适配所有平台） */}
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videoList.map((video) => (
                    <div 
                      key={video.id}
                      onClick={() => {
                        // 点击直接跳转到视频原页面，新窗口打开，不离开你的网站
                        window.open(video.url, '_blank');
                        speak('正在为您打开视频，请稍候');
                      }}
                      className="bg-white/10 p-4 rounded-xl cursor-pointer hover:bg-white/20 transition"
                    >
                      <div className="text-4xl mb-2">📺</div>
                      <h3 className="font-bold text-lg">{video.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">央视频/官方平台发布</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 游戏中心页面 */}
            {currentPage === 'game' && (
              <div className="p-2 space-y-6">

                {/* 标题 + 积分提示 */}
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">🎮 游戏中心</h1>
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                    ✨ 玩游戏≥5分钟，送 <strong>20</strong> 积分
                  </div>
                </div>

                {/* 情景小剧场标题 */}
                <div className="flex justify-between items-center mt-6">
                  <h3 className="text-xl font-bold">🎭 情景小剧场 · 识破骗局</h3>
                  <div className="text-sm text-gray-600">已通关 1/3 关</div>
                </div>

                {/* 关卡卡片横向滚动 */}
                <div className="flex gap-4 overflow-x-auto py-2 px-1">
                  {/* 关卡1 */}
                  <div className="min-w-[260px] bg-white rounded-2xl p-5 shadow relative border border-gray-200">
                    <div className="absolute top-3 left-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">初级 · 100积分</div>
                    <div className="absolute top-3 right-3 text-green-600 text-xs font-bold">✅ 已通关</div>
                    <div className="text-5xl mt-6 mb-2">📦</div>
                    <h4 className="text-lg font-bold">冒充快递客服</h4>
                    <p className="text-gray-500 text-sm mt-1">您的包裹丢了，扫描二维码退款？</p>
                    <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded-xl font-bold">重新挑战</button>
                  </div>

                  {/* 关卡2 */}
                  <div className="min-w-[260px] bg-white rounded-2xl p-5 shadow relative border-2 border-orange-400">
                    <div className="absolute top-3 left-3 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-bold">中级 · 200积分</div>
                    <div className="text-5xl mt-6 mb-2">💊</div>
                    <h4 className="text-lg font-bold">“神医”卖药</h4>
                    <p className="text-gray-500 text-sm mt-1">包治百病的祖传秘方，只要998？</p>
                    <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded-xl font-bold">闯关拿积分换礼品</button>
                  </div>

                  {/* 关卡3 */}
                  <div className="min-w-[260px] bg-white rounded-2xl p-5 shadow relative border border-gray-200">
                    <div className="absolute top-3 left-3 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold">高级 · 500积分</div>
                    <div className="text-5xl mt-6 mb-2">📱</div>
                    <h4 className="text-lg font-bold">AI 换脸诈骗</h4>
                    <p className="text-gray-500 text-sm mt-1">视频里的“女儿”要钱交学费？</p>
                    <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded-xl font-bold">开始挑战</button>
                  </div>
                </div>

                {/* 休闲小游戏标题 */}
                <h3 className="text-xl font-bold mt-8">🧩 休闲小游戏 · 打发时间</h3>

                {/* 休闲游戏网格（手机2列，电脑4列） */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow text-center hover:scale-105 transition cursor-pointer">
                    <div className="bg-[#FFF3E0] text-3xl w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-2">♟️</div>
                    <h4 className="font-bold">中国象棋</h4>
                    <p className="text-xs text-gray-500 mt-1">💡 别信“导师带你稳赚”哦</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow text-center hover:scale-105 transition cursor-pointer">
                    <div className="bg-[#E8F5E9] text-3xl w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-2">🀄</div>
                    <h4 className="font-bold">四川麻将</h4>
                    <p className="text-xs text-gray-500 mt-1">💡 别和陌生人私下转账</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow text-center hover:scale-105 transition cursor-pointer">
                    <div className="bg-[#FFF9C4] text-3xl w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-2">🃏</div>
                    <h4 className="font-bold">欢乐斗地主</h4>
                    <p className="text-xs text-gray-500 mt-1">💡 牌局娱乐为主，切勿赌博</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow text-center hover:scale-105 transition cursor-pointer">
                    <div className="bg-[#FCE4EC] text-3xl w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-2">🍬</div>
                    <h4 className="font-bold">开心消消乐</h4>
                    <p className="text-xs text-gray-500 mt-1">💡 充值找官方，别点假链接</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow text-center hover:scale-105 transition cursor-pointer">
                    <div className="bg-[#F5F5F5] text-3xl w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-2">⚫</div>
                    <h4 className="font-bold">五子棋</h4>
                    <p className="text-xs text-gray-500 mt-1">💡 输赢平常心，警惕诱导投资</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow text-center hover:scale-105 transition cursor-pointer">
                    <div className="bg-[#E1F5FE] text-3xl w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-2">🐟</div>
                    <h4 className="font-bold">捕鱼达人</h4>
                    <p className="text-xs text-gray-500 mt-1">💡 虚假中奖是钩子，莫贪便宜</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow text-center hover:scale-105 transition cursor-pointer">
                    <div className="bg-[#EDE7F6] text-3xl w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-2">🎵</div>
                    <h4 className="font-bold">猜歌达人</h4>
                    <p className="text-xs text-gray-500 mt-1">💡 陌生人提钱，先给子女打电话</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow text-center hover:scale-105 transition cursor-pointer">
                    <div className="bg-[#FFEBEE] text-3xl w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-2">♠️</div>
                    <h4 className="font-bold">纸牌接龙</h4>
                    <p className="text-xs text-gray-500 mt-1">💡 验证码是防线，绝不告诉外人</p>
                  </div>
                </div>

                {/* 休息提示 */}
                <div className="bg-blue-50 text-blue-800 p-3 rounded-xl text-center text-sm mt-6">
                  😊 您已玩了 <span className="font-bold">12</span> 分钟，建议玩够 30 分钟就活动一下身子哦
                </div>

              </div>
            )}

            {/* 积分商城页面 */}
            {currentPage === 'mall' && (
              <div className="space-y-6 pb-10">
                {/* 顶部标题 + 积分 */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">🛒礼品兑换中心
                      <small className="text-base text-gray-500 ml-2">（攒积分，领好物）</small>
                    </h2>
                  </div>
                  <div className="bg-yellow-50 px-5 py-3 rounded-full border-2 border-yellow-400 text-lg font-bold">
                    💰 我的可用积分：<span id="mall-score">{score}</span>
                  </div>
                </div>

                {/* 礼品网格（手机2列，电脑3~4列） */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* 300 积分 */}
                  <div className="bg-white rounded-xl p-5 text-center shadow">
                    <div className="text-5xl mb-3">🕯️</div>
                    <h3 className="text-lg font-bold">驱蚊香包（6个）</h3>
                    <p className="text-orange-500 font-bold text-lg mt-1">300 积分</p>
                    <button 
                      onClick={() => score >= 300 ? (setScore(score - 300), speak('驱蚊香包兑换成功')) : speak('积分不足')} 
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-bold"
                    >
                      立即兑换
                    </button>
                  </div>

                  {/* 320 积分 */}
                  <div className="bg-white rounded-xl p-5 text-center shadow">
                    <div className="text-5xl mb-3">🧵</div>
                    <h3 className="text-lg font-bold">针线盒套装</h3>
                    <p className="text-orange-500 font-bold text-lg mt-1">320 积分</p>
                    <button 
                      onClick={() => score >= 320 ? (setScore(score - 320), speak('针线盒套装兑换成功')) : speak('积分不足')} 
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-bold"
                    >
                      立即兑换
                    </button>
                  </div>

                  {/* 350 积分 */}
                  <div className="bg-white rounded-xl p-5 text-center shadow">
                    <div className="text-5xl mb-3">🧤</div>
                    <h3 className="text-lg font-bold">加厚保暖加绒手套</h3>
                    <p className="text-orange-500 font-bold text-lg mt-1">350 积分</p>
                    <button 
                      onClick={() => score >= 350 ? (setScore(score - 350), speak('加厚保暖加绒手套兑换成功')) : speak('积分不足')} 
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-bold"
                    >
                      立即兑换
                    </button>
                  </div>

                  {/* 380 积分 */}
                  <div className="bg-white rounded-xl p-5 text-center shadow">
                    <div className="text-5xl mb-3">🧦</div>
                    <h3 className="text-lg font-bold">纯棉袜子（5双装）</h3>
                    <p className="text-orange-500 font-bold text-lg mt-1">380 积分</p>
                    <button 
                      onClick={() => score >= 380 ? (setScore(score - 380), speak('纯棉袜子兑换成功')) : speak('积分不足')} 
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-bold"
                    >
                      立即兑换
                    </button>
                  </div>

                  {/* 400 积分 */}
                  <div className="bg-white rounded-xl p-5 text-center shadow">
                    <div className="text-5xl mb-3">💡</div>
                    <h3 className="text-lg font-bold">LED感应小夜灯</h3>
                    <p className="text-orange-500 font-bold text-lg mt-1">400 积分</p>
                    <button 
                      onClick={() => score >= 400 ? (setScore(score - 400), speak('LED感应小夜灯兑换成功')) : speak('积分不足')} 
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-bold"
                    >
                      立即兑换
                    </button>
                  </div>

                  {/* 420 积分 */}
                  <div className="bg-white rounded-xl p-5 text-center shadow">
                    <div className="text-5xl mb-3">🧻</div>
                    <h3 className="text-lg font-bold">原木抽纸（10包）</h3>
                    <p className="text-orange-500 font-bold text-lg mt-1">420 积分</p>
                    <button 
                      onClick={() => score >= 420 ? (setScore(score - 420), speak('原木抽纸兑换成功')) : speak('积分不足')} 
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-bold"
                    >
                      立即兑换
                    </button>
                  </div>

                  {/* 450 积分 */}
                  <div className="bg-white rounded-xl p-5 text-center shadow">
                    <div className="text-5xl mb-3">🛀</div>
                    <h3 className="text-lg font-bold">防滑洗澡专用拖鞋</h3>
                    <p className="text-orange-500 font-bold text-lg mt-1">450 积分</p>
                    <button 
                      onClick={() => score >= 450 ? (setScore(score - 450), speak('防滑洗澡专用拖鞋兑换成功')) : speak('积分不足')} 
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-bold"
                    >
                      立即兑换
                    </button>
                  </div>

                  {/* 480 积分 */}
                  <div className="bg-white rounded-xl p-5 text-center shadow">
                    <div className="text-5xl mb-3">👛</div>
                    <h3 className="text-lg font-bold">轻便布艺短款小钱包</h3>
                    <p className="text-orange-500 font-bold text-lg mt-1">480 积分</p>
                    <button 
                      onClick={() => score >= 480 ? (setScore(score - 480), speak('轻便布艺短款小钱包兑换成功')) : speak('积分不足')} 
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-bold"
                    >
                      立即兑换
                    </button>
                  </div>

                  {/* 500 积分 */}
                  <div className="bg-white rounded-xl p-5 text-center shadow">
                    <div className="text-5xl mb-3">🥤</div>
                    <h3 className="text-lg font-bold">防摔耐高温玻璃水杯</h3>
                    <p className="text-orange-500 font-bold text-lg mt-1">500 积分</p>
                    <button 
                      onClick={() => score >= 500 ? (setScore(score - 500), speak('防摔耐高温玻璃水杯兑换成功')) : speak('积分不足')} 
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-bold"
                    >
                      立即兑换
                    </button>
                  </div>

                  {/* 600 积分 */}
                  <div className="bg-white rounded-xl p-5 text-center shadow">
                    <div className="text-5xl mb-3">🥚</div>
                    <h3 className="text-lg font-bold">新鲜土鸡蛋（30枚）</h3>
                    <p className="text-orange-500 font-bold text-lg mt-1">600 积分</p>
                    <button 
                      onClick={() => score >= 600 ? (setScore(score - 600), speak('新鲜土鸡蛋兑换成功')) : speak('积分不足')} 
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-bold"
                    >
                      立即兑换
                    </button>
                  </div>

                  {/* 700 积分 */}
                  <div className="bg-white rounded-xl p-5 text-center shadow">
                    <div className="text-5xl mb-3">🧴</div>
                    <h3 className="text-lg font-bold">洗护二合一沐浴露</h3>
                    <p className="text-orange-500 font-bold text-lg mt-1">700 积分</p>
                    <button 
                      onClick={() => score >= 700 ? (setScore(score - 700), speak('洗护二合一沐浴露兑换成功')) : speak('积分不足')} 
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-bold"
                    >
                      立即兑换
                    </button>
                  </div>

                  {/* 800 积分 */}
                  <div className="bg-white rounded-xl p-5 text-center shadow">
                    <div className="text-5xl mb-3">🪑</div>
                    <h3 className="text-lg font-bold">折叠便携小马扎</h3>
                    <p className="text-orange-500 font-bold text-lg mt-1">800 积分</p>
                    <button 
                      onClick={() => score >= 800 ? (setScore(score - 800), speak('折叠便携小马扎兑换成功')) : speak('积分不足')} 
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-bold"
                    >
                      立即兑换
                    </button>
                  </div>

                  {/* 900 积分 */}
                  <div className="bg-white rounded-xl p-5 text-center shadow">
                    <div className="text-5xl mb-3">🧴</div>
                    <h3 className="text-lg font-bold">品牌深层洗衣液</h3>
                    <p className="text-orange-500 font-bold text-lg mt-1">900 积分</p>
                    <button 
                      onClick={() => score >= 900 ? (setScore(score - 900), speak('品牌深层洗衣液兑换成功')) : speak('积分不足')} 
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-bold"
                    >
                      立即兑换
                    </button>
                  </div>

                  {/* 1000 积分 */}
                  <div className="bg-white rounded-xl p-5 text-center shadow">
                    <div className="text-5xl mb-3">🥣</div>
                    <h3 className="text-lg font-bold">精美青花瓷碗套装</h3>
                    <p className="text-orange-500 font-bold text-lg mt-1">1000 积分</p>
                    <button 
                      onClick={() => score >= 1000 ? (setScore(score - 1000), speak('精美青花瓷碗套装兑换成功')) : speak('积分不足')} 
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-bold"
                    >
                      立即兑换
                    </button>
                  </div>

                  {/* 1500 积分 */}
                  <div className="bg-white rounded-xl p-5 text-center shadow">
                    <div className="text-5xl mb-3">🥘</div>
                    <h3 className="text-lg font-bold">加厚不粘炒锅</h3>
                    <p className="text-orange-500 font-bold text-lg mt-1">1500 积分</p>
                    <button 
                      onClick={() => score >= 1500 ? (setScore(score - 1500), speak('加厚不粘炒锅兑换成功')) : speak('积分不足')} 
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-bold"
                    >
                      立即兑换
                    </button>
                  </div>
                </div>

                {/* 兑换说明 */}
                <div className="bg-blue-50 p-4 rounded-xl text-sm text-gray-700 mt-6">
                  <p className="font-bold">💡 兑换说明：</p>
                  <p>您只需点击兑换，女儿小丽会收到微信提醒，由她为您填写地址。礼品将直接快递到家！</p>
                </div>
              </div>
            )}

            {/* 亲友圈 */}
            {currentPage === 'circle' && (
              <div className="space-y-5 pb-6">
                {/* 顶部标题 + 发布按钮 */}
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">我的朋友圈</h1>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-1">
                    <span>📸</span> 拍张照/问问大家
                  </button>
                </div>

                {/* 安全提示条 */}
                <div className="bg-green-50 border border-green-200 px-4 py-3 rounded-xl flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-medium"><strong>安全提示：</strong> 您的反诈好友“社区小助手”在线，守护中...</p>
                </div>

                {/* 动态列表 */}
                <div className="space-y-4">
                  {/* 动态1：女儿小丽（家人提醒） */}
                  <div className="bg-white rounded-xl shadow overflow-hidden">
                    {/* 头部 */}
                    <div className="p-4 flex items-center gap-3 border-b border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl border-2 border-green-400">
                        👧
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          女儿小丽
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ml-2">家人的提醒</span>
                        </h3>
                        <p className="text-gray-500 text-sm">今天 10:25</p>
                      </div>
                    </div>

                    {/* 内容 */}
                    <div className="p-4">
                      <p className="font-bold text-red-600 mb-2">
                        爸，最近社区群里要是有人发“登记领鸡蛋”的链接，千万别点！那是骗子用来偷个人信息的，我已经核实过了。
                      </p>
                      <div className="text-4xl text-center my-2">🥚 ➡️ ❌</div>
                    </div>

                    {/* 底部按钮 */}
                    <div className="flex border-t border-gray-100">
                      <button 
                        onClick={() => { setScore(score + 5); speak("点赞成功 +5 积分"); }} 
                        className="flex-1 py-3 text-center font-medium hover:bg-gray-50"
                      >
                        👍 赞一个 (+5分)
                      </button>
                      <button 
                        onClick={() => speak("已发送：真棒！学习防骗知识最安全！")} 
                        className="flex-1 py-3 text-center font-medium hover:bg-gray-50 border-l border-gray-100"
                      >
                        💬 暖心话
                      </button>
                    </div>
                  </div>

                  {/* 动态2：张大爷 */}
                  <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="p-4 flex items-center gap-3 border-b border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl border-2 border-blue-400">
                        👴
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">隔壁张大爷</h3>
                        <p className="text-gray-500 text-sm">今天 09:15</p>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="bg-yellow-50 p-3 rounded-xl mb-3">
                        <p className="font-medium">我刚刚通过了<strong>《神医卖药》</strong>关卡！</p>
                        <p className="text-orange-600 font-bold text-sm mt-1">累计反诈积分：2400</p>
                      </div>
                      <p>老哥们，这个剧场挺有意思，大家都来试试！</p>
                    </div>

                    <div className="flex border-t border-gray-100">
                      <button 
                        onClick={() => { setScore(score + 5); speak("点赞成功 +5 积分"); }} 
                        className="flex-1 py-3 text-center font-medium hover:bg-gray-50"
                      >
                        👍 赞一个 (+5分)
                      </button>
                      <button 
                        onClick={() => speak("已发送：张大爷真棒！学习防骗知识最安全！")} 
                        className="flex-1 py-3 text-center font-medium hover:bg-gray-50 border-l border-gray-100"
                      >
                        💬 暖心话
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    ):(
      // ======================
      // ❌ 未登录：显示登录 / 注册
      // ======================
      <div className="p-4">
        {/* 新增的网站标题部分 */}
  <div className="text-center mb-8 mt-4">
    <div className="inline-block p-3 bg-blue-50 rounded-full mb-3">
      <span className="text-4xl">🛡️</span>
    </div>
    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
        常青守护
      </span>
    </h1>
    <p className="text-gray-500 mt-2 text-sm">智慧防骗 · 守护长辈平安</p>
  </div>
        {currentPage === "login" ? (
          // 登录页
          <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">老人登录</h2>
            <input className="w-full p-3 border rounded mb-2" placeholder="姓名" onChange={(e)=>setLoginForm({...loginForm, elder_name:e.target.value})} />
            <input className="w-full p-3 border rounded mb-4" type="password" placeholder="密码" onChange={(e)=>setLoginForm({...loginForm, password:e.target.value})} />
            <button onClick={handleLogin} className="w-full bg-green-600 text-white p-3 rounded">登录</button>
            <p className="mt-2 text-center">没有账号？<span onClick={()=>setCurrentPage("register")} className="text-blue-600">去注册</span></p>
          </div>
        ) : (
          // 注册页
          <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">新用户注册</h2>
            <h3>👴老人信息</h3>
            <input className="w-full p-2 border rounded mb-2" placeholder="老人姓名" onChange={(e)=>setRegisterForm({...registerForm, elder_name:e.target.value})} />
            <input className="w-full p-2 border rounded mb-2" placeholder="老人身份证" onChange={(e)=>setRegisterForm({...registerForm, elder_id_card:e.target.value})} />
            <input className="w-full p-2 border rounded mb-2" placeholder="老人手机号" onChange={(e)=>setRegisterForm({...registerForm, elder_phone:e.target.value})} />
            
            <h3 className="mt-4">👨‍👩‍👧子女信息</h3>
            <input className="w-full p-2 border rounded mb-2" placeholder="子女姓名" onChange={(e)=>setRegisterForm({...registerForm, child_name:e.target.value})} />
            <input className="w-full p-2 border rounded mb-2" placeholder="子女身份证" onChange={(e)=>setRegisterForm({...registerForm, child_id_card:e.target.value})} />
            <input className="w-full p-2 border rounded mb-2" placeholder="子女手机号" onChange={(e)=>setRegisterForm({...registerForm, child_phone:e.target.value})} />
            
            <h3 className="mt-4">密码</h3>
            <input className="w-full p-2 border rounded mb-4" type="password" placeholder="设置密码" onChange={(e)=>setRegisterForm({...registerForm, password:e.target.value})} />
            <button onClick={handleRegister} className="w-full bg-blue-600 text-white p-3 rounded">注册</button>
            <p className="text-center mt-2">已有账号？<span onClick={()=>setCurrentPage("login")} className="text-green-600">去登录</span></p>
          </div>
        )}
      </div>
    )}
  </>
);
}