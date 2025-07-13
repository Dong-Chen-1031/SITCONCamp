const imgs = document.querySelectorAll('.bouncingImage');

// 為每顆馬鈴薯建立獨立狀態
const potatoes = Array.from(imgs).map(img => {
  // 隨機初始位置
  const imgWidth = 100;
  const imgHeight = 100;
  return {
    img,
    x: Math.random() * (window.innerWidth - imgWidth),
    y: Math.random() * (window.innerHeight - imgHeight),
    vx: (Math.random() * 4 + 2) * (Math.random() < 0.5 ? 1 : -1),
    vy: (Math.random() * 4 + 2) * (Math.random() < 0.5 ? 1 : -1),
    angle: Math.random() * 360
    // img.style.display = 'block'; // 隱藏原始圖片，使用 JavaScript 動態顯示
  };
});


let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
const mouseRadius = 80;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function isCollidingWithMouse(x, y, w, h) {
  // 判斷圖片中心是否進入滑鼠區域
  const centerX = x + w / 2;
  const centerY = y + h / 2;
  const dx = centerX - mouseX;
  const dy = centerY - mouseY;
  return Math.sqrt(dx * dx + dy * dy) < mouseRadius;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function boostIfSlow(potato) {
  const minSpeed = 2.5;
  const speed = Math.sqrt(potato.vx * potato.vx + potato.vy * potato.vy);
  if (speed < minSpeed) {
    // 隨機方向加速
    const angle = Math.random() * Math.PI * 2;
    potato.vx += Math.cos(angle) * (minSpeed - speed + Math.random());
    potato.vy += Math.sin(angle) * (minSpeed - speed + Math.random());
  }
}

function resolvePotatoCollision(p1, p2) {
  const imgWidth = 100;
  const imgHeight = 100;
  const centerX1 = p1.x + imgWidth / 2;
  const centerY1 = p1.y + imgHeight / 2;
  const centerX2 = p2.x + imgWidth / 2;
  const centerY2 = p2.y + imgHeight / 2;
  const dx = centerX2 - centerX1;
  const dy = centerY2 - centerY1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = imgWidth * 0.9; // 90% of width
  if (dist < minDist && dist > 0) {
    // 分開位置
    const overlap = minDist - dist;
    const nx = dx / dist;
    const ny = dy / dist;
    p1.x -= nx * overlap / 2;
    p1.y -= ny * overlap / 2;
    p2.x += nx * overlap / 2;
    p2.y += ny * overlap / 2;
    // 反彈速度
    const v1 = {x: p1.vx, y: p1.vy};
    const v2 = {x: p2.vx, y: p2.vy};
    p1.vx = v2.x;
    p1.vy = v2.y;
    p2.vx = v1.x;
    p2.vy = v1.y;
  }
}

function animate() {
  // 馬鈴薯間碰撞偵測
  for (let i = 0; i < potatoes.length; i++) {
    for (let j = i + 1; j < potatoes.length; j++) {
      resolvePotatoCollision(potatoes[i], potatoes[j]);
    }
  }
  potatoes.forEach(potato => {
    potato.x += potato.vx;
    potato.y += potato.vy;
    const imgWidth = potato.img.offsetWidth || 100;
    const imgHeight = potato.img.offsetHeight || 100;

    // 邊界反彈且不超出邊界
    if (potato.x <= 0) {
      potato.x = 0;
      potato.vx = Math.abs(potato.vx);
    }
    if (potato.x + imgWidth >= window.innerWidth) {
      potato.x = window.innerWidth - imgWidth;
      potato.vx = -Math.abs(potato.vx);
    }
    if (potato.y <= 0) {
      potato.y = 0;
      potato.vy = Math.abs(potato.vy);
    }
    if (potato.y + imgHeight >= window.innerHeight) {
      potato.y = window.innerHeight - imgHeight;
      potato.vy = -Math.abs(potato.vy);
    }

    // 滑鼠碰撞反彈
    if (isCollidingWithMouse(potato.x, potato.y, imgWidth, imgHeight)) {
      const centerX = potato.x + imgWidth / 2;
      const centerY = potato.y + imgHeight / 2;
      const dx = centerX - mouseX;
      const dy = centerY - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      potato.vx = (dx / dist) * (Math.abs(potato.vx) + Math.random());
      potato.vy = (dy / dist) * (Math.abs(potato.vy) + Math.random());
    }

    // 速度太慢時給予推力
    boostIfSlow(potato);

    potato.angle += 5;
    potato.img.style.left = `${potato.x}px`;
    potato.img.style.top = `${potato.y}px`;
    potato.img.style.transform = `rotate(${potato.angle}deg)`;
    potato.img.style.position = 'absolute';
    potato.img.style.width = '100px';
    potato.img.style.height = '100px';
    potato.img.style.pointerEvents = 'none';
  });
  requestAnimationFrame(animate);
}

function showPotatoes() {
  potatoes.forEach(potato => {
    potato.img.style.visibility = 'visible';
  });
}

// 動畫初始化後顯示馬鈴薯
setTimeout(showPotatoes, 300);

animate();

// 四段式 iOS-style 主題切換
const themeRoot = document.getElementById('theme-root');
const heavenBg = document.getElementById('heaven-bg');
const hellBg = document.getElementById('hell-bg');
const iosSwitch4 = document.getElementById('ios-switch-4');
const iosThumb4 = document.getElementById('ios-switch-4-thumb');
const iosIcon4 = document.getElementById('ios-switch-4-icon');
// 0: light, 1: dark, 2: heaven, 3: hell
let themeMode = 0;
let dragging = false, startX = 0, thumbStart = 0;
// 四段 thumb 精確位置（根據 switch 寬度 120px, thumb 28px, track 4px padding）
const positions = [4, 34, 64, 94];
const icons = ['☀️', '🌙', '😇', '😈'];

function updatePotatoImages(mode) {
  const potatoImgs = document.querySelectorAll('.bouncingImage');
  let src = '';
  if (mode === 0) src = '/static/img/egg.jpg'; // 淺色
  else if (mode === 1) src = '/static/img/putato.png'; // 深色
  else if (mode === 2) src = '/static/img/apple.png'; // 天堂
  else if (mode === 3) src = '/static/img/chili.jpg'; // 地獄
  potatoImgs.forEach(img => { img.src = src; });
}

function setThemeMode(mode, animate = true) {
  themeMode = mode;
  iosThumb4.style.left = positions[mode] + 'px';
  iosIcon4.textContent = icons[mode];
  themeRoot.classList.remove('heaven-bg', 'hell-bg');
  updatePotatoImages(mode); // 主題切換時更新圖片
  if (mode === 0) {
    themeRoot.classList.remove('dark');
    document.body.classList.remove('dark');
    heavenBg.style.display = 'none';
    hellBg.style.display = 'none';
  } else if (mode === 1) {
    themeRoot.classList.add('dark');
    document.body.classList.add('dark');
    heavenBg.style.display = 'none';
    hellBg.style.display = 'none';
  } else if (mode === 2) {
    themeRoot.classList.remove('dark');
    document.body.classList.remove('dark');
    heavenBg.style.display = '';
    hellBg.style.display = 'none';
    themeRoot.classList.add('heaven-bg');
  } else if (mode === 3) {
    themeRoot.classList.add('dark');
    document.body.classList.add('dark');
    heavenBg.style.display = 'none';
    hellBg.style.display = '';
    themeRoot.classList.add('hell-bg');
  }
  if (!animate) {
    iosThumb4.style.transition = 'none';
    setTimeout(()=>{ iosThumb4.style.transition = ''; }, 10);
  }
}(window.matchMedia('(prefers-color-scheme: dark)').matches ? 1 : 0, false);

// 點擊切換
iosSwitch4.addEventListener('click', function(e) {
  if (dragging) return;
  // 根據點擊位置決定模式
  const rect = iosSwitch4.getBoundingClientRect();
  const x = e.clientX - rect.left;
  let idx = 0;
  if (x > rect.width * 0.85) idx = 3;
  else if (x > rect.width * 0.6) idx = 2;
  else if (x > rect.width * 0.35) idx = 1;
  setThemeMode(idx);
});

// 拖曳切換
iosThumb4.addEventListener('mousedown', function(e) {
  dragging = true;
  startX = e.clientX;
  thumbStart = parseInt(iosThumb4.style.left) || positions[themeMode];
  iosThumb4.style.transition = 'none';
  document.body.style.userSelect = 'none';
});
document.addEventListener('mousemove', function(e) {
  if (!dragging) return;
  let dx = e.clientX - startX;
  let newLeft = Math.min(positions[3], Math.max(positions[0], thumbStart + dx));
  iosThumb4.style.left = newLeft + 'px';
  // 動態切換 icon
  let idx = 0;
  if (newLeft > (positions[2] + positions[3]) / 2) idx = 3;
  else if (newLeft > (positions[1] + positions[2]) / 2) idx = 2;
  else if (newLeft > (positions[0] + positions[1]) / 2) idx = 1;
  iosIcon4.textContent = icons[idx];
});
document.addEventListener('mouseup', function(e) {
  if (!dragging) return;
  dragging = false;
  document.body.style.userSelect = '';
  let left = parseInt(iosThumb4.style.left) || positions[themeMode];
  let idx = 0;
  if (left > (positions[2] + positions[3]) / 2) idx = 3;
  else if (left > (positions[1] + positions[2]) / 2) idx = 2;
  else if (left > (positions[0] + positions[1]) / 2) idx = 1;
  setThemeMode(idx);
  iosThumb4.style.transition = '';
});

// 監聽系統主題變化（只在 light/dark 時自動切換）
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (themeMode === 0 || themeMode === 1) setThemeMode(e.matches ? 1 : 0);
});

