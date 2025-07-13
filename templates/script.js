const imgs = document.querySelectorAll('.bouncingImage');

// 為每顆馬鈴薯建立獨立狀態
const potatoes = Array.from(imgs).map(img => {
  const imgWidth = 100;
  const imgHeight = 100;
  return {
    img,
    x: Math.random() * (window.innerWidth - imgWidth),
    y: Math.random() * (window.innerHeight - imgHeight),
    vx: (Math.random() * 4 + 2) * (Math.random() < 0.5 ? 1 : -1),
    vy: (Math.random() * 4 + 2) * (Math.random() < 0.5 ? 1 : -1),
    angle: Math.random() * 360
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
  const centerX = x + w / 2;
  const centerY = y + h / 2;
  const dx = centerX - mouseX;
  const dy = centerY - mouseY;
  return Math.sqrt(dx * dx + dy * dy) < mouseRadius;
}

function boostIfSlow(potato) {
  const minSpeed = 2.5;
  const speed = Math.sqrt(potato.vx * potato.vx + potato.vy * potato.vy);
  if (speed < minSpeed) {
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
  const minDist = imgWidth * 0.9;
  if (dist < minDist && dist > 0) {
    const overlap = minDist - dist;
    const nx = dx / dist;
    const ny = dy / dist;
    p1.x -= nx * overlap / 2;
    p1.y -= ny * overlap / 2;
    p2.x += nx * overlap / 2;
    p2.y += ny * overlap / 2;
    const v1 = {x: p1.vx, y: p1.vy};
    const v2 = {x: p2.vx, y: p2.vy};
    p1.vx = v2.x;
    p1.vy = v2.y;
    p2.vx = v1.x;
    p2.vy = v1.y;
  }
}

function animate() {
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

    if (isCollidingWithMouse(potato.x, potato.y, imgWidth, imgHeight)) {
      const centerX = potato.x + imgWidth / 2;
      const centerY = potato.y + imgHeight / 2;
      const dx = centerX - mouseX;
      const dy = centerY - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      potato.vx = (dx / dist) * (Math.abs(potato.vx) + Math.random());
      potato.vy = (dy / dist) * (Math.abs(potato.vy) + Math.random());
    }

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

setTimeout(showPotatoes, 300);
animate();
