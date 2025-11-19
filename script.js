// 背景音乐控制模块
(function () {
  var audio = document.getElementById("bgm");
  var btn = document.getElementById("music-btn");
  if (!audio || !btn) return;

  var isPlaying = false;
  var userInteracted = false;

  function updateBtn() {
    btn.classList.toggle("is-playing", isPlaying);
    btn.classList.toggle("is-paused", !isPlaying);
  }

  function play() {
    audio
      .play()
      .then(function () {
        isPlaying = true;
        updateBtn();
      })
      .catch(function (error) {
        console.log('播放失败:', error);
        isPlaying = false;
        updateBtn();
      });
  }

  function pause() {
    audio.pause();
    isPlaying = false;
    updateBtn();
  }

  // 修改点击事件处理
  btn.addEventListener("click", function () {
    userInteracted = true;
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  });

  // 自动播放逻辑
  function tryAutoPlay() {
    if (isPlaying) return;
    
    // 尝试直接播放
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isPlaying = true;
          updateBtn();
        })
        .catch(error => {
          console.log('自动播放被阻止，等待用户交互后重试');
          // 用户交互后重试播放
          const playOnInteraction = () => {
            audio.play().then(() => {
              isPlaying = true;
              updateBtn();
              document.removeEventListener('click', playOnInteraction);
              document.removeEventListener('touchstart', playOnInteraction);
            });
          };
          document.addEventListener('click', playOnInteraction);
          document.addEventListener('touchstart', playOnInteraction);
        });
    }
  }

  // 页面加载后立即尝试自动播放
  document.addEventListener('DOMContentLoaded', function() {
    // 立即尝试播放（不等待load事件）
    tryAutoPlay();
    
    // 如果上面没成功，load事件后再试一次
    window.addEventListener('load', function() {
      if (!isPlaying) {
        tryAutoPlay();
      }
    });
  });

  // 移动端触摸事件
  document.addEventListener(
    "touchstart",
    function () {
      if (!userInteracted) {
        userInteracted = true;
        tryAutoPlay();
      }
    },
    { once: true }
  );

  updateBtn();
})();

// 背景特效生成模块：爱心与花瓣
(function () {
  var layer = document.getElementById("effects-layer");
  if (!layer) return;

  var maxHearts = 14;
  var maxPetals = 18;

  function createHeart() {
    if (layer.querySelectorAll(".heart").length >= maxHearts) return;

    var el = document.createElement("div");
    el.className = "heart";
    var vw = window.innerWidth;
    el.style.left = Math.random() * vw + "px";
    el.style.bottom = "-10px";
    el.style.animation = "float " + (3 + Math.random() * 2) + "s linear";
    layer.appendChild(el);

    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 6000);
  }

  function createPetal() {
    if (layer.querySelectorAll(".petal").length >= maxPetals) return;

    var el = document.createElement("div");
    el.className = "petal";
    var vw = window.innerWidth;
    el.style.left = Math.random() * vw + "px";
    el.style.top = "-80px";
    var duration = 6 + Math.random() * 4;
    el.style.animation = "fall " + duration + "s linear";
    el.style.opacity = String(0.6 + Math.random() * 0.4);
    layer.appendChild(el);

    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, (duration + 1) * 1000);
  }

  setInterval(createHeart, 900);
  setInterval(createPetal, 1200);
})();

// 照片长卷自动滚动模块
(function () {
  var container = document.getElementById("photos-container");
  if (!container) return;

  var autoScrollId = null;
  var autoScrollActive = false;
  var lastInteractionTime = Date.now();
  var INACTIVE_MS = 3000; // 超过 3 秒无操作开始自动滑动

  function autoScroll() {
    if (!autoScrollActive) return;

    var now = Date.now();
    if (now - lastInteractionTime < INACTIVE_MS) {
      // 用户刚刚有过操作，暂停自动滚动
      autoScrollActive = false;
      autoScrollId = null;
      return;
    }

    var current = window.scrollY;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (current >= maxScroll - 2) {
      // 已经接近页面底部，停止自动滚动
      autoScrollActive = false;
      autoScrollId = null;
      return;
    }

    var next = current + 0.35; // 控制滚动速度
    window.scrollTo(0, next);
    autoScrollId = window.requestAnimationFrame(autoScroll);
  }

  function requestAutoScroll() {
    if (autoScrollActive) return;

    var now = Date.now();
    if (now - lastInteractionTime >= INACTIVE_MS) {
      autoScrollActive = true;
      autoScrollId = window.requestAnimationFrame(autoScroll);
    }
  }

  function markInteraction() {
    lastInteractionTime = Date.now();
    autoScrollActive = false;
    if (autoScrollId) {
      window.cancelAnimationFrame(autoScrollId);
      autoScrollId = null;
    }
  }

  ["touchstart", "wheel", "scroll", "keydown", "mousemove"].forEach(function (evt) {
    window.addEventListener(
      evt,
      function () {
        markInteraction();
      },
      { passive: true }
    );
  });

  // 定时检查是否处于无操作状态
  setInterval(requestAutoScroll, 500);
})();

// 照片淡入动画 & section 进入动画
(function () {
  var photos = document.querySelectorAll(".photo-item");
  var sections = document.querySelectorAll(".animate-section");

  if ("IntersectionObserver" in window) {
    var photoObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            photoObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    photos.forEach(function (img) {
      photoObserver.observe(img);
    });

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    sections.forEach(function (sec) {
      sectionObserver.observe(sec);
    });
  } else {
    photos.forEach(function (img) {
      img.classList.add("is-visible");
    });
    sections.forEach(function (sec) {
      sec.classList.add("in-view");
    });
  }
})();

// 封面倒计时模块
(function () {
  var box = document.getElementById("cover-countdown");
  if (!box) return;

  var daysEl = box.querySelector(".cd-days");
  var hEl = box.querySelector(".cd-h");
  var mEl = box.querySelector(".cd-m");
  var sEl = box.querySelector(".cd-s");

  var dateStr = box.getAttribute("data-wedding-date");
  if (!dateStr) return;

  // 优先直接用原始字符串解析（支持 ISO 格式 2026-01-08T12:00:00）
  var target = new Date(dateStr);
  if (isNaN(target.getTime())) {
    // 兜底：部分环境仅接受 "YYYY/MM/DD HH:MM:SS" 形式
    var fallback = dateStr.replace(/-/g, "/").replace("T", " ");
    target = new Date(fallback);
  }
  if (isNaN(target.getTime())) return;

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function update() {
    var now = new Date();
    var diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      daysEl.textContent = "00";
      hEl.textContent = "00";
      mEl.textContent = "00";
      sEl.textContent = "00";
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / (24 * 3600));
    var remain = totalSeconds % (24 * 3600);
    var hours = Math.floor(remain / 3600);
    remain = remain % 3600;
    var minutes = Math.floor(remain / 60);
    var seconds = remain % 60;

    daysEl.textContent = pad(days);
    hEl.textContent = pad(hours);
    mEl.textContent = pad(minutes);
    sEl.textContent = pad(seconds);
  }

  update();
  setInterval(update, 1000);
})();
