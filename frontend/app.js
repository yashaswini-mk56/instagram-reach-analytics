const API_BASE = 'http://127.0.0.1:5000/api';

// App State
let appState = {
  theme: localStorage.getItem('instafrnd_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  authMode: 'login',
  currentMode: 'pre', // 'pre', 'video', 'caption', or 'post'
  token: localStorage.getItem('ira_token') || null,
  user: JSON.parse(localStorage.getItem('ira_user') || 'null'),
  profile: {
    handle: '@creator',
    followers: 15000,
    niche: 'Fashion & Lifestyle'
  },
  loadedVideoFile: null
};

let reachChart = null;
let heatmapChart = null;
let deferredInstallPrompt = null;

document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initPWAInstaller();
  initAuthScreen();
  initProfileScreen();
  initPredictorScreen();
  initPostTypeCards();
  initSliders();
  initModeSwitcher();
  initVideoStudioScreen();
  initCaptionGeneratorScreen();
  initDiagnosticScreen();

  if (appState.token && appState.user) {
    updateUserBadge();
    showScreen('screen-profile');
  } else {
    showScreen('screen-auth');
  }
});

// ---------------- 0. PWA INSTALLER ----------------
function initPWAInstaller() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker Registered!', reg))
        .catch(err => console.log('Service Worker Error:', err));
    });
  }

  const installBtn = document.getElementById('btn-install-app');
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (installBtn) installBtn.style.display = 'inline-flex';
  });

  installBtn?.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choiceResult = await deferredInstallPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('App installed!');
      }
      deferredInstallPrompt = null;
      installBtn.style.display = 'none';
    }
  });
}

// ---------------- THEME ENGINE ----------------
function initThemeEngine() {
  document.documentElement.setAttribute('data-theme', appState.theme);
  updateThemeIcon();

  const themeBtn = document.getElementById('btn-theme-toggle');
  themeBtn?.addEventListener('click', () => {
    appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', appState.theme);
    localStorage.setItem('instafrnd_theme', appState.theme);
    updateThemeIcon();

    if (reachChart) reachChart.update();
    if (heatmapChart) heatmapChart.update();
    if (typeof initOfficialGoogleGIS === 'function') initOfficialGoogleGIS();
  });
}

function updateThemeIcon() {
  const iconContainer = document.getElementById('btn-theme-toggle');
  if (!iconContainer) return;

  if (appState.theme === 'dark') {
    iconContainer.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  } else {
    iconContainer.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="1" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  }
}

// ---------------- 1. 4-TOOL MODE SWITCHER ----------------
function initModeSwitcher() {
  const modeBtnPre = document.getElementById('mode-btn-pre');
  const modeBtnVideo = document.getElementById('mode-btn-video');
  const modeBtnCaption = document.getElementById('mode-btn-caption');
  const modeBtnPost = document.getElementById('mode-btn-post');

  const setModeActive = (activeBtn) => {
    [modeBtnPre, modeBtnVideo, modeBtnCaption, modeBtnPost].forEach(btn => btn?.classList.remove('active'));
    activeBtn?.classList.add('active');
  };

  modeBtnPre?.addEventListener('click', () => {
    appState.currentMode = 'pre';
    setModeActive(modeBtnPre);
    showScreen('screen-predictor');
  });

  modeBtnVideo?.addEventListener('click', () => {
    appState.currentMode = 'video';
    setModeActive(modeBtnVideo);
    showScreen('screen-video-studio');
  });

  modeBtnCaption?.addEventListener('click', () => {
    appState.currentMode = 'caption';
    setModeActive(modeBtnCaption);
    showScreen('screen-caption-generator');
  });

  modeBtnPost?.addEventListener('click', () => {
    appState.currentMode = 'post';
    setModeActive(modeBtnPost);
    showScreen('screen-diagnostic');
  });
}

// ---------------- SCREEN CONTROLLER ----------------
function showScreen(screenId) {
  document.querySelectorAll('.app-screen').forEach(s => {
    if (s.id === screenId) s.classList.add('active');
    else s.classList.remove('active');
  });

  updateTopBars(screenId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateTopBars(screenId) {
  const modeBarContainer = document.getElementById('mode-bar-container');
  const progressContainer = document.getElementById('progress-container');

  if (screenId === 'screen-auth') {
    if (modeBarContainer) modeBarContainer.style.display = 'none';
    if (progressContainer) progressContainer.style.display = 'none';
    return;
  }

  if (modeBarContainer) modeBarContainer.style.display = 'block';

  const modeBtnPre = document.getElementById('mode-btn-pre');
  const modeBtnVideo = document.getElementById('mode-btn-video');
  const modeBtnCaption = document.getElementById('mode-btn-caption');
  const modeBtnPost = document.getElementById('mode-btn-post');

  if (screenId === 'screen-video-studio') {
    if (progressContainer) progressContainer.style.display = 'none';
    modeBtnVideo?.classList.add('active');
    modeBtnPre?.classList.remove('active');
    modeBtnCaption?.classList.remove('active');
    modeBtnPost?.classList.remove('active');
  } else if (screenId === 'screen-caption-generator') {
    if (progressContainer) progressContainer.style.display = 'none';
    modeBtnCaption?.classList.add('active');
    modeBtnPre?.classList.remove('active');
    modeBtnVideo?.classList.remove('active');
    modeBtnPost?.classList.remove('active');
  } else if (screenId === 'screen-diagnostic' || screenId === 'screen-diag-results') {
    if (progressContainer) progressContainer.style.display = 'none';
    modeBtnPost?.classList.add('active');
    modeBtnPre?.classList.remove('active');
    modeBtnVideo?.classList.remove('active');
    modeBtnCaption?.classList.remove('active');
  } else {
    if (progressContainer) progressContainer.style.display = 'block';
    modeBtnPre?.classList.add('active');
    modeBtnVideo?.classList.remove('active');
    modeBtnCaption?.classList.remove('active');
    modeBtnPost?.classList.remove('active');

    const steps = {
      'screen-profile': 2,
      'screen-predictor': 3,
      'screen-results': 4
    };
    const activeStepNum = steps[screenId] || 2;

    for (let i = 1; i <= 4; i++) {
      const stepEl = document.getElementById(`step-${i}`);
      if (!stepEl) continue;
      stepEl.classList.remove('active', 'done');
      if (i < activeStepNum) stepEl.classList.add('done');
      else if (i === activeStepNum) stepEl.classList.add('active');
    }

    for (let i = 1; i <= 3; i++) {
      const lineEl = document.getElementById(`line-${i}-${i+1}`);
      if (!lineEl) continue;
      if (i < activeStepNum) lineEl.classList.add('done');
      else lineEl.classList.remove('done');
    }
  }
}

// Regex Email Validation
function isValidEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).trim().toLowerCase());
}

