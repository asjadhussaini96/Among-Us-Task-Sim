// ============================================================
//  AMONG US TASK SIMULATOR — GAME SCRIPT
// ============================================================

const COLORS = [
  { name:'Red',    hex:'#c51111', dark:'#8b0000' },
  { name:'Blue',   hex:'#1320c1', dark:'#0a1580' },
  { name:'Green',  hex:'#127f2d', dark:'#085218' },
  { name:'Pink',   hex:'#ed54ba', dark:'#c2368a' },
  { name:'Orange', hex:'#ef7d0e', dark:'#c05a00' },
  { name:'Yellow', hex:'#f5f558', dark:'#c8c820' },
  { name:'Black',  hex:'#3f474e', dark:'#1a1f23' },
  { name:'White',  hex:'#d7e1f1', dark:'#9aaabf' },
  { name:'Purple', hex:'#6b2fbb', dark:'#4a1d80' },
  { name:'Brown',  hex:'#71491e', dark:'#4a2e0a' },
  { name:'Cyan',   hex:'#38fedc', dark:'#1abba8' },
  { name:'Lime',   hex:'#50ef39', dark:'#2eb825' },
];

const TASKS = [
  { id:'wiring',     name:'Fix Wiring',          loc:'Electrical',  icon:'\u26A1' },
  { id:'swipe',      name:'Swipe Card',           loc:'Admin',       icon:'\uD83D\uDCB3' },
  { id:'download',   name:'Download Data',        loc:'Navigation',  icon:'\uD83D\uDCE1' },
  { id:'fuel',       name:'Fuel Engines',         loc:'Storage',     icon:'\u26BD' },
  { id:'align',      name:'Align Engine Output',  loc:'Engine Room', icon:'\uD83D\uDD27' },
  { id:'reactor',    name:'Start Reactor',        loc:'Reactor',     icon:'\u2622\uFE0F' },
  { id:'garbage',    name:'Empty Garbage',        loc:'O2',          icon:'\uD83D\uDDD1\uFE0F' },
  { id:'idcode',     name:'Enter ID Code',        loc:'Admin',       icon:'\uD83D\uDD22' },
  { id:'scan',       name:'Submit Scan',          loc:'MedBay',      icon:'\uD83D\uDD2C' },
  { id:'asteroids',  name:'Shoot Asteroids',      loc:'Navigation',  icon:'\uD83C\uDF0C' },
  { id:'adminmap',   name:'Admin Map',            loc:'Admin',       icon:'\uD83D\uDDFA\uFE0F' },
  { id:'clearaster', name:'Clear Asteroids',      loc:'Weapons',     icon:'\uD83D\uDCA5' },
];

let playerName     = '';
let playerColor    = COLORS[0];
let completedTasks = new Set();
let currentTaskId  = null;

// ============================================================
//  SVG HELPERS
// ============================================================
function crewmateSVG(color, dark, size) {
  size = size || 80;
  return '<svg width="' + size + '" height="' + (size * 1.2) + '" viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg">'
    + '<path d="M16 54 L16 34 Q16 12 40 12 Q64 12 64 34 L64 54 L56 54 L56 70 L24 70 L24 54 Z" fill="' + color + '"/>'
    + '<rect x="56" y="36" width="14" height="22" rx="5" fill="' + dark + '"/>'
    + '<rect x="22" y="20" width="28" height="18" rx="9" fill="#9eeeff"/>'
    + '<rect x="24" y="22" width="12" height="14" rx="6" fill="rgba(255,255,255,0.35)"/>'
    + '<rect x="22" y="68" width="14" height="16" rx="5" fill="' + dark + '"/>'
    + '<rect x="44" y="68" width="14" height="16" rx="5" fill="' + dark + '"/>'
    + '<ellipse cx="34" cy="22" rx="6" ry="4" fill="rgba(255,255,255,0.2)"/>'
    + '</svg>';
}

function miniSVG(color, dark, size) {
  size = size || 32;
  return '<svg width="' + size + '" height="' + (size * 1.2) + '" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">'
    + '<path d="M8 28 L8 18 Q8 6 20 6 Q32 6 32 18 L32 28 L28 28 L28 36 L12 36 L12 28 Z" fill="' + color + '"/>'
    + '<rect x="28" y="18" width="7" height="12" rx="3" fill="' + dark + '"/>'
    + '<rect x="11" y="10" width="14" height="10" rx="5" fill="#9eeeff"/>'
    + '<rect x="11" y="34" width="7" height="9" rx="3" fill="' + dark + '"/>'
    + '<rect x="22" y="34" width="7" height="9" rx="3" fill="' + dark + '"/>'
    + '</svg>';
}

