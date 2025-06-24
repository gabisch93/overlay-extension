// background.js
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: insertOverlay
  });
});

function insertOverlay() {
  const existing = document.getElementById('cb-overlay-wrapper');
  if (existing) existing.remove();

  const wrapper = document.createElement('div');
  wrapper.id = 'cb-overlay-wrapper';

  let isRound = localStorage.getItem('overlayRound') === '1';

  const storedLeftKey = isRound ? 'overlayLeftRound' : 'overlayLeft';
  const storedTopKey = isRound ? 'overlayTopRound' : 'overlayTop';
  const storedWidthKey = isRound ? 'overlayWidthRound' : 'overlayWidth';
  const storedHeightKey = isRound ? 'overlayHeightRound' : 'overlayHeight';
  const storedRotationKey = isRound ? 'overlayRotationRound' : 'overlayRotation';
  const storedBlurKey = isRound ? 'overlayBlurRound' : 'overlayBlur';

  const defaultLeft = '50%';
  const defaultTop = '50%';
  const defaultWidth = isRound ? '320px' : '320px';
  const defaultHeight = isRound ? '320px' : '160px';
  const defaultBlur = 1;
  const defaultRotation = 0;

  const storedLeft = localStorage.getItem(storedLeftKey) || defaultLeft;
  const storedTop = localStorage.getItem(storedTopKey) || defaultTop;
  const storedWidth = localStorage.getItem(storedWidthKey) || defaultWidth;
  const storedHeight = localStorage.getItem(storedHeightKey) || defaultHeight;
  const storedBlur = parseFloat(localStorage.getItem(storedBlurKey));
  const blurValue = isNaN(storedBlur) ? defaultBlur : storedBlur;
  const storedRotation = parseFloat(localStorage.getItem(storedRotationKey));
  const rotationValue = isNaN(storedRotation) ? defaultRotation : storedRotation;

  wrapper.style.position = 'absolute';
  wrapper.style.left = storedLeft;
  wrapper.style.top = storedTop;
  wrapper.style.width = storedWidth;
  wrapper.style.height = storedHeight;
  wrapper.style.zIndex = '2147483647';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.background = 'transparent';
  wrapper.style.borderRadius = '8px';
  wrapper.style.overflow = 'hidden';
  wrapper.style.transformOrigin = 'center center';
  wrapper.style.transform = `rotate(${rotationValue}deg)`;

  if (isRound) {
    wrapper.classList.add('round');
    wrapper.style.aspectRatio = '1 / 1';
  }

  const style = document.createElement('style');
  style.textContent = `
    #cb-overlay-wrapper.round {
      border-radius: 50% !important;
      aspect-ratio: 1 / 1;
    }
    .resizer {
      position: absolute;
      background: transparent;
      z-index: 3;
    }
    .resizer.left { top: 0; left: -5px; width: 10px; height: 100%; cursor: ew-resize; }
    .resizer.right { top: 0; right: -5px; width: 10px; height: 100%; cursor: ew-resize; }
    .resizer.top { top: -5px; left: 0; width: 100%; height: 10px; cursor: ns-resize; }
    .resizer.bottom { bottom: -5px; left: 0; width: 100%; height: 10px; cursor: ns-resize; }
    .resizer.tl, .resizer.tr, .resizer.bl, .resizer.br {
      width: 12px; height: 12px; background: transparent;
      position: absolute; z-index: 4;
    }
    .resizer.tl { top: -6px; left: -6px; cursor: nwse-resize; }
    .resizer.tr { top: -6px; right: -6px; cursor: nesw-resize; }
    .resizer.bl { bottom: -6px; left: -6px; cursor: nesw-resize; }
    .resizer.br { bottom: -6px; right: -6px; cursor: nwse-resize; }
    .ui-close-btn {
      background: transparent;
      border: none;
      color: black;
      font-size: 12px;
      cursor: pointer;
      opacity: 0;
      z-index: 10;
      transition: opacity 0.3s ease;
      position: absolute;
      top: 4px;
      right: 4px;
    }
    #cb-overlay-wrapper:hover .ui-close-btn {
      opacity: 1;
    }
    #cb-ui-box {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: none;
      pointer-events: none;
      border-radius: 12px;
      z-index: 5;
      display: flex;
      align-items: center;
      gap: 6px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    #cb-overlay-wrapper:hover #cb-ui-box {
      opacity: 1;
    }
    #cb-ui-box > * {
      pointer-events: auto;
    }
    input[type=range] {
      appearance: none;
      background: transparent;
      height: 20px;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      background: black;
      border-radius: 50%;
      width: 10px;
      height: 10px;
      cursor: pointer;
    }
  
    .cb-donate-link {
      position: absolute;
      bottom: 6px;
      right: 8px;
      font-size: 11px;
      background: transparent;
      color: rgba(255, 255, 255, 0.6);
      padding: 2px 6px;
      text-decoration: underline;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 6;
      pointer-events: auto;
    }
    #cb-overlay-wrapper:hover .cb-donate-link {
      opacity: 1;
    }
`;
  document.head.appendChild(style);

  const blurLayer = document.createElement('div');
  blurLayer.style.position = 'absolute';
  blurLayer.style.top = '-50%';
  blurLayer.style.left = '-50%';
  blurLayer.style.width = '200%';
  blurLayer.style.height = '200%';
  blurLayer.style.backdropFilter = `blur(60px) brightness(0.9) contrast(1.5)`;
  blurLayer.style.webkitBackdropFilter = `blur(${Math.pow(blurValue, 2) * 40}px)`;
  blurLayer.style.pointerEvents = 'none';
  blurLayer.style.zIndex = 0;
  blurLayer.style.borderRadius = 'inherit';
  blurLayer.style.maskImage = 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)';
  blurLayer.style.webkitMaskImage = blurLayer.style.maskImage;

  // Drag, Rotate, Resize
  ['left', 'right', 'top', 'bottom', 'tl', 'tr', 'bl', 'br'].forEach(dir => {
    const resizer = document.createElement('div');
    resizer.className = `resizer ${dir}`;
    wrapper.appendChild(resizer);
    resizer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = wrapper.offsetWidth;
      const startHeight = wrapper.offsetHeight;
      const startLeft = wrapper.offsetLeft;
      const startTop = wrapper.offsetTop;
      function onMouseMove(evt) {
        const dx = evt.clientX - startX;
        const dy = evt.clientY - startY;
        if (dir === 'right') {
          wrapper.style.width = `${Math.max(20, startWidth + dx)}px`;
        } else if (dir === 'left') {
          wrapper.style.width = `${Math.max(20, startWidth - dx)}px`;
          wrapper.style.left = `${startLeft + dx}px`;
        } else if (dir === 'bottom') {
          wrapper.style.height = `${Math.max(20, startHeight + dy)}px`;
        } else if (dir === 'top') {
          wrapper.style.height = `${Math.max(20, startHeight - dy)}px`;
          wrapper.style.top = `${startTop + dy}px`;
        } else if (dir === 'tl') {
          wrapper.style.width = `${Math.max(20, startWidth - dx)}px`;
          wrapper.style.left = `${startLeft + dx}px`;
          wrapper.style.height = `${Math.max(20, startHeight - dy)}px`;
          wrapper.style.top = `${startTop + dy}px`;
        } else if (dir === 'tr') {
          wrapper.style.width = `${Math.max(20, startWidth + dx)}px`;
          wrapper.style.height = `${Math.max(20, startHeight - dy)}px`;
          wrapper.style.top = `${startTop + dy}px`;
        } else if (dir === 'bl') {
          wrapper.style.width = `${Math.max(20, startWidth - dx)}px`;
          wrapper.style.left = `${startLeft + dx}px`;
          wrapper.style.height = `${Math.max(20, startHeight + dy)}px`;
        } else if (dir === 'br') {
          wrapper.style.width = `${Math.max(20, startWidth + dx)}px`;
          wrapper.style.height = `${Math.max(20, startHeight + dy)}px`;
        }
      }
      function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  });

  const closeBtn = document.createElement('button');
  closeBtn.className = 'ui-close-btn';
  closeBtn.textContent = '✖';
  closeBtn.style.fontSize = '18px';
  closeBtn.onclick = () => wrapper.remove();

  const uiBox = document.createElement('div');
  uiBox.id = 'cb-ui-box';

  const blurSlider = document.createElement('input');
  blurSlider.type = 'range';
  blurSlider.min = '0';
  blurSlider.max = '1';
  blurSlider.step = '0.01';
  blurSlider.value = blurValue;
  blurSlider.oninput = () => {
    const val = blurSlider.value;
    const px = Math.pow(val, 2) * 40;
    blurLayer.style.backdropFilter = `blur(${px}px)`;
    blurLayer.style.webkitBackdropFilter = `blur(${px}px)`;
    localStorage.setItem(storedBlurKey, val);
  };
  blurSlider.ondblclick = () => {
    localStorage.setItem(storedLeftKey, wrapper.style.left);
    localStorage.setItem(storedTopKey, wrapper.style.top);
    localStorage.setItem(storedWidthKey, wrapper.style.width);
    localStorage.setItem(storedHeightKey, wrapper.style.height);
    isRound = !isRound;
    localStorage.setItem('overlayRound', isRound ? '1' : '0');
    insertOverlay();
  };

  wrapper.addEventListener('dblclick', () => {
    wrapper.style.left = defaultLeft;
    wrapper.style.top = defaultTop;
    wrapper.style.width = defaultWidth;
    wrapper.style.height = defaultHeight;
    wrapper.style.transform = `rotate(0deg)`;
    blurSlider.value = defaultBlur;
    blurLayer.style.backdropFilter = `blur(${Math.pow(defaultBlur, 2) * 40}px)`;
    blurLayer.style.webkitBackdropFilter = `blur(${Math.pow(defaultBlur, 2) * 40}px)`;
    localStorage.setItem(storedLeftKey, defaultLeft);
    localStorage.setItem(storedTopKey, defaultTop);
    localStorage.setItem(storedWidthKey, defaultWidth);
    localStorage.setItem(storedHeightKey, defaultHeight);
    localStorage.setItem(storedRotationKey, defaultRotation);
    localStorage.setItem(storedBlurKey, defaultBlur);
  });

  uiBox.appendChild(blurSlider);
  closeBtn.style.position = 'static';
  uiBox.appendChild(closeBtn);
  wrapper.appendChild(blurLayer);
  wrapper.appendChild(uiBox);

  // Drag Overlay
  let isDragging = false;
  let offsetX = 0, offsetY = 0;
  wrapper.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || e.target.closest('#cb-ui-box')) return;
    isDragging = true;
    offsetX = e.clientX - wrapper.offsetLeft;
    offsetY = e.clientY - wrapper.offsetTop;
  });
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const left = e.clientX - offsetX;
      const top = e.clientY - offsetY;
      wrapper.style.left = `${left}px`;
      wrapper.style.top = `${top}px`;
      localStorage.setItem(storedLeftKey, `${left}px`);
      localStorage.setItem(storedTopKey, `${top}px`);
    }
  });
  document.addEventListener('mouseup', () => isDragging = false);

  // Rotate Overlay (Right-click)
  wrapper.addEventListener('contextmenu', e => e.preventDefault());
  wrapper.addEventListener('mousedown', (e) => {
    if (e.button === 2) {
      const rect = wrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const startTransform = window.getComputedStyle(wrapper).transform;
      let initialRotation = 0;
      if (startTransform && startTransform !== 'none') {
        const values = startTransform.split('(')[1].split(')')[0].split(',');
        const a = values[0];
        const b = values[1];
        initialRotation = Math.atan2(b, a);
      }
      const onMove = (evt) => {
        const angle = Math.atan2(evt.clientY - centerY, evt.clientX - centerX);
        const delta = angle - startAngle;
        const degrees = (initialRotation + delta) * (180 / Math.PI);
        wrapper.style.transform = `rotate(${degrees}deg)`;
        localStorage.setItem(storedRotationKey, degrees);
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }
  });

  const target = document.fullscreenElement || document.body;
  
  const donateLink = document.createElement('a');
  donateLink.href = 'https://paypal.me/heiderd';
  donateLink.target = '_blank';
  donateLink.textContent = 'Spenden';
  donateLink.className = 'cb-donate-link';
  wrapper.appendChild(donateLink);

  target.appendChild(wrapper);
}