// ---------------- 2. AUTHENTICATION ----------------
function initAuthScreen() {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const fieldsEmail = document.getElementById('register-fields-email');
  const fieldsConfirm = document.getElementById('register-fields-confirm');
  const btnAuthLabel = document.getElementById('btn-auth-label');
  const errBanner = document.getElementById('auth-error');
  const successBanner = document.getElementById('auth-success');

  const inputEmail = document.getElementById('auth-email');
  const badgeEmail = document.getElementById('badge-email');
  const inputPass = document.getElementById('auth-password');
  const inputConfirmPass = document.getElementById('auth-confirm-password');
  const badgePassMatch = document.getElementById('badge-pass-match');

  const switchLink = document.getElementById('link-switch-register');
  const authNote = document.getElementById('auth-note');

  document.querySelectorAll('.btn-eye-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const targetId = toggle.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          toggle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
        } else {
          input.type = 'password';
          toggle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        }
      }
    });
  });

  const setAuthMode = (mode) => {
    appState.authMode = mode;
    errBanner.style.display = 'none';
    successBanner.style.display = 'none';

    if (mode === 'register') {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      if (fieldsEmail) fieldsEmail.style.display = 'block';
      if (fieldsConfirm) fieldsConfirm.style.display = 'block';
      if (btnAuthLabel) btnAuthLabel.textContent = 'Create Account & Join InstaFriend';
      if (authNote) authNote.innerHTML = 'Already have an account? <a href="#" id="link-switch-login">Sign In here →</a>';
      
      document.getElementById('link-switch-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthMode('login');
      });
    } else {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      if (fieldsEmail) fieldsEmail.style.display = 'none';
      if (fieldsConfirm) fieldsConfirm.style.display = 'none';
      if (btnAuthLabel) btnAuthLabel.textContent = 'Sign In to InstaFriend AI';
      if (authNote) authNote.innerHTML = 'Don\'t have an account? <a href="#" id="link-switch-register">Create one free →</a>';
      
      document.getElementById('link-switch-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthMode('register');
      });
    }
  };

  tabLogin?.addEventListener('click', () => setAuthMode('login'));
  tabRegister?.addEventListener('click', () => setAuthMode('register'));
  switchLink?.addEventListener('click', (e) => {
    e.preventDefault();
    setAuthMode('register');
  });

  inputEmail?.addEventListener('input', () => {
    const val = inputEmail.value.trim();
    if (!val) {
      badgeEmail.style.display = 'none';
      return;
    }
    if (isValidEmail(val)) {
      badgeEmail.textContent = 'Valid Email ✓';
      badgeEmail.className = 'val-badge valid';
    } else {
      badgeEmail.textContent = 'Invalid Format ❌';
      badgeEmail.className = 'val-badge invalid';
    }
  });

  const validateMatch = () => {
    if (appState.authMode !== 'register') return;
    const p1 = inputPass.value;
    const p2 = inputConfirmPass.value;
    if (!p2) {
      badgePassMatch.style.display = 'none';
      return;
    }
    if (p1 === p2 && p1.length >= 6) {
      badgePassMatch.textContent = 'Passwords Match ✓';
      badgePassMatch.className = 'val-badge valid';
    } else {
      badgePassMatch.textContent = 'Passwords Do Not Match ❌';
      badgePassMatch.className = 'val-badge invalid';
    }
  };

  inputPass?.addEventListener('input', validateMatch);
  inputConfirmPass?.addEventListener('input', validateMatch);

  document.getElementById('form-auth')?.addEventListener('submit', async e => {
    e.preventDefault();
    errBanner.style.display = 'none';
    successBanner.style.display = 'none';

    const username = document.getElementById('auth-username').value.trim();
    const password = inputPass.value;

    if (!username || !password) {
      showError('Please enter your username and password.');
      return;
    }

    if (appState.authMode === 'register') {
      const email = inputEmail.value.trim();
      const confirmPass = inputConfirmPass.value;

      if (!isValidEmail(email)) {
        showError('Please enter a valid email address (e.g. name@domain.com).');
        return;
      }

      if (password.length < 6) {
        showError('Password must be at least 6 characters long.');
        return;
      }

      if (password !== confirmPass) {
        showError('Passwords do not match. Please verify your password.');
        return;
      }

      await executeAuth('/auth/register', { username, email, password });
    } else {
      await executeAuth('/auth/login', { username, password });
    }
  });

  // ---------------- OFFICIAL GOOGLE IDENTITY SERVICES (GIS) ----------------
  const GOOGLE_CLIENT_ID = "732517413004-dogcnt4j1okc4vm3dqdugi0f1a8b6ljd.apps.googleusercontent.com";

  // Initialize and render the official Google Sign-In button matching app UI & theme mode
  function initOfficialGoogleGIS() {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleOfficialGoogleCredential,
          auto_select: false,
          context: 'signin'
        });

        const btnContainer = document.getElementById('official-google-btn-container');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          const isDark = appState.theme === 'dark';
          window.google.accounts.id.renderButton(
            btnContainer,
            {
              theme: isDark ? 'filled_black' : 'outline',
              size: 'large',
              type: 'standard',
              shape: 'pill',
              text: 'continue_with',
              logo_alignment: 'left',
              width: 320
            }
          );
        }
      } catch (err) {
        console.log('Google Identity SDK init note:', err);
      }
    }
  }

  // Trigger GIS init on load and when showing auth screen
  window.addEventListener('load', initOfficialGoogleGIS);
  setTimeout(initOfficialGoogleGIS, 500);

  // Handle Official Credential Response from Google
  async function handleOfficialGoogleCredential(response) {
    if (!response || !response.credential) return;

    let email = 'google.user@gmail.com';
    let name = 'Google User';
    let picture = null;
    let sub = `g_${Date.now()}`;

    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const payload = JSON.parse(jsonPayload);

      email = payload.email || email;
      name = payload.name || payload.given_name || email.split('@')[0];
      picture = payload.picture || null;
      sub = payload.sub || sub;
    } catch (e) {
      console.log('JWT Decode Note:', e);
    }

    await completeGoogleLogin(name, email, picture, sub, response.credential);
  }

  async function completeGoogleLogin(name, email, picture, googleId, credential) {
    const payload = {
      credential: credential,
      google_user: {
        name: name,
        email: email,
        picture: picture,
        id: googleId
      }
    };

    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        appState.token = data.token;
        appState.user = data.user;
        localStorage.setItem('ira_token', appState.token);
        localStorage.setItem('ira_user', JSON.stringify(appState.user));

        showSuccess(`✓ Authenticated via Google as ${data.user.email}!`);
        setTimeout(() => {
          updateUserBadge();
          showScreen('screen-profile');
        }, 600);
        return;
      }
    } catch (err) {
      console.log('Google Auth API fallback');
    }

    appState.user = { username: name.split(' ')[0], name: name, email: email, picture: picture };
    appState.token = `google-jwt-auth-${Date.now()}`;
    localStorage.setItem('ira_token', appState.token);
    localStorage.setItem('ira_user', JSON.stringify(appState.user));

    showSuccess(`✓ Signed in as ${email}!`);
    setTimeout(() => {
      updateUserBadge();
      showScreen('screen-profile');
    }, 600);
  }

  async function executeAuth(endpoint, payload) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.token) {
        appState.token = data.token;
        appState.user = data.user;
        localStorage.setItem('ira_token', data.token);
        localStorage.setItem('ira_user', JSON.stringify(data.user));

        showSuccess('Sign in successful! Loading profile...');
        setTimeout(() => {
          updateUserBadge();
          showScreen('screen-profile');
        }, 500);
      } else {
        showError(data.error || 'Login failed. Please check your username and password.');
      }
    } catch (err) {
      appState.user = { username: payload.username, email: payload.email || `${payload.username}@domain.com` };
      appState.token = 'demo-jwt-token';
      localStorage.setItem('ira_token', appState.token);
      localStorage.setItem('ira_user', JSON.stringify(appState.user));
      updateUserBadge();
      showScreen('screen-profile');
    }
  }

  function showError(msg) {
    errBanner.textContent = msg;
    errBanner.style.display = 'block';
  }

  function showSuccess(msg) {
    successBanner.textContent = msg;
    successBanner.style.display = 'block';
  }
}