// ============================================================
//  SETUP SCREEN — BUILD COLOR BUTTONS
// ============================================================
var colorGrid = document.getElementById('color-grid');
COLORS.forEach(function(c, i) {
  var btn = document.createElement('button');
  btn.className = 'color-btn' + (i === 0 ? ' selected' : '');
  btn.style.background = c.hex;
  btn.title = c.name;
  btn.addEventListener('click', function() {
    document.querySelectorAll('.color-btn').forEach(function(b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
    playerColor = c;
  });
  colorGrid.appendChild(btn);
});

function startGame() {
  var nameEl = document.getElementById('player-name');
  playerName = (nameEl.value.trim()) || 'Crewmate';
  document.getElementById('header-name').textContent = playerName;
  document.getElementById('header-mate').innerHTML = miniSVG(playerColor.hex, playerColor.dark, 36);
  buildFloatingBg();
  buildTaskList();
  showScreen('home-screen');
}

// ============================================================
//  FLOATING BG CREWMATES
// ============================================================
function buildFloatingBg() {
  var bg = document.getElementById('floating-bg');
  bg.innerHTML = '';
  var others = COLORS.filter(function(c) { return c !== playerColor; });
  for (var i = 0; i < 8; i++) {
    var c   = others[i % others.length];
    var div = document.createElement('div');
    div.className   = 'floating-mate';
    div.innerHTML   = crewmateSVG(c.hex, c.dark, 60 + Math.random() * 40);
    div.style.left  = (5 + Math.random() * 90) + '%';
    div.style.top   = (5 + Math.random() * 90) + '%';
    div.style.animationDuration = (4 + Math.random() * 5) + 's';
    div.style.animationDelay   = (-Math.random() * 8) + 's';
    bg.appendChild(div);
  }
}

// ============================================================
//  TASK LIST
// ============================================================
function buildTaskList() {
  var list = document.getElementById('task-list');
  list.innerHTML = '';
  TASKS.forEach(function(task, idx) {
    var done      = completedTasks.has(task.id);
    var available = idx === 0 || completedTasks.has(TASKS[idx - 1].id);
    var div       = document.createElement('div');
    div.className = 'task-item' + (done ? ' done' : '') + (!available && !done ? ' locked' : '');
    div.innerHTML =
      '<div class="task-icon">' + task.icon + '</div>'
      + '<div class="task-info">'
      +   '<div class="task-name">' + task.name + '</div>'
      +   '<div class="task-loc">' + task.loc + '</div>'
      + '</div>'
      + '<div class="task-check">' + (done ? '\u2705' : (available ? '\u25BA' : '\uD83D\uDD12')) + '</div>';
    if (!done && available) {
      div.addEventListener('click', function() { openTask(task.id); });
    }
    list.appendChild(div);
  });
  updateProgress();
}

function updateProgress() {
  var pct = (completedTasks.size / TASKS.length) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';
}

// ============================================================
//  SCREEN NAVIGATION
// ============================================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
}

function goHome() {
  showScreen('home-screen');
  buildTaskList();
}

// ============================================================
//  OPEN TASK
// ============================================================
function openTask(id) {
  currentTaskId = id;
  var task = TASKS.find(function(t) { return t.id === id; });
  document.getElementById('task-title').textContent = task.name.toUpperCase();
  document.getElementById('task-body').innerHTML = '';
  showScreen('task-screen');
  switch (id) {
    case 'wiring':     buildWiring();     break;
    case 'swipe':      buildSwipe();      break;
    case 'download':   buildDownload();   break;
    case 'fuel':       buildFuel();       break;
    case 'align':      buildAlign();      break;
    case 'reactor':    buildReactor();    break;
    case 'garbage':    buildGarbage();    break;
    case 'idcode':     buildIdCode();     break;
    case 'scan':       buildScan();       break;
    case 'asteroids':  buildAsteroids();  break;
    case 'adminmap':   buildAdminMap();   break;
    case 'clearaster': buildClearAster(); break;
  }
}

// ============================================================
//  TASK COMPLETE
// ============================================================
function taskComplete(id) {
  completedTasks.add(id);
  var overlay = document.createElement('div');
  overlay.className = 'task-success-overlay';
  overlay.innerHTML = '<div class="success-label">\u2713 TASK COMPLETE!</div>';
  document.body.appendChild(overlay);
  setTimeout(function() { overlay.remove(); }, 1200);
  setTimeout(function() {
    if (completedTasks.size === TASKS.length) {
      showVictory();
    } else {
      goHome();
    }
  }, 1300);
}

// ============================================================
//  TASK 1: FIX WIRING
// ============================================================
function buildWiring() {
  var body        = document.getElementById('task-body');
  var wireColors  = ['#ff4444', '#4488ff', '#44cc44', '#ffcc00'];
  var leftOrder   = [0, 1, 2, 3];
  var rightOrder  = [2, 0, 3, 1];
  var selectedLeft = null;
  var connections  = {};

  body.innerHTML =
    '<div style="position:relative;">'
    + '<div class="wire-container" id="wc">'
    +   '<div class="wire-side" id="left-side"></div>'
    +   '<canvas class="wire-canvas" id="wire-canvas" width="400" height="280"></canvas>'
    +   '<div class="wire-side" id="right-side"></div>'
    + '</div>'
    + '<div class="wire-hint">Connect left nodes to matching coloured nodes on the right</div>'
    + '</div>';

  var leftSide  = document.getElementById('left-side');
  var rightSide = document.getElementById('right-side');
  var canvas    = document.getElementById('wire-canvas');
  var ctx       = canvas.getContext('2d');

  leftOrder.forEach(function(ci) {
    var node = document.createElement('div');
    node.className        = 'wire-node';
    node.style.background = wireColors[ci];
    node.dataset.color    = ci;
    node.dataset.side     = 'left';
    node.addEventListener('click', function() {
      if (connections[ci] !== undefined) return;
      document.querySelectorAll('.wire-node[data-side="left"]').forEach(function(n) { n.classList.remove('selected'); });
      node.classList.add('selected');
      selectedLeft = ci;
    });
    leftSide.appendChild(node);
  });

  rightOrder.forEach(function(ci) {
    var node = document.createElement('div');
    node.className        = 'wire-node';
    node.style.background = wireColors[ci];
    node.dataset.color    = ci;
    node.dataset.side     = 'right';
    node.addEventListener('click', function() {
      if (selectedLeft === null) return;
      if (Object.values(connections).indexOf(ci) !== -1) return;
      connections[selectedLeft] = ci;
      document.querySelector('.wire-node[data-side="left"][data-color="' + selectedLeft + '"]').classList.remove('selected');
      document.querySelector('.wire-node[data-side="left"][data-color="' + selectedLeft + '"]').classList.add('connected');
      node.classList.add('connected');
      selectedLeft = null;
      drawWires();
      if (Object.keys(connections).length === 4 && checkWires()) {
        setTimeout(function() { taskComplete('wiring'); }, 400);
      }
    });
    rightSide.appendChild(node);
  });

  function getNodePos(side, colorIdx) {
    var nodes   = document.querySelectorAll('.wire-node[data-side="' + side + '"]');
    var order   = side === 'left' ? leftOrder : rightOrder;
    var nodeIdx = order.indexOf(colorIdx);
    var node    = nodes[nodeIdx];
    var wc      = document.getElementById('wc').getBoundingClientRect();
    var nr      = node.getBoundingClientRect();
    return {
      x: side === 'left' ? nr.right - wc.left : nr.left - wc.left,
      y: nr.top + nr.height / 2 - wc.top
    };
  }

  function drawWires() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Object.keys(connections).forEach(function(li) {
      var ri = connections[li];
      var l  = getNodePos('left',  parseInt(li));
      var r  = getNodePos('right', parseInt(ri));
      var cx = canvas.width / 2;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.bezierCurveTo(cx, l.y, cx, r.y, r.x, r.y);
      ctx.strokeStyle  = wireColors[parseInt(li)];
      ctx.lineWidth    = 4;
      ctx.shadowBlur   = 10;
      ctx.shadowColor  = wireColors[parseInt(li)];
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
  }

  function checkWires() {
    return Object.keys(connections).every(function(l) { return parseInt(l) === parseInt(connections[l]); });
  }
}

// ============================================================
//  TASK 2: SWIPE CARD
// ============================================================
function buildSwipe() {
  var body = document.getElementById('task-body');
  body.innerHTML =
    '<div class="swipe-area" id="swipe-area">'
    + '<div class="card-reader-slot"></div>'
    + '<div class="id-card" id="id-card">'
    +   '<div class="card-stripe"></div>'
    +   '<div class="card-text">' + playerName.substring(0, 8).toUpperCase() + '</div>'
    + '</div>'
    + '<div class="swipe-track"><div class="swipe-track-fill" id="swipe-fill" style="height:0%"></div></div>'
    + '</div>'
    + '<div class="swipe-feedback" id="swipe-fb">Drag the card from LEFT to RIGHT steadily</div>';

  var area      = document.getElementById('swipe-area');
  var card      = document.getElementById('id-card');
  var fill      = document.getElementById('swipe-fill');
  var fb        = document.getElementById('swipe-fb');
  var dragging  = false;
  var startX    = 0;
  var lastX     = 0;
  var lastT     = 0;
  var speed     = 0;
  var progress  = 0;
  var succeeded = false;

  function areaW() { return area.getBoundingClientRect().width; }
  function getX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }

  area.addEventListener('mousedown',  function(e) { if (!succeeded) start(e); });
  area.addEventListener('touchstart', function(e) { if (!succeeded) start(e.touches[0]); });

  function start(e) {
    dragging = true; startX = getX(e); lastX = startX; lastT = Date.now();
    progress = 0; fb.textContent = 'Keep going...'; fb.className = 'swipe-feedback';
  }

  window.addEventListener('mousemove', move);
  window.addEventListener('touchmove', function(e) { move(e.touches[0]); });
  window.addEventListener('mouseup',   end);
  window.addEventListener('touchend',  end);

  function move(e) {
    if (!dragging || succeeded) return;
    var x   = getX(e);
    var now = Date.now();
    var dt  = now - lastT;
    if (dt > 0) speed = Math.abs(x - lastX) / dt;
    lastX = x; lastT = now;
    progress = Math.max(0, Math.min(1, (x - startX - 50) / (areaW() - 160)));
    card.style.left = Math.min(areaW() - 120, 20 + (areaW() - 160) * progress) + 'px';
    fill.style.height = (progress * 100) + '%';
    if (progress >= 1) {
      if (speed > 0.05 && speed < 1.5) {
        fb.textContent = '\u2713 ACCESS GRANTED'; fb.className = 'swipe-feedback good';
        succeeded = true;
        setTimeout(function() { taskComplete('swipe'); }, 600);
      } else if (speed >= 1.5) { fail('TOO FAST! Try again'); }
      else                      { fail('TOO SLOW! Try again'); }
    }
  }

  function end() {
    if (!dragging) return;
    dragging = false;
    if (!succeeded && progress < 1) {
      fail('Swipe all the way across!');
      progress = 0; card.style.left = '20px'; fill.style.height = '0%';
    }
  }

  function fail(msg) {
    fb.textContent = msg; fb.className = 'swipe-feedback bad';
    card.style.left = '20px'; fill.style.height = '0%'; progress = 0;
    setTimeout(function() { fb.textContent = 'Drag the card from LEFT to RIGHT steadily'; fb.className = 'swipe-feedback'; }, 1500);
  }
}

// ============================================================
//  TASK 3: DOWNLOAD DATA
// ============================================================
function buildDownload() {
  var body = document.getElementById('task-body');
  body.innerHTML =
    '<div class="download-container">'
    + '<div class="download-terminal" id="dl-term">'
    +   '<div>&gt; INITIATING DATA TRANSFER...</div>'
    +   '<div id="dl-lines"></div>'
    + '</div>'
    + '<div class="download-bar-wrap"><div class="download-bar-inner" id="dl-bar" style="width:0%"></div></div>'
    + '<div class="download-pct" id="dl-pct">0%</div>'
    + '<button class="btn-main" id="dl-btn" onclick="startDownload()" style="max-width:250px;">START DOWNLOAD</button>'
    + '</div>';
}

function startDownload() {
  var btn  = document.getElementById('dl-btn');
  btn.disabled = true; btn.textContent = 'DOWNLOADING...';
  var pct  = 0;
  var msgs = ['&gt; Connecting to server...','&gt; Handshake established','&gt; Receiving packet data','&gt; Verifying checksums','&gt; Decrypting files','&gt; Scanning for errors','&gt; Writing to disk','&gt; Transfer complete'];
  var mi   = 0;
  var iv   = setInterval(function() {
    pct += 1 + Math.random() * 2;
    if (pct >= 100) { pct = 100; clearInterval(iv); setTimeout(function() { taskComplete('download'); }, 500); }
    document.getElementById('dl-bar').style.width = pct + '%';
    document.getElementById('dl-pct').textContent = Math.floor(pct) + '%';
    if (pct > mi * (100 / msgs.length) && mi < msgs.length) {
      var d = document.createElement('div');
      d.style.color = mi === msgs.length - 1 ? '#0f0' : '#0a0';
      d.innerHTML = msgs[mi++];
      document.getElementById('dl-lines').appendChild(d);
    }
  }, 120);
}

// ============================================================
//  TASK 4: FUEL ENGINES
// ============================================================
function buildFuel() {
  var body = document.getElementById('task-body');
  var marks = '';
  for (var m = 0; m < 5; m++) marks += '<div class="fuel-mark"></div>';
  body.innerHTML =
    '<div class="fuel-container">'
    + '<div class="fuel-tank"><label>LEFT ENGINE</label>'
    +   '<div class="fuel-visual"><div class="fuel-fill" id="fuel-l" style="height:0%"></div>'
    +   '<div class="fuel-marks">' + marks + '</div></div>'
    +   '<button class="fuel-btn" id="fuel-btn-l" onclick="fuelPour(\'l\')">POUR \u26BD</button></div>'
    + '<div class="fuel-arrow">\u2192</div>'
    + '<div class="fuel-tank"><label>RIGHT ENGINE</label>'
    +   '<div class="fuel-visual"><div class="fuel-fill" id="fuel-r" style="height:0%"></div>'
    +   '<div class="fuel-marks">' + marks + '</div></div>'
    +   '<button class="fuel-btn" id="fuel-btn-r" onclick="fuelPour(\'r\')">POUR \u26BD</button></div>'
    + '</div>'
    + '<div style="text-align:center;margin-top:16px;font-family:\'Press Start 2P\',monospace;font-size:0.5rem;color:#888;">Fill both engines to 100%</div>';
  window._fuelL = 0; window._fuelR = 0;
}

function fuelPour(side) {
  var key  = '_fuel' + side.toUpperCase();
  if (window[key] >= 100) return;
  var btn  = document.getElementById('fuel-btn-' + side);
  var fill = document.getElementById('fuel-' + side);
  btn.disabled = true;
  var iv = setInterval(function() {
    window[key] = Math.min(100, window[key] + 5 + Math.random() * 5);
    fill.style.height = window[key] + '%';
    if (window[key] >= 100) {
      clearInterval(iv);
      fill.style.height = '100%';
      btn.textContent = 'FULL \u2713';
      btn.style.borderColor = 'var(--teal)';
      btn.style.color       = 'var(--teal)';
      if (window._fuelL >= 100 && window._fuelR >= 100) setTimeout(function() { taskComplete('fuel'); }, 600);
    }
  }, 100);
}

// ============================================================
//  TASK 5: ALIGN ENGINE OUTPUT
// ============================================================
function buildAlign() {
  var targets = [75, 40, 90, 25, 60];
  var labels  = ['A','B','C','D','E'];
  window._alignValues = [50, 50, 50, 50, 50];

  var body = document.getElementById('task-body');
  body.innerHTML =
    '<div class="align-container">'
    + '<div class="align-grid" id="align-grid"></div>'
    + '<div style="font-family:\'Press Start 2P\',monospace;font-size:0.5rem;color:#888;text-align:center;margin-top:8px;">Move all sliders to the target value</div>'
    + '</div>';

  var grid = document.getElementById('align-grid');
  targets.forEach(function(t, i) {
    var row = document.createElement('div');
    row.className = 'align-row';
    row.innerHTML =
      '<div class="align-label">' + labels[i] + '</div>'
      + '<input type="range" class="align-slider" id="slider-' + i + '" min="0" max="100" value="50">'
      + '<div class="align-target">' + t + '</div>'
      + '<div class="align-indicator" id="ind-' + i + '"></div>';
    grid.appendChild(row);
    setTimeout(function() {
      var sl = document.getElementById('slider-' + i);
      sl.addEventListener('input', function() {
        window._alignValues[i] = parseInt(sl.value);
        checkAlign(targets);
      });
    }, 50);
  });
}

function checkAlign(targets) {
  var allGood = true;
  targets.forEach(function(t, i) {
    var ok  = Math.abs(window._alignValues[i] - t) <= 5;
    var ind = document.getElementById('ind-' + i);
    if (ind) ind.className = 'align-indicator' + (ok ? ' ok' : '');
    if (!ok) allGood = false;
  });
  if (allGood) setTimeout(function() { taskComplete('align'); }, 400);
}

// ============================================================
//  TASK 6: START REACTOR
// ============================================================
function buildReactor() {
  var sequence   = [0, 2, 1, 3, 0, 2];
  var btnColors  = ['#ff4444','#4488ff','#44cc44','#ffcc00'];
  var btnLabels  = ['1','2','3','4'];
  var step       = 0;
  var showing    = true;

  var body = document.getElementById('task-body');
  body.innerHTML =
    '<div class="reactor-container">'
    + '<div class="reactor-display"><div class="reactor-glow" id="reactor-glow"></div></div>'
    + '<div class="reactor-instructions" id="reactor-inst">WATCH THE SEQUENCE...</div>'
    + '<div class="reactor-sequence" id="reactor-seq"></div>'
    + '</div>';

  var seq = document.getElementById('reactor-seq');
  btnColors.forEach(function(c, i) {
    var btn = document.createElement('button');
    btn.className           = 'reactor-btn';
    btn.style.background    = c + '33';
    btn.style.borderColor   = c;
    btn.textContent         = btnLabels[i];
    btn.dataset.idx         = i;
    btn.addEventListener('click', function() { if (!showing) pressBtn(i, btn, c); });
    seq.appendChild(btn);
  });

  function flashBtn(idx, color) {
    var b = seq.querySelectorAll('.reactor-btn')[idx];
    b.style.background = color;
    b.style.boxShadow  = '0 0 20px ' + color;
    setTimeout(function() { b.style.background = color + '33'; b.style.boxShadow = 'none'; }, 400);
  }

  var si = 0;
  var showIv = setInterval(function() {
    if (si >= sequence.length) { clearInterval(showIv); showing = false; document.getElementById('reactor-inst').textContent = 'NOW REPEAT THE SEQUENCE!'; return; }
    flashBtn(sequence[si], btnColors[sequence[si]]);
    si++;
  }, 700);

  function pressBtn(idx, btn, color) {
    btn.classList.add('flash');
    btn.style.background = color;
    setTimeout(function() { btn.style.background = color + '33'; btn.classList.remove('flash'); }, 200);
    if (idx === sequence[step]) {
      step++;
      if (step === sequence.length) {
        document.getElementById('reactor-inst').textContent = 'REACTOR ONLINE! \u2713';
        document.getElementById('reactor-glow').style.background = 'radial-gradient(circle, #00ff88 0%, #00aa44 60%, transparent 100%)';
        setTimeout(function() { taskComplete('reactor'); }, 700);
      }
    } else {
      step = 0;
      document.getElementById('reactor-inst').textContent = 'WRONG! Watch again...';
      showing = true;
      si = 0;
      setTimeout(function() {
        var ri = setInterval(function() {
          if (si >= sequence.length) { clearInterval(ri); showing = false; document.getElementById('reactor-inst').textContent = 'NOW REPEAT THE SEQUENCE!'; return; }
          flashBtn(sequence[si], btnColors[sequence[si]]);
          si++;
        }, 700);
      }, 600);
    }
  }
}

// ============================================================
//  TASK 7: EMPTY GARBAGE
// ============================================================
function buildGarbage() {
  var body   = document.getElementById('task-body');
  var chutes = ['COMPOST','TRASH','RECYCLING'];
  window._garbageFill = [85, 70, 90];

  var html = '<div class="garbage-container" id="garbage-cont"></div>'
    + '<div style="text-align:center;margin-top:16px;font-family:\'Press Start 2P\',monospace;font-size:0.5rem;color:#888;">Empty all chutes to 0%</div>';
  body.innerHTML = html;

  var cont = document.getElementById('garbage-cont');
  chutes.forEach(function(name, i) {
    var div = document.createElement('div');
    div.className = 'garbage-chute';
    div.innerHTML =
      '<label>' + name + '</label>'
      + '<div class="chute-visual" id="chute-' + i + '">'
      +   '<div class="chute-fill" id="chute-fill-' + i + '" style="height:' + window._garbageFill[i] + '%">'
      +     '<span>' + window._garbageFill[i] + '%</span></div></div>'
      + '<button class="chute-btn" id="chute-btn-' + i + '" onclick="emptyChute(' + i + ')">EMPTY</button>';
    cont.appendChild(div);
  });
}

function emptyChute(i) {
  var btn = document.getElementById('chute-btn-' + i);
  if (window._garbageFill[i] <= 0) return;
  btn.disabled = true;
  var iv = setInterval(function() {
    window._garbageFill[i] = Math.max(0, window._garbageFill[i] - 10);
    var fill = document.getElementById('chute-fill-' + i);
    fill.style.height = window._garbageFill[i] + '%';
    fill.innerHTML = '<span>' + window._garbageFill[i] + '%</span>';
    if (window._garbageFill[i] <= 0) {
      clearInterval(iv);
      fill.style.background = '#0a1a0a';
      btn.textContent        = 'EMPTY \u2713';
      btn.style.color        = 'var(--teal)';
      if (window._garbageFill.every(function(f) { return f <= 0; })) setTimeout(function() { taskComplete('garbage'); }, 600);
    }
  }, 80);
}

// ============================================================
//  TASK 8: ENTER ID CODE
// ============================================================
function buildIdCode() {
  var target  = '7395';
  var entered = '';
  var body    = document.getElementById('task-body');

  body.innerHTML =
    '<div class="idcode-container">'
    + '<div style="font-family:\'Press Start 2P\',monospace;font-size:0.5rem;color:#555;margin-bottom:4px;">ENTER CODE:</div>'
    + '<div class="idcode-target">' + target.split('').join(' _ ') + '</div>'
    + '<div class="idcode-display" id="idcode-display">_ _ _ _</div>'
    + '<div class="numpad" id="numpad"></div>'
    + '<div style="font-family:\'Press Start 2P\',monospace;font-size:0.5rem;color:#888;margin-top:8px;" id="code-fb"></div>'
    + '</div>';

  var numpad = document.getElementById('numpad');
  var disp   = document.getElementById('idcode-display');
  var fb     = document.getElementById('code-fb');

  [1,2,3,4,5,6,7,8,9,'DEL',0,'OK'].forEach(function(k) {
    var btn = document.createElement('button');
    btn.className   = 'numpad-btn' + (k === 'DEL' ? ' del-btn' : '');
    btn.textContent = k;
    btn.addEventListener('click', function() {
      if (k === 'DEL') {
        entered = entered.slice(0, -1);
      } else if (k === 'OK') {
        if (entered === target) {
          fb.textContent = '\u2713 ACCESS GRANTED'; fb.style.color = 'var(--teal)';
          setTimeout(function() { taskComplete('idcode'); }, 700);
        } else {
          fb.textContent = '\u2717 WRONG CODE'; fb.style.color = '#ff4444';
          entered = '';
          setTimeout(function() { fb.textContent = ''; }, 1000);
        }
      } else {
        if (entered.length < 4) entered += k;
      }
      var chars = entered.split('');
      while (chars.length < 4) chars.push('_');
      disp.textContent = chars.join(' ');
    });
    numpad.appendChild(btn);
  });
}

// ============================================================
//  TASK 9: SUBMIT SCAN
// ============================================================
function buildScan() {
  var body = document.getElementById('task-body');
  body.innerHTML =
    '<div class="scan-container">'
    + '<div style="font-family:\'Press Start 2P\',monospace;font-size:0.55rem;color:#888;text-align:center;">Stand in the scanner and wait for 100%</div>'
    + '<div class="scan-booth" id="scan-booth">'
    +   '<div class="scan-line" id="scan-line"></div>'
    +   '<div class="scan-person">' + miniSVG(playerColor.hex, playerColor.dark, 60) + '</div>'
    + '</div>'
    + '<div class="download-bar-wrap" style="width:280px;"><div class="download-bar-inner" id="scan-bar" style="width:0%;background:linear-gradient(90deg,#0a1a3a,#4488ff);"></div></div>'
    + '<div class="download-pct" id="scan-pct" style="color:#4488ff;">0%</div>'
    + '<button class="btn-main" id="scan-btn" onclick="startScan()" style="max-width:220px;">ENTER SCANNER</button>'
    + '</div>';
}

function startScan() {
  var btn = document.getElementById('scan-btn');
  btn.disabled = true; btn.textContent = 'SCANNING...';
  document.getElementById('scan-line').classList.add('active');
  var pct = 0;
  var iv  = setInterval(function() {
    pct += 2;
    document.getElementById('scan-bar').style.width  = pct + '%';
    document.getElementById('scan-pct').textContent  = pct + '%';
    if (pct >= 100) {
      clearInterval(iv);
      document.getElementById('scan-line').classList.remove('active');
      document.getElementById('scan-pct').textContent = 'SCAN COMPLETE';
      setTimeout(function() { taskComplete('scan'); }, 600);
    }
  }, 80);
}

// ============================================================
//  TASK 10: SHOOT ASTEROIDS
// ============================================================
function buildAsteroids() {
  var body = document.getElementById('task-body');
  body.innerHTML =
    '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;">'
    + '<canvas id="asteroids-canvas" width="500" height="260"></canvas>'
    + '<div class="asteroids-ui">'
    +   '<span>DESTROYED: <span id="ast-count">0</span>/10</span>'
    +   '<span id="ast-msg">CLICK to shoot!</span>'
    + '</div>'
    + '</div>';

  var canvas    = document.getElementById('asteroids-canvas');
  var ctx       = canvas.getContext('2d');
  var asteroids = [];
  var bullets   = [];
  var destroyed = 0;
  var TOTAL     = 10;
  var done      = false;
  var ship      = { x: 250, y: 230 };
  var spawnTimer = 0;

  function spawnAsteroid() {
    return {
      x: 20 + Math.random() * (canvas.width - 40), y: -20,
      r: 12 + Math.random() * 14,
      vx: (Math.random() - 0.5) * 1.5, vy: 0.5 + Math.random() * 1.2,
      rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.04,
      pts: Math.floor(5 + Math.random() * 4)
    };
  }

  for (var i = 0; i < 4; i++) {
    var a = spawnAsteroid(); a.y = 20 + Math.random() * 100; asteroids.push(a);
  }

  window._astStars = [];
  for (var s = 0; s < 40; s++) {
    window._astStars.push({ x: Math.random()*500, y: Math.random()*260, a: 0.1+Math.random()*0.6, sz: Math.random()<0.3?2:1 });
  }

  canvas.addEventListener('mousemove', function(e) { var r = canvas.getBoundingClientRect(); ship.x = e.clientX - r.left; });
  canvas.addEventListener('click',     function(e) { if (!done) bullets.push({ x: ship.x, y: ship.y - 10, speed: 7 }); });

  function loop() {
    if (done) return;
    ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    window._astStars.forEach(function(st) {
      ctx.fillStyle = 'rgba(255,255,255,' + st.a + ')';
      ctx.fillRect(st.x, st.y, st.sz, st.sz);
    });

    ctx.save(); ctx.translate(ship.x, ship.y);
    ctx.fillStyle = playerColor.hex;
    ctx.beginPath(); ctx.moveTo(0,-14); ctx.lineTo(-10,8); ctx.lineTo(10,8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9eeeff'; ctx.beginPath(); ctx.arc(0,-2,5,0,Math.PI*2); ctx.fill();
    ctx.restore();

    bullets = bullets.filter(function(b) { return b.y > -10; });
    bullets.forEach(function(b) {
      b.y -= b.speed;
      ctx.fillStyle = '#ffff44'; ctx.shadowBlur = 6; ctx.shadowColor = '#ffff44';
      ctx.fillRect(b.x-2, b.y-8, 4, 10); ctx.shadowBlur = 0;
    });

    spawnTimer++;
    if (spawnTimer > 80 && asteroids.length < 6) { asteroids.push(spawnAsteroid()); spawnTimer = 0; }

    asteroids = asteroids.filter(function(a) {
      a.x += a.vx; a.y += a.vy; a.rot += a.rotV;
      if (a.y > canvas.height + 30) return false;
      ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rot);
      ctx.beginPath();
      for (var j = 0; j < a.pts; j++) {
        var ang = (j / a.pts) * Math.PI * 2;
        var r2  = a.r * (0.7 + 0.3 * Math.sin(j * 2.7));
        j === 0 ? ctx.moveTo(Math.cos(ang)*r2, Math.sin(ang)*r2) : ctx.lineTo(Math.cos(ang)*r2, Math.sin(ang)*r2);
      }
      ctx.closePath(); ctx.fillStyle = '#5a4a3a'; ctx.strokeStyle = '#9a8a7a'; ctx.lineWidth = 2; ctx.fill(); ctx.stroke(); ctx.restore();

      for (var bi = bullets.length - 1; bi >= 0; bi--) {
        var b  = bullets[bi];
        var dx = b.x - a.x, dy = b.y - a.y;
        if (Math.sqrt(dx*dx + dy*dy) < a.r + 4) {
          bullets.splice(bi, 1); destroyed++;
          document.getElementById('ast-count').textContent = destroyed;
          if (destroyed >= TOTAL) { done = true; document.getElementById('ast-msg').textContent = 'ALL CLEAR! \u2713'; setTimeout(function() { taskComplete('asteroids'); }, 600); }
          return false;
        }
      }
      return true;
    });
    requestAnimationFrame(loop);
  }
  loop();
}

// ============================================================
//  TASK 11: ADMIN MAP
// ============================================================
function buildAdminMap() {
  var rooms      = ['Cafeteria','Reactor','Upper Engine','Security','MedBay','Electrical','Storage','Admin','Navigation','Lower Engine','Weapons','O2'];
  var playerRooms = [0, 4, 8];
  var clicked    = [];

  var body = document.getElementById('task-body');
  body.innerHTML =
    '<div class="admin-map">'
    + '<div class="admin-rooms" id="admin-rooms"></div>'
    + '<div class="admin-instructions">Track all player locations — click each room with a dot</div>'
    + '</div>';

  var grid = document.getElementById('admin-rooms');
  rooms.forEach(function(r, i) {
    var div = document.createElement('div');
    var has = playerRooms.indexOf(i) !== -1;
    div.className = 'admin-room' + (has ? ' has-player' : '');
    div.innerHTML = '<span>' + r.substring(0, 6) + '</span>'
      + (has ? '<div class="admin-dot" style="background:' + playerColor.hex + '"></div>' : '');
    if (has) {
      div.addEventListener('click', function() {
        if (clicked.indexOf(i) !== -1) return;
        clicked.push(i);
        div.style.borderColor = 'var(--teal)';
        div.style.background  = '#0a2a0a';
        var dot = div.querySelector('.admin-dot');
        dot.style.background  = 'var(--teal)';
        dot.style.boxShadow   = '0 0 6px var(--teal)';
        if (clicked.length === playerRooms.length) setTimeout(function() { taskComplete('adminmap'); }, 500);
      });
    }
    grid.appendChild(div);
  });
}

// ============================================================
//  TASK 12: CLEAR ASTEROIDS (grid)
// ============================================================
function buildClearAster() {
  var total   = 12;
  var cleared = 0;
  var emojis  = ['\u2604\uFE0F','\uD83E\uDEA8','\uD83D\uDCAB','\u2B50','\uD83C\uDF11','\uD83C\uDF20','\u2604\uFE0F','\uD83E\uDEA8','\uD83D\uDCAB','\u2B50','\uD83C\uDF11','\uD83C\uDF20','\u2604\uFE0F','\uD83C\uDF19'];

  var body = document.getElementById('task-body');
  body.innerHTML =
    '<div class="clear-aster-container">'
    + '<div style="font-family:\'Press Start 2P\',monospace;font-size:0.5rem;color:#888;text-align:center;">Click all asteroids to destroy them!</div>'
    + '<div class="aster-grid" id="aster-grid"></div>'
    + '<div style="font-family:\'Press Start 2P\',monospace;font-size:0.55rem;color:var(--teal);" id="aster-remain">' + total + ' remaining</div>'
    + '</div>';

  var grid = document.getElementById('aster-grid');
  for (var i = 0; i < total; i++) {
    (function() {
      var cell = document.createElement('div');
      cell.className   = 'aster-cell';
      cell.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      cell.addEventListener('click', function() {
        if (cell.classList.contains('cleared')) return;
        cell.classList.add('cleared');
        cell.textContent = '\u2713';
        cleared++;
        document.getElementById('aster-remain').textContent = (total - cleared) + ' remaining';
        if (cleared >= total) setTimeout(function() { taskComplete('clearaster'); }, 500);
      });
      grid.appendChild(cell);
    })();
  }
}

// ============================================================
//  VICTORY SCREEN
// ============================================================
function showVictory() {
  document.getElementById('victory-mate').innerHTML = crewmateSVG(playerColor.hex, playerColor.dark, 130);
  document.getElementById('victory-name').textContent = playerName;

  var starCanvas = document.getElementById('victory-stars');
  starCanvas.width  = window.innerWidth;
  starCanvas.height = window.innerHeight;
  var sc = starCanvas.getContext('2d');
  for (var i = 0; i < 120; i++) {
    var x = Math.random() * starCanvas.width;
    var y = Math.random() * starCanvas.height;
    var r = Math.random() * 1.5;
    sc.beginPath(); sc.arc(x, y, r, 0, Math.PI * 2);
    sc.fillStyle = 'rgba(255,255,255,' + (0.2 + Math.random() * 0.7) + ')';
    sc.fill();
  }

  var particles     = document.getElementById('victory-particles');
  particles.innerHTML = '';
  var confettiColors = ['#ff4444','#4488ff','#44cc44','#ffcc00','#ff88ff','#00d4aa','#ff8844'];
  for (var j = 0; j < 60; j++) {
    var div = document.createElement('div');
    div.className             = 'confetti-piece';
    div.style.left            = (Math.random() * 100) + '%';
    div.style.background      = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    div.style.borderRadius    = Math.random() > 0.5 ? '50%' : '2px';
    div.style.width           = (6 + Math.random() * 10) + 'px';
    div.style.height          = (6 + Math.random() * 10) + 'px';
    div.style.animationDuration = (2 + Math.random() * 3) + 's';
    div.style.animationDelay    = (-Math.random() * 3) + 's';
    div.style.opacity           = 0.8 + Math.random() * 0.2;
    particles.appendChild(div);
  }

  showScreen('victory-screen');
}

// ============================================================
//  RESET GAME
// ============================================================
function resetGame() {
  completedTasks.clear();
  playerName  = '';
  playerColor = COLORS[0];
  document.getElementById('player-name').value = '';
  document.querySelectorAll('.color-btn').forEach(function(b, i) {
    b.classList.toggle('selected', i === 0);
  });
  showScreen('setup-screen');
}