// 初始化（根據系統預設）
setThemeMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 1 : 0, false);

// // 點擊切換
// iosSwitch4.addEventListener('click', function(e) {
//   if (dragging) return;
//   // 根據點擊位置決定模式
//   const rect = iosSwitch4.getBoundingClientRect();
//   const x = e.clientX - rect.left;
//   let idx = 0;
//   if (x > rect.width * 0.85) idx = 3;
//   else if (x > rect.width * 0.6) idx = 2;
//   else if (x > rect.width * 0.35) idx = 1;
//   setThemeMode(idx);
// });

// 拖曳切換
// iosThumb4.addEventListener('mousedown', function(e) {
//   dragging = true;
//   startX = e.clientX;
//   thumbStart = parseInt(iosThumb4.style.left) || positions[themeMode];
//   iosThumb4.style.transition = 'none';
//   document.body.style.userSelect = 'none';
// });
// document.addEventListener('mousemove', function(e) {
//   if (!dragging) return;
//   let dx = e.clientX - startX;
//   let newLeft = Math.min(positions[3], Math.max(positions[0], thumbStart + dx));
//   iosThumb4.style.left = newLeft + 'px';
//   // 動態切換 icon
//   let idx = 0;
//   if (newLeft > (positions[2] + positions[3]) / 2) idx = 3;
//   else if (newLeft > (positions[1] + positions[2]) / 2) idx = 2;
//   else if (newLeft > (positions[0] + positions[1]) / 2) idx = 1;
//   iosIcon4.textContent = icons[idx];
// });
// document.addEventListener('mouseup', function(e) {
//   if (!dragging) return;
//   dragging = false;
//   document.body.style.userSelect = '';
//   let left = parseInt(iosThumb4.style.left) || positions[themeMode];
//   let idx = 0;
//   if (left > (positions[2] + positions[3]) / 2) idx = 3;
//   else if (left > (positions[1] + positions[2]) / 2) idx = 2;
//   else if (left > (positions[0] + positions[1]) / 2) idx = 1;
//   setThemeMode(idx);
//   iosThumb4.style.transition = '';
// });

// 監聽系統主題變化（只在 light/dark 時自動切換）
// window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
//   if (themeMode === 0 || themeMode === 1) setThemeMode(e.matches ? 1 : 0);
// });