function updateUserBadge() {
  const badge = document.getElementById('user-badge');
  const nameEl = document.getElementById('user-badge-name');
  const avatarEl = document.getElementById('user-avatar');

  if (appState.user) {
    badge.style.display = 'flex';
    const displayName = appState.user.name || appState.user.username;
    nameEl.textContent = displayName;
    if (appState.user.picture) {
      avatarEl.innerHTML = `<img src="${appState.user.picture}" alt="Avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
      avatarEl.textContent = displayName.charAt(0).toUpperCase();
    }
  } else {
    badge.style.display = 'none';
  }

  document.getElementById('btn-signout')?.addEventListener('click', () => {
    appState.token = null;
    appState.user = null;
    localStorage.removeItem('ira_token');
    localStorage.removeItem('ira_user');
    badge.style.display = 'none';
    showScreen('screen-auth');
  });
}

// ---------------- 3. PROFILE SETUP ----------------
function initProfileScreen() {
  const formProfile = document.getElementById('form-profile');

  formProfile?.addEventListener('submit', e => {
    e.preventDefault();
    const handleInput = document.getElementById('profile-handle');
    const followersInput = document.getElementById('profile-followers');
    const nicheInput = document.getElementById('profile-niche');

    const handle = handleInput ? handleInput.value.trim() : '@creator';
    const sliderVal = followersInput ? parseInt(followersInput.value) : 15000;
    const numInputEl = document.getElementById('input-profile-followers-num');
    const numInputVal = numInputEl && numInputEl.value !== '' ? parseInt(numInputEl.value) : NaN;
    
    // Explicit check so 0 followers is respected correctly and not overridden
    const finalFollowers = !isNaN(numInputVal) ? Math.max(0, numInputVal) : (!isNaN(sliderVal) ? sliderVal : 15000);
    const niche = nicheInput ? nicheInput.value : 'Fashion & Lifestyle';

    appState.profile = {
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      followers: finalFollowers,
      niche: niche
    };

    const followersHidden = document.getElementById('followers');
    if (followersHidden) followersHidden.value = appState.profile.followers;

    const handleDisplay = document.getElementById('user-handle-display');
    if (handleDisplay) handleDisplay.textContent = appState.profile.handle;

    const nicheDisplay = document.getElementById('user-niche-display');
    if (nicheDisplay) nicheDisplay.textContent = appState.profile.niche;

    showScreen('screen-predictor');
  });
}

// ---------------- 4. SECTION 1 - PRE-POST PREDICTOR ----------------
function initPostTypeCards() {
  const cards = document.querySelectorAll('.post-type-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });
}

function initPredictorScreen() {
  document.getElementById('form-predictor')?.addEventListener('submit', async e => {
    e.preventDefault();
    runPrediction();
  });

  document.getElementById('btn-back-profile')?.addEventListener('click', () => {
    showScreen('screen-profile');
  });

  document.getElementById('btn-restart')?.addEventListener('click', () => {
    showScreen('screen-predictor');
  });

  document.getElementById('btn-new-post')?.addEventListener('click', () => {
    showScreen('screen-predictor');
  });
}

function initSliders() {
  const sliders = [
    { id: 'profile-followers', valId: 'val-profile-followers', format: v => Number(v).toLocaleString() },
    { id: 'hashtags_count', valId: 'val-hashtags', format: v => v },
    { id: 'caption_length', valId: 'val-caption', format: v => `${v} chars` },
    { id: 'likes', valId: 'val-likes', format: v => Number(v).toLocaleString() },
    { id: 'comments', valId: 'val-comments', format: v => Number(v).toLocaleString() },
    { id: 'shares', valId: 'val-shares', format: v => Number(v).toLocaleString() },
    { id: 'saves', valId: 'val-saves', format: v => Number(v).toLocaleString() },
    { id: 'diag_views', valId: 'val-diag-views', format: v => Number(v).toLocaleString() },
    { id: 'diag_likes', valId: 'val-diag-likes', format: v => Number(v).toLocaleString() },
    { id: 'diag_shares', valId: 'val-diag-shares', format: v => Number(v).toLocaleString() },
    { id: 'diag_saves', valId: 'val-diag-saves', format: v => Number(v).toLocaleString() }
  ];

  sliders.forEach(s => {
    const el = document.getElementById(s.id);
    const valEl = document.getElementById(s.valId);
    if (el && valEl) {
      el.addEventListener('input', e => {
        valEl.textContent = s.format(e.target.value);
      });
    }
  });

  // Sync followers number input <-> range slider bidirectionally (Profile screen)
  const followersRange = document.getElementById('profile-followers');
  const followersNumInput = document.getElementById('input-profile-followers-num');

  followersRange?.addEventListener('input', () => {
    if (followersNumInput) followersNumInput.value = followersRange.value;
    const valEl = document.getElementById('val-profile-followers');
    if (valEl) valEl.textContent = Number(followersRange.value).toLocaleString();
  });

  followersNumInput?.addEventListener('input', () => {
    const raw = followersNumInput.value !== '' ? parseInt(followersNumInput.value) : 0;
    const val = Math.min(1000000, Math.max(0, isNaN(raw) ? 0 : raw));
    if (followersRange) followersRange.value = Math.min(250000, val);
    const valEl = document.getElementById('val-profile-followers');
    if (valEl) valEl.textContent = Number(val).toLocaleString();
  });
}

async function runPrediction() {
  const followersEl = document.getElementById('followers');
  const selectedPostTypeRadio = document.querySelector('input[name="post_type"]:checked');
  const postTypeValue = selectedPostTypeRadio ? parseInt(selectedPostTypeRadio.value) : 1;

  const rawFollowers = followersEl && followersEl.value !== '' ? parseInt(followersEl.value) : NaN;
  const followersCount = !isNaN(rawFollowers) ? Math.max(0, rawFollowers) 
                       : (appState.profile.followers !== undefined ? appState.profile.followers : 15000);

  const payload = {
    followers: followersCount,
    post_type: postTypeValue,
    hashtags_count: parseInt(document.getElementById('hashtags_count').value),
    caption_length: parseInt(document.getElementById('caption_length').value),
    likes: parseInt(document.getElementById('likes').value),
    comments: parseInt(document.getElementById('comments').value),
    shares: parseInt(document.getElementById('shares').value),
    saves: parseInt(document.getElementById('saves').value),
    posting_day: parseInt(document.getElementById('posting_day').value),
    posting_hour: parseInt(document.getElementById('posting_hour').value)
  };

  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      renderResults(data, payload);
      showScreen('screen-results');
      return;
    }
  } catch (err) {
    console.log('API Offline - using simulation mode');
  }

  renderOfflinePrediction(payload);
  showScreen('screen-results');
}

function renderResults(data, payload) {
  const reachEl = document.getElementById('res-reach');
  if (reachEl) reachEl.textContent = Number(data.predicted_reach).toLocaleString();

  const rangeEl = document.getElementById('res-range');
  if (rangeEl) rangeEl.textContent = `${Number(data.lower_bound).toLocaleString()} – ${Number(data.upper_bound).toLocaleString()}`;

  const scoreEl = document.getElementById('res-score');
  if (scoreEl) scoreEl.textContent = `${data.engagement_score}/100`;

  const formatBadge = document.getElementById('res-format-badge');
  const formatNames = { 0: 'Single Image', 1: 'Reel', 2: 'Carousel', 3: 'Story' };
  if (formatBadge) formatBadge.textContent = formatNames[payload.post_type] || 'Reel';

  const speechEl = document.getElementById('companion-speech-text');
  const chipsEl = document.getElementById('companion-chips');
  const adviceListEl = document.getElementById('companion-advice-list');

  const userHandle = appState.profile.handle || '@creator';
  const topTime = data.best_times?.[0]?.time_label || 'Wednesday at 6:00 PM';
  const formatName = formatNames[payload.post_type] || 'Reel';

  if (speechEl) {
    speechEl.innerHTML = `
      Hello <strong>${userHandle}</strong>! Here is your simple AI Growth Report:
    `;
  }

  if (chipsEl) {
    const viralityClass = data.engagement_score < 30 ? 'orange' : data.engagement_score < 70 ? 'pink' : 'cyan';
    const viralityLabel = data.engagement_score < 30 ? 'Low Reach' : data.engagement_score < 70 ? 'Good Reach' : 'Viral Potential 🔥';

    chipsEl.innerHTML = `
      <div class="ch-chip cyan">
        🎯 Expected Reach: ${Number(data.predicted_reach).toLocaleString()} accounts
      </div>
      <div class="ch-chip ${viralityClass}">
        🔥 Score: ${data.engagement_score}/100 (${viralityLabel})
      </div>
      <div class="ch-chip pink">
        ⏰ Best Time: ${topTime}
      </div>
    `;
  }

  if (adviceListEl) {
    let adviceHtml = '';

    if (payload.post_type !== 1) {
      adviceHtml += `
        <div class="ai-advice-item" style="border-left-color: var(--primary-pink)">
          <div style="font-size:1.1rem; line-height:1;">📱</div>
          <div>
            <strong>1. Switch to a Reel for More Views:</strong> You picked <b>${formatName}</b>. If you post a short <b>Reel video</b> instead, Instagram will show it to <b>2 times more people</b> (~${Math.round(data.predicted_reach * 1.8).toLocaleString()} accounts)!
          </div>
        </div>
      `;
    }

    if (data.engagement_score < 50) {
      adviceHtml += `
        <div class="ai-advice-item" style="border-left-color: var(--primary-orange)">
          <div style="font-size:1.1rem; line-height:1;">📌</div>
          <div>
            <strong>2. Ask People to Save Your Post:</strong> Add a line in your caption saying: <i>"Save this post for later!"</i> Instagram promotes posts that people bookmark.
          </div>
        </div>
      `;
    }

    adviceHtml += `
      <div class="ai-advice-item" style="border-left-color: var(--accent-cyan)">
        <div style="font-size:1.1rem; line-height:1;">⏰</div>
        <div>
          <strong>3. Post at the Right Time:</strong> Schedule your post for <b>${topTime}</b> when most of your followers are online.
        </div>
      </div>
    `;

    adviceListEl.innerHTML = adviceHtml;
  }

  // Best Times
  const bestList = document.getElementById('res-best-times');
  if (bestList && data.best_times) {
    bestList.innerHTML = '';
    data.best_times.forEach(bt => {
      bestList.innerHTML += `
        <div class="rec-card">
          <div class="rec-head">
            <span>⏰ ${bt.time_label}</span>
            <span style="color:var(--accent-cyan); font-weight:800;">${bt.expected_boost}</span>
          </div>
          <div class="rec-text">${bt.rationale}</div>
        </div>
      `;
    });
  }

  // AI Tips in Simple English
  const tipsList = document.getElementById('res-ai-tips');
  if (tipsList && data.ai_tips) {
    tipsList.innerHTML = '';
    data.ai_tips.forEach(tip => {
      const color = tip.status === 'success' ? 'var(--accent-cyan)' : tip.status === 'warning' ? 'var(--primary-orange)' : 'var(--primary-purple)';
      tipsList.innerHTML += `
        <div class="rec-card" style="border-left-color:${color}">
          <div class="rec-head">
            <span>${tip.title}</span>
            <span style="font-size:0.75rem; color:${color}; text-transform:uppercase; font-weight:800;">${tip.category}</span>
          </div>
          <div class="rec-text">${tip.message}</div>
        </div>
      `;
    });
  }

  const isDark = appState.theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';

  // Chart 1: Reach Breakdown
  const ctxBreakdown = document.getElementById('chart-breakdown')?.getContext('2d');
  if (ctxBreakdown) {
    if (reachChart) reachChart.destroy();
    reachChart = new Chart(ctxBreakdown, {
      type: 'doughnut',
      data: {
        labels: ['Organic Followers', 'Explore Page', 'Hashtags', 'Viral Shares'],
        datasets: [{
          data: [data.breakdown.organic, data.breakdown.explore, data.breakdown.hashtags, data.breakdown.shares],
          backgroundColor: ['#833ab4', '#e1306c', '#f56040', '#00f2fe'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: textColor, font: { size: 12 } } } },
        cutout: '70%'
      }
    });
  }

  // Chart 2: Heatmap
  const ctxHeatmap = document.getElementById('chart-heatmap')?.getContext('2d');
  if (ctxHeatmap) {
    if (heatmapChart) heatmapChart.destroy();
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const scores = [0.3, 0.2, 0.15, 0.1, 0.15, 0.35, 0.55, 0.85, 0.95, 0.9, 0.85, 0.95, 1.25, 1.3, 1.15, 0.95, 1.05, 1.2, 1.45, 1.5, 1.4, 1.25, 0.95, 0.6];

    heatmapChart = new Chart(ctxHeatmap, {
      type: 'bar',
      data: {
        labels: hours,
        datasets: [{
          data: scores,
          backgroundColor: scores.map(s => s > 1.3 ? '#00f2fe' : s > 1.0 ? '#833ab4' : 'rgba(150,150,150,0.2)'),
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } },
          y: { ticks: { color: textColor }, grid: { color: 'rgba(150,150,150,0.1)' } }
        }
      }
    });
  }
}

function renderOfflinePrediction(p) {
  const typeMult = [1.0, 2.2, 1.5, 0.6][p.post_type] || 1.0;
  const rawReach = Math.round((p.followers * 0.25 + (p.likes + p.comments*3 + p.shares*5 + p.saves*4.5) * typeMult) * (1 + p.hashtags_count * 0.02));

  renderResults({
    predicted_reach: rawReach,
    lower_bound: Math.round(rawReach * 0.88),
    upper_bound: Math.round(rawReach * 1.12),
    engagement_score: Math.min(100, Math.round((p.likes + p.shares*3) / (p.followers + 1) * 300)),
    breakdown: {
      organic: Math.round(rawReach * 0.40),
      explore: Math.round(rawReach * 0.35),
      hashtags: Math.round(rawReach * 0.15),
      shares: Math.round(rawReach * 0.10)
    },
    best_times: [
      { time_label: 'Wednesday at 7:00 PM', expected_boost: '+42% Reach Boost', rationale: 'Most of your followers are active online at this time.' },
      { time_label: 'Friday at 6:00 PM', expected_boost: '+35% Reach Boost', rationale: 'Great weekend wind-down timing.' }
    ],
    ai_tips: [
      { category: 'Post Format', status: 'success', title: 'Great Video Format!', message: 'Reels get shown to 2x more people on Instagram than normal photos.' },
      { category: 'Hashtag Tip', status: 'info', title: 'Use 8 to 10 Hashtags', message: 'Adding 8 to 10 relevant hashtags helps new people find your account.' }
    ]
  }, p);
}

// ---------------- 5. SECTION 2 - DEDICATED VIDEO UPLOAD STUDIO ----------------
function initVideoStudioScreen() {
  const dropzone = document.getElementById('video-dropzone');
  const fileInput = document.getElementById('video-file-input');
  const previewWrapper = document.getElementById('video-preview-wrapper');
  const videoPlayer = document.getElementById('video-player');
  const infoTag = document.getElementById('video-info-tag');
  const analyzeBtn = document.getElementById('btn-analyze-video');
  const auditResultsContainer = document.getElementById('video-audit-results');

  dropzone?.addEventListener('click', () => fileInput?.click());

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone?.addEventListener(eventName, e => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }, false);
  });
  ['dragleave', 'drop'].forEach(eventName => {
    dropzone?.addEventListener(eventName, e => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone?.addEventListener('drop', e => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      loadVideoFile(files[0]);
    }
  });

  fileInput?.addEventListener('change', e => {
    if (e.target.files && e.target.files.length > 0) {
      loadVideoFile(e.target.files[0]);
    }
  });

  function loadVideoFile(file) {
    appState.loadedVideoFile = file;
    const objectUrl = URL.createObjectURL(file);
    if (videoPlayer) {
      videoPlayer.src = objectUrl;
      previewWrapper.style.display = 'block';
    }

    videoPlayer?.addEventListener('loadedmetadata', () => {
      const dur = Math.round(videoPlayer.duration || 0);
      if (infoTag) infoTag.textContent = `Video Loaded (${dur} seconds)`;
    });
  }

  analyzeBtn?.addEventListener('click', () => {
    runVideoAIAudit();
  });

  function runVideoAIAudit() {
    const niche = document.getElementById('video_content_niche').value;
    const audioType = document.getElementById('video_audio_type').value;
    const duration = videoPlayer ? Math.round(videoPlayer.duration || 12) : 12;

    // ---- Calculate individual scores ----
    // Hook Score: Short videos have strong loop potential (great hook)
    const hookScore = duration <= 7  ? 95
                    : duration <= 15 ? 88
                    : duration <= 30 ? 68
                    : duration <= 60 ? 52
                    : 38;

    // Audio Score: Trending audio gives a massive boost
    const audioScore = audioType === 'trending' ? 96
                     : audioType === 'mixed'    ? 78
                     : 58;

    // Length Score: 7-15 sec is the Instagram sweet spot for loops
    const lengthScore = duration <= 7  ? 90
                      : duration <= 15 ? 98
                      : duration <= 30 ? 75
                      : duration <= 60 ? 55
                      : 35;

    // Niche bonus (content-adaptive weighting)
    const nicheBonus = niche === 'educational' ? 5 : niche === 'fitness' ? 4 : 0;

    // Overall Virality Score (weighted)
    const overallScore = Math.min(99, Math.round(
      hookScore   * 0.35 +
      audioScore  * 0.30 +
      lengthScore * 0.25 +
      nicheBonus  * 2
    ));

    // ---- Grade & Color ----
    const grade     = overallScore >= 85 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 50 ? 'C' : 'D';
    const gradeColor = overallScore >= 85 ? '#00f2fe'
                     : overallScore >= 70 ? '#833ab4'
                     : overallScore >= 50 ? '#f56040'
                     : '#f87171';

    const ringBg  = `radial-gradient(circle, ${gradeColor}22 0%, ${gradeColor}44 100%)`;
    const ringBorder = `3px solid ${gradeColor}`;

    // ---- Verdicts per score ----
    const hookVerdict   = hookScore   >= 85 ? '✅ Great opening! Viewers will stay.' : hookScore >= 65 ? '⚠️ Average hook. Add a text title at 0:01.' : '❌ Weak hook. Viewers will scroll away fast.';
    const audioVerdict  = audioScore  >= 85 ? '✅ Popular music will boost Explore reach.' : audioScore >= 70 ? '⚠️ Add low-volume trending music in background.' : '❌ No trending music detected. This limits Explore reach.';
    const lengthVerdict = lengthScore >= 85 ? '✅ Perfect length for loop & re-watch.' : lengthScore >= 65 ? '⚠️ Try trimming to under 15 seconds for more loops.' : '❌ Too long. People will drop off before finishing.';

    // ---- Overall message ----
    const overallMsg = overallScore >= 85
      ? `Your video is set up really well for going viral! Post it on <b>Wednesday or Sunday at 6:00 PM</b> for maximum reach.`
      : overallScore >= 70
      ? `Good video! Make the 1–2 small changes below and it will reach a lot more people.`
      : overallScore >= 50
      ? `Your video needs a few changes before posting. Follow the fixes below to improve your reach.`
      : `This video needs work before posting. Please apply all 3 fixes below for better results.`;

    // ---- Build Score Report Card HTML ----
    const auditHtml = `
      <div class="score-report-card">

        <!-- Overall Score Ring -->
        <div class="score-overall-ring">
          <div class="score-ring-circle" style="background:${ringBg}; border:${ringBorder}; color:${gradeColor};">
            ${overallScore}
            <span class="score-ring-label" style="color:${gradeColor};">/ 100</span>
          </div>
          <div class="score-overall-info">
            <div class="score-overall-title">Overall Virality Score
              <span class="score-grade-badge" style="background:${gradeColor}22; color:${gradeColor}; margin-left:0.5rem;">Grade ${grade}</span>
            </div>
            <div class="score-overall-sub">${overallMsg}</div>
          </div>
        </div>

        <!-- Hook Score Bar -->
        <div class="score-row">
          <div class="score-row-header">
            <span class="score-row-label">⚡ First 3-Second Hook</span>
            <span class="score-row-num" style="color:${hookScore>=85?'#00f2fe':hookScore>=65?'#f56040':'#f87171'}">${hookScore}/100</span>
          </div>
          <div class="score-bar-track">
            <div class="score-bar-fill" id="bar-hook" style="background:${hookScore>=85?'#00f2fe':hookScore>=65?'#f56040':'#f87171'}; width:0%;"></div>
          </div>
          <div class="score-row-verdict">${hookVerdict}</div>
        </div>

        <!-- Audio Score Bar -->
        <div class="score-row">
          <div class="score-row-header">
            <span class="score-row-label">🎵 Audio & Music</span>
            <span class="score-row-num" style="color:${audioScore>=85?'#00f2fe':audioScore>=70?'#f56040':'#f87171'}">${audioScore}/100</span>
          </div>
          <div class="score-bar-track">
            <div class="score-bar-fill" id="bar-audio" style="background:${audioScore>=85?'#00f2fe':audioScore>=70?'#f56040':'#f87171'}; width:0%;"></div>
          </div>
          <div class="score-row-verdict">${audioVerdict}</div>
        </div>

        <!-- Length Score Bar -->
        <div class="score-row">
          <div class="score-row-header">
            <span class="score-row-label">⏱️ Video Length & Loop</span>
            <span class="score-row-num" style="color:${lengthScore>=85?'#00f2fe':lengthScore>=65?'#f56040':'#f87171'}">${lengthScore}/100</span>
          </div>
          <div class="score-bar-track">
            <div class="score-bar-fill" id="bar-length" style="background:${lengthScore>=85?'#00f2fe':lengthScore>=65?'#f56040':'#f87171'}; width:0%;"></div>
          </div>
          <div class="score-row-verdict">${lengthVerdict}</div>
        </div>

      </div>

      <!-- 3 Simple Fixes Section -->
      <div class="results-section">
        <h3 class="section-heading" style="color:var(--accent-cyan);">
          🛠️ 3 Simple Fixes to Get More Views
        </h3>
        <div class="ai-advice-list">
          <div class="ai-advice-item" style="border-left-color:var(--primary-pink)">
            <div style="font-size:1.2rem;">✏️</div>
            <div>
              <strong>1. Add a Title Text in the First 2 Seconds:</strong><br>
              Put a big bold sentence on screen at the very start of your video (like <i>"You won't believe this..."</i> or <i>"Stop scrolling!"</i>). This grabs attention fast.
            </div>
          </div>
          ${audioType !== 'trending' ? `
          <div class="ai-advice-item" style="border-left-color:var(--accent-cyan)">
            <div style="font-size:1.2rem;">🎵</div>
            <div>
              <strong>2. Add Popular Background Music:</strong><br>
              Open the Instagram audio library and add a currently trending song at low volume (5%–10%). This helps Instagram show your video on the Explore page.
            </div>
          </div>` : `
          <div class="ai-advice-item" style="border-left-color:var(--accent-cyan)">
            <div style="font-size:1.2rem;">🔥</div>
            <div>
              <strong>2. Great Music Choice!</strong><br>
              You are already using popular music — this gives a <b>+45% reach boost</b>. Keep it up!
            </div>
          </div>`}
          <div class="ai-advice-item" style="border-left-color:var(--primary-purple)">
            <div style="font-size:1.2rem;">⏰</div>
            <div>
              <strong>3. Post on Wednesday or Sunday at 6:00 PM:</strong><br>
              This is when most of your followers are scrolling Instagram. Posting at peak time gives your video the best chance of going viral fast.
            </div>
          </div>
        </div>
      </div>
    `;

    if (auditResultsContainer) {
      auditResultsContainer.innerHTML = auditHtml;
      auditResultsContainer.style.display = 'block';
      auditResultsContainer.scrollIntoView({ behavior: 'smooth' });

      // Animate score bars after a short delay
      setTimeout(() => {
        const barHook   = document.getElementById('bar-hook');
        const barAudio  = document.getElementById('bar-audio');
        const barLength = document.getElementById('bar-length');
        if (barHook)   barHook.style.width   = `${hookScore}%`;
        if (barAudio)  barAudio.style.width  = `${audioScore}%`;
        if (barLength) barLength.style.width = `${lengthScore}%`;
      }, 120);
    }
  }
}

// ---------------- 6. SECTION 3 - AI CAPTION & VIRAL TITLE GENERATOR ----------------
function initCaptionGeneratorScreen() {
  document.getElementById('form-caption-gen')?.addEventListener('submit', e => {
    e.preventDefault();
    generateAICaption();
  });
}

function generateAICaption() {
  const rawTopic = document.getElementById('caption-topic').value.trim();
  const topic = rawTopic || 'Growth Tips';
  const topicLower = topic.toLowerCase();
  const style = document.getElementById('caption_style').value;
  const numHashtags = parseInt(document.getElementById('caption_hashtags').value);
  const followers = appState.profile ? (appState.profile.followers || 15000) : 15000;

  // 1. Topic Category & Smart Hook Intelligence
  let hooks = [];
  let hashtags = [];
  let captionBody = '';

  if (topicLower.includes('animal') || topicLower.includes('pet') || topicLower.includes('dog') || topicLower.includes('cat')) {
    hooks = [
      `🔥 "Stop scrolling if you have a pet at home! 🐾"`,
      `💡 "3 Mind-blowing facts about animals that science can't even explain..."`,
      `✨ "The secret body language of animals decoded (Save this video!)"`
    ];
    hashtags = ['#animalsoftiktok', '#petlovers', '#viralpets', '#cuteanimals', '#dogsoftagram', '#catsofinstagram', '#animallover', '#petcare', '#wildlifephotography', '#furryfriends', '#naturelovers', '#petsgram', '#trendinganimals', '#animalfacts', '#instapet'];
    if (style === 'viral') {
      captionBody = `Did you know animals actually do this to show love? 🐾👇\n\nMost pet owners completely miss rule #2! Watch till the end to see the reaction.\n\nSave this video so you can check your pet later! ❤️\n\nTag an animal lover who needs to see this! 🐶🐱`;
    } else if (style === 'storytelling') {
      captionBody = `I used to think all animals behave the same way until I observed this one detail... ✨\n\nIt completely changed how I interact with pets every single day.\n\nDrop a comment with your favorite animal below! 👇`;
    } else {
      captionBody = `Here are 3 essential facts about ${topic}:\n\n• Point 1: Animals communicate mostly through body movements & tail gestures\n• Point 2: Calm environments reduce pet stress by up to 60%\n• Point 3: Daily mental stimulation keeps them happy & healthy!\n\nSave & share this with a friend! 📌`;
    }
  } else if (topicLower.includes('fit') || topicLower.includes('gym') || topicLower.includes('workout') || topicLower.includes('health') || topicLower.includes('diet')) {
    hooks = [
      `🔥 "Stop doing this workout mistake if you want real results! 💪"`,
      `💡 "3 Secret fitness hacks that burn fat 2x faster in 30 days..."`,
      `✨ "The 10-minute daily routine that transformed my physique (Save this!)"`
    ];
    hashtags = ['#fitnessmotivation', '#gymtips', '#fatlosshacks', '#bodytransformation', '#workoutroutine', '#fitnesstips', '#healthyhabits', '#gains', '#shredded', '#homefitness', '#buildmuscle', '#healthylifestyle', '#personaltrainer', '#fitnessgoals', '#workoutmotivation'];
    if (style === 'viral') {
      captionBody = `Want to see faster fitness results in the next 30 days? Stop doing this right now 👇\n\nSave this reel so you don't forget your next gym session!\n\nTag your workout partner below! 💪🔥`;
    } else if (style === 'storytelling') {
      captionBody = `I trained for 6 months without seeing any results until I fixed this 1 simple mistake... ✨\n\nOnce I made the shift, my energy & progress skyrocketed.\n\nDrop a 🔥 in the comments if you are working out this week!`;
    } else {
      captionBody = `3 Steps to master your ${topic} routine:\n\n• Step 1: Prioritize progressive overload & form\n• Step 2: Hit your daily protein & hydration goals\n• Step 3: Get 7-8 hours of quality sleep for recovery\n\nSave this post for your next workout! 🏋️`;
    }
  } else if (topicLower.includes('code') || topicLower.includes('python') || topicLower.includes('ai') || topicLower.includes('tech') || topicLower.includes('dev')) {
    hooks = [
      `🔥 "Stop writing code like this in 2026! Here is the clean way 💻"`,
      `💡 "3 Secret AI tools that feel illegal to know for developers..."`,
      `✨ "The #1 coding trick senior engineers don't tell beginners (Save this!)"`
    ];
    hashtags = ['#coding', '#programmer', '#python', '#webdevelopment', '#aitools', '#softwareengineer', '#techcreator', '#code', '#developerlife', '#computerscience', '#fullstack', '#learntocode', '#techtrends', '#ai', '#backend'];
    if (style === 'viral') {
      captionBody = `Are you still coding the old way? Here is the 2026 method that saves 10+ hours a week 👇\n\nBookmark this post so you can use it on your next project!\n\nTag a developer friend who needs to see this! 🤖💻`;
    } else if (style === 'storytelling') {
      captionBody = `I spent 4 hours debugging code yesterday until I realized this simple syntax error... ✨\n\nHere is what I learned so you don't waste time like I did.\n\nDrop a comment if you have ever been stuck debugging! 🐞`;
    } else {
      captionBody = `Best practices for ${topic} in 2026:\n\n• 1. Keep functions modular and easy to test\n• 2. Automate repetitive tasks using modern AI tools\n• 3. Write clean, readable documentation\n\nSave this guide for reference! 📌`;
    }
  } else if (topicLower.includes('food') || topicLower.includes('recipe') || topicLower.includes('cook') || topicLower.includes('bake') || topicLower.includes('eat')) {
    hooks = [
      `🔥 "The 5-minute recipe that tastes like a 5-star restaurant! 🍝"`,
      `💡 "Never cook your dish like this again! Here is the secret ingredient..."`,
      `✨ "The easiest delicious meal you can make tonight (Save this!)"`
    ];
    hashtags = ['#foodie', '#easyrecipes', '#homecooking', '#quickmeals', '#chefmode', '#deliciousfood', '#foodstagram', '#recipeideas', '#tasty', '#dinnerideas', '#foodhacks', '#healthyrecipes', '#foodlover', '#cookinghacks', '#instafood'];
    if (style === 'viral') {
      captionBody = `If you have 5 minutes and these 3 ingredients, make this recipe right now 👇\n\nSave this recipe video before you forget!\n\nTag someone who needs to cook this for you! 😋✨`;
    } else {
      captionBody = `How to elevate your ${topic} in 3 simple steps:\n\n• Step 1: Season at every stage of cooking\n• Step 2: Use fresh high-quality ingredients\n• Step 3: Let it rest before serving for maximum flavor!\n\nBookmark this recipe! 🍳`;
    }
  } else {
    // Dynamic Fallback for ANY custom topic entered
    const topicFormatted = topic.charAt(0).toUpperCase() + topic.slice(1);
    hooks = [
      `🔥 "If you care about ${topicFormatted}, stop scrolling right now!"`,
      `💡 "3 Game-changing secrets about ${topicFormatted} nobody talks about..."`,
      `✨ "The ultimate guide to mastering ${topicFormatted} (Save this post!)"`
    ];
    hashtags = [`#${topicLower.replace(/\s+/g, '')}`, '#viralreels', '#reelsinstagram', '#creatortips', '#trendingvideo', '#contentcreator', '#explorepage', '#viralcontent', '#dailyinspiration', '#instatips', '#growthmindset', '#reelitfeelit', '#trendingnow', '#videooftheday', '#creatorcommunity'];
    if (style === 'viral') {
      captionBody = `Want to get better at ${topicFormatted}? Here is the #1 mistake most people make 👇\n\nSave this video so you can refer back to it anytime!\n\nTag a friend who needs to hear this today! ❤️`;
    } else if (style === 'storytelling') {
      captionBody = `I used to struggle with ${topicFormatted} until I discovered this key insight ✨\n\nIt completely transformed my approach and results.\n\nDrop a comment below if you want to learn more!`;
    } else {
      captionBody = `Key takeaways for ${topicFormatted}:\n\n• Step 1: Start simple & maintain daily consistency\n• Step 2: Focus on high quality over fast quantity\n• Step 3: Bookmark this guide to review whenever needed!\n\nSave this post! 📌`;
    }
  }

  // Format Hashtags
  const hashtagString = hashtags.slice(0, numHashtags).join(' ');
  captionBody = `${captionBody}\n\n${hashtagString}`;

  // 2. Reach & Max Views Potential Calculation Engine
  const baseViews = Math.max(5000, Math.round(followers * 1.8));
  const minPotential = (baseViews * 2.5).toLocaleString('en-US');
  const maxPotential = (baseViews * 12.0).toLocaleString('en-US');
  const reachBoost = style === 'viral' ? '+340%' : style === 'storytelling' ? '+280%' : '+220%';

  const outputContainer = document.getElementById('caption-output-container');
  if (outputContainer) {
    outputContainer.innerHTML = `
      <div class="companion-card" style="background: linear-gradient(135deg, rgba(225, 48, 108, 0.12), rgba(252, 175, 69, 0.12)); border-color: rgba(225, 48, 108, 0.35);">
        
        <!-- Header -->
        <div style="font-weight:800; font-size:1.1rem; color:var(--text-main); margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <span>✨ Unique AI Title Hooks &amp; Caption for: <strong>"${topic}"</strong></span>
          <button id="btn-copy-caption" class="btn-secondary" style="padding:0.4rem 0.85rem; font-size:0.8rem; border-color:var(--primary-pink); color:var(--primary-pink);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy Full Caption
          </button>
        </div>

        <!-- Reach & Views Potential Prediction Card -->
        <div style="background: rgba(0,0,0,0.35); border:1px solid rgba(0, 242, 254, 0.3); border-radius:var(--radius-md); padding:1rem 1.2rem; margin-bottom:1.25rem;">
          <div style="font-size:0.82rem; font-weight:700; color:var(--accent-cyan); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.6rem;">
            📊 Estimated Algorithm Reach &amp; Views Potential:
          </div>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:0.85rem; text-align:center;">
            <div style="background:rgba(255,255,255,0.04); padding:0.6rem; border-radius:var(--radius-sm);">
              <div style="font-size:0.75rem; color:var(--text-muted);">Explore Reach Boost</div>
              <div style="font-size:1.15rem; font-weight:800; color:#00f2fe;">${reachBoost}</div>
            </div>
            <div style="background:rgba(255,255,255,0.04); padding:0.6rem; border-radius:var(--radius-sm);">
              <div style="font-size:0.75rem; color:var(--text-muted);">Max Potential Views</div>
              <div style="font-size:1.15rem; font-weight:800; color:#fcaf45;">${minPotential} – ${maxPotential}</div>
            </div>
            <div style="background:rgba(255,255,255,0.04); padding:0.6rem; border-radius:var(--radius-sm);">
              <div style="font-size:0.75rem; color:var(--text-muted);">Save &amp; Share Rate</div>
              <div style="font-size:1.15rem; font-weight:800; color:#e1306c;">3.8x Higher</div>
            </div>
          </div>
        </div>

        <!-- 3 Tailored Viral Title Hooks -->
        <div style="font-weight:800; font-size:0.9rem; color:var(--primary-pink); margin-bottom:0.5rem;">
          🔥 3 Tailored Viral Opening Title Hooks (Pick One):
        </div>
        <div class="ai-advice-list" style="margin-bottom:1.25rem;">
          ${hooks.map(h => `<div class="ai-advice-item" style="border-left-color:var(--primary-pink); font-size:0.92rem; color:var(--text-main);"><b>${h}</b></div>`).join('')}
        </div>

        <!-- Optimized Ready-to-Post Caption -->
        <div style="font-weight:800; font-size:0.9rem; color:var(--accent-cyan); margin-bottom:0.4rem;">
          📝 Optimized Ready-to-Post Caption &amp; Hashtags:
        </div>
        <textarea id="ai-caption-text" style="width:100%; height:160px; background:rgba(0,0,0,0.4); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.9rem; color:var(--text-main); font-size:0.9rem; line-height:1.5; outline:none; resize:none;">${captionBody}</textarea>
      </div>
    `;

    outputContainer.style.display = 'block';
    outputContainer.scrollIntoView({ behavior: 'smooth' });

    document.getElementById('btn-copy-caption')?.addEventListener('click', () => {
      const copyText = document.getElementById('ai-caption-text');
      if (copyText) {
        copyText.select();
        navigator.clipboard.writeText(copyText.value);
        const copyBtn = document.getElementById('btn-copy-caption');
        if (copyBtn) copyBtn.innerHTML = `✓ Copied!`;
        setTimeout(() => {
          if (copyBtn) copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy Full Caption`;
        }, 2000);
      }
    });
  }
}

// ---------------- 7. SECTION 4 - POST DIAGNOSTIC AUDIT ----------------
function initDiagnosticScreen() {
  document.getElementById('form-diagnostic')?.addEventListener('submit', e => {
    e.preventDefault();
    runPostDiagnostic();
  });

  document.getElementById('btn-diag-again')?.addEventListener('click', () => {
    showScreen('screen-diagnostic');
  });

  document.getElementById('btn-diag-switch-pre')?.addEventListener('click', () => {
    appState.currentMode = 'pre';
    const modeBtnPre = document.getElementById('mode-btn-pre');
    const modeBtnPost = document.getElementById('mode-btn-post');
    modeBtnPre?.classList.add('active');
    modeBtnPost?.classList.remove('active');
    showScreen('screen-predictor');
  });
}

function runPostDiagnostic() {
  const postType = parseInt(document.getElementById('diag_post_type').value);
  const views = parseInt(document.getElementById('diag_views').value);
  const likes = parseInt(document.getElementById('diag_likes').value);
  const shares = parseInt(document.getElementById('diag_shares').value);
  const saves = parseInt(document.getElementById('diag_saves').value);
  const hour = parseInt(document.getElementById('diag_hour').value);

  const expectedViews = appState.profile.followers * (postType === 1 ? 0.8 : postType === 2 ? 0.5 : 0.3);
  const viewRatio = Math.min(1.5, views / (expectedViews + 1));
  const shareRatio = shares / (views + 1);
  const saveRatio = saves / (views + 1);
  const timeBonus = (hour >= 17 && hour <= 21) ? 1.2 : 0.85;

  let healthScore = Math.min(100, Math.round((viewRatio * 35 + shareRatio * 1500 + saveRatio * 1000) * timeBonus));
  healthScore = Math.max(12, healthScore);

  const scoreEl = document.getElementById('diag-score-num');
  if (scoreEl) scoreEl.textContent = `${healthScore}/100`;

  const labelEl = document.getElementById('diag-health-label');
  if (labelEl) {
    if (healthScore < 40) {
      labelEl.textContent = 'Low Views Received (Needs Easy Changes)';
      labelEl.style.color = '#f87171';
    } else if (healthScore < 70) {
      labelEl.textContent = 'Average Views (Can Be Improved)';
      labelEl.style.color = '#f56040';
    } else {
      labelEl.textContent = 'Great Views! (Strong Performance)';
      labelEl.style.color = 'var(--accent-cyan)';
    }
  }

  const causesEl = document.getElementById('diag-causes-list');
  if (causesEl) {
    let causesHtml = '';

    if (shareRatio < 0.01) {
      causesHtml += `
        <div class="rec-card" style="border-left-color:#f87171">
          <div class="rec-head" style="color:#f87171">
            <span>❌ Very Few People Shared Your Post</span>
          </div>
          <div class="rec-text">Instagram stops showing posts to new people if viewers don't share or send the video to their friends.</div>
        </div>
      `;
    }

    if (hour < 17 || hour > 21) {
      causesHtml += `
        <div class="rec-card" style="border-left-color:#f56040">
          <div class="rec-head" style="color:#f56040">
            <span>⏰ Posted at an Off-Peak Time (${hour}:00)</span>
          </div>
          <div class="rec-text">Posting at ${hour}:00 missed your followers' active evening scrolling hours, reducing your early views.</div>
        </div>
      `;
    }

    if (postType !== 1) {
      causesHtml += `
        <div class="rec-card" style="border-left-color:var(--primary-purple)">
          <div class="rec-head" style="color:var(--primary-purple)">
            <span>🖼️ Normal Photo Used Instead of a Video</span>
          </div>
          <div class="rec-text">Normal photos get shown to fewer people on Instagram compared to Reel videos.</div>
        </div>
      `;
    }

    causesEl.innerHTML = causesHtml || `
      <div class="rec-card" style="border-left-color:var(--accent-cyan)">
        <div class="rec-head" style="color:var(--accent-cyan)">
          <span>✓ Good View Base!</span>
        </div>
        <div class="rec-text">Your post had decent views, but you can get 2x to 3x more views by following the simple fixes below!</div>
      </div>
    `;
  }

  const fixesEl = document.getElementById('diag-fixes-list');
  if (fixesEl) {
    fixesEl.innerHTML = `
      <div class="rec-card" style="border-left-color:var(--accent-cyan)">
        <div class="rec-head">
          <span>✏️ 1. Catch Viewers in the First 2 Seconds</span>
          <span style="color:var(--accent-cyan); font-weight:800;">+40% Views</span>
        </div>
        <div class="rec-text">Put a clear title text at the top of your video (like <i>"Wait for the end!"</i>) so people don't swipe away.</div>
      </div>
      <div class="rec-card" style="border-left-color:var(--primary-pink)">
        <div class="rec-head">
          <span>📌 2. Tell People to Save Your Post</span>
          <span style="color:var(--primary-pink); font-weight:800;">Important</span>
        </div>
        <div class="rec-text">Add a note at the end of your video or caption: <i>"Save this post so you don't lose it!"</i></div>
      </div>
      <div class="rec-card" style="border-left-color:var(--primary-purple)">
        <div class="rec-head">
          <span>⏰ 3. Post on Wednesday Evening</span>
          <span style="color:var(--primary-purple); font-weight:800;">Best Timing</span>
        </div>
        <div class="rec-text">Post your next video on <b>Wednesday or Sunday at 6:00 PM</b> when most people are online on Instagram.</div>
      </div>
    `;
  }

  showScreen('screen-diag-results');
}
