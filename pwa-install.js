(() => {
  if (!document.head.querySelector('link[rel="manifest"]')) {
    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = './manifest.webmanifest';
    document.head.append(manifest);
  }

  if (!document.querySelector('.pwa-install-button')) {
    const style = document.createElement('style');
    style.textContent = `
      .pwa-install-button {
        position: fixed; right: 16px; bottom: 16px; z-index: 2147483000;
        max-width: calc(100vw - 32px); padding: 12px 17px;
        border: 1px solid rgba(174,246,255,.6); border-radius: 999px;
        color: #071126; background: linear-gradient(110deg,#aef6ff,#8bc5ff);
        box-shadow: 0 8px 28px rgba(0,0,0,.38); cursor: pointer;
        font: 800 15px/1.25 system-ui,sans-serif; text-align: center;
      }
      .pwa-install-button:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
      .pwa-install-dialog {
        width: min(420px,calc(100% - 32px)); padding: 0; border: 1px solid #536293;
        border-radius: 18px; color: #f5f7ff; background: #11183d;
        font: 16px/1.55 system-ui,sans-serif;
      }
      .pwa-install-dialog::backdrop { background: rgba(3,6,20,.72); }
      .pwa-install-dialog > div { padding: 22px; }
      .pwa-install-dialog h2 { margin: 0 0 10px; font-size: 20px; }
      .pwa-install-dialog p { margin: 0 0 18px; }
      .pwa-install-close { display:block; margin-left:auto; padding:9px 16px; border:0;
        border-radius:10px; color:#071126; background:#aef6ff; font-weight:800; }
    `;
    document.head.append(style);

    const button = document.createElement('button');
    button.className = 'pwa-install-button';
    button.type = 'button';
    button.textContent = '＋ Thêm trang web vào màn hình chính';
    button.setAttribute('aria-label', 'Thêm trang web vào màn hình chính');

    const dialog = document.createElement('dialog');
    dialog.className = 'pwa-install-dialog';
    dialog.setAttribute('aria-labelledby', 'pwa-install-title');
    dialog.innerHTML = '<div><h2 id="pwa-install-title">Thêm trang web vào màn hình chính</h2><p></p><button class="pwa-install-close" type="button">Đã hiểu</button></div>';
    document.body.append(button, dialog);

    let installPrompt;
    const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    if (isStandalone()) button.hidden = true;

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      installPrompt = event;
      if (!isStandalone()) button.hidden = false;
    });
    window.addEventListener('appinstalled', () => {
      installPrompt = null;
      button.hidden = true;
    });

    button.addEventListener('click', async () => {
      if (installPrompt) {
        installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
        return;
      }

      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      dialog.querySelector('p').textContent = isIOS
        ? 'Trong Safari, chạm nút Chia sẻ (hình vuông có mũi tên), cuộn xuống rồi chọn “Thêm vào Màn hình chính”.'
        : 'Mở menu ⋮ của trình duyệt rồi chọn “Thêm vào màn hình chính”.';
      dialog.showModal();
    });

    dialog.querySelector('.pwa-install-close').addEventListener('click', () => dialog.close());
  }

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.error('Không thể bật chế độ ngoại tuyến:', error);
    });
  }
})();
