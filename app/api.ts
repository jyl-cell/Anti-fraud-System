// utils/api.ts
const API = "http://localhost:8080/api";

// 获取用户积分信息
export async function getUserInfo(userId: number = 1) {
  const res = await fetch(`${API}/user/info/${userId}`);
  return res.json();
}

// 增加积分
export async function addScore(userId: number = 1, num: number) {
  await fetch(`${API}/user/addScore`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId, score: num })
  });
}

// 商品兑换
export async function exchangeGoods(userId:number=1, goodsId:number, cost:number) {
  await fetch(`${API}/mall/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, goodsId, cost })
  });
}

// ====================
// 首页功能：拍照发给子女
// ====================
export async function sendPhotoToChild(file: File, userId: number = 1) {
  const formData = new FormData()
  formData.append('photo', file)
  formData.append('userId', userId.toString())

  const res = await fetch('http://localhost:8080/api/home/send-to-child', {
    method: 'POST',
    body: formData
  })

  return await res.json()
}

// 防骗剧场 - 获取数据库视频列表
export async function getVideoList() {
  const res = await fetch('http://localhost:8080/api/video/list')
  return res.json()
}

// 视频点赞

export async function likeVideo(videoId: number, userId: number = 1) {
  const res = await fetch('http://localhost:8080/api/video/like', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId, userId })
  })
  return res.json()
}

// 视频收藏
export async function favoriteVideo(videoId: number, userId: number = 1) {
  const res = await fetch('http://localhost:8080/api/video/favorite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId, userId })
  })
  return res.json()
}

// 注册（加了try/catch方便调试）
export async function register(data: any) {
  try {
    const r = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.error("注册请求失败", e);
    alert("注册失败：请确认后端已启动，且地址为 http://localhost:8080");
    return { error: "请求失败" };
  }
}

// 其他接口同理，比如登录：
export async function login(elder_name: string, password: string) {
  try {
    const r = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ elder_name, password }),
    });
    return await r.json();
  } catch (e) {
    console.error("登录失败", e);
    alert("登录失败");
    return { error: "请求失败" };
  }
}
// api.ts
export async function checkLogin(token?: string | null) {
  const headers: any = {}
  if (token) {
    headers['Authorization'] = 'Bearer ' + token
  }

  const res = await fetch('http://localhost:8080/api/auth/check', {
    headers: headers
  })
  return res.json()
}