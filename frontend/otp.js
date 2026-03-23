// OTP Verification Functions - Integrated with EduSys Registration Form

// Route /api/* calls to backend when frontend is served separately (e.g., :5173)
(function() {
  if (window.__edusysFetchPatched) return;
  var base = '';
  try {
    base = window.EDUSYS_API_BASE || localStorage.getItem('edusys-api-base') || '';
  } catch (e) {
    base = window.EDUSYS_API_BASE || '';
  }
  if (!base) {
    var loc = window.location;
    if ((loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') && loc.port && loc.port !== '3001') {
      base = loc.protocol + '//' + loc.hostname + ':3001';
    }
  }
  if (!base) {
    window.__edusysFetchPatched = true;
    return;
  }
  window.EDUSYS_API_BASE = base;
  var _fetch = window.fetch;
  window.fetch = function(input, init) {
    try {
      if (typeof input === 'string') {
        if (input.indexOf('/api/') === 0) input = base + input;
      } else if (input && typeof input === 'object' && typeof input.url === 'string') {
        if (input.url.indexOf('/api/') === 0) {
          input = new Request(base + input.url, input);
        } else if (input.url.indexOf(window.location.origin + '/api/') === 0) {
          input = new Request(base + input.url.slice(window.location.origin.length), input);
        }
      }
    } catch (e) {}
    return _fetch(input, init);
  };
  window.__edusysFetchPatched = true;
})();

// Get Supabase client - made available globally in index.html
function getSupabaseClient() {
  if (window.supabase_client) {
    return window.supabase_client;
  }
  throw new Error('Supabase client not initialized. Please refresh the page.');
}

// Step 1: Send OTP to email during signup
async function sendOtpForSignup() {
  const college = (document.getElementById('cs-college') || {}).value.trim();
  const email = (document.getElementById('cs-email') || {}).value.trim();
  const head = (document.getElementById('cs-head') || {}).value.trim();
  const password = (document.getElementById('cs-password') || {}).value.trim();
  const errorDiv = document.getElementById('cs-error');

  // Validate required fields
  if (!college || !email || !head || !password) {
    if (errorDiv) {
      errorDiv.textContent = '✕ Please fill all required fields';
      errorDiv.style.display = 'block';
    }
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    if (errorDiv) {
      errorDiv.textContent = '✕ Please enter a valid email address';
      errorDiv.style.display = 'block';
    }
    return;
  }

  // Validate password length
  if (password.length < 8) {
    if (errorDiv) {
      errorDiv.textContent = '✕ Password must be at least 8 characters';
      errorDiv.style.display = 'block';
    }
    return;
  }

  try {
    if (errorDiv) {
      errorDiv.textContent = 'Sending OTP...';
      errorDiv.style.display = 'block';
      errorDiv.style.color = 'var(--text2)';
      errorDiv.style.background = 'rgba(102,126,234,0.1)';
      errorDiv.style.border = '1px solid rgba(102,126,234,0.2)';
    }

    // Store form data temporarily for later use
    window.__signupData = {
      college: college,
      email: email.toLowerCase().trim(),
      phone: (document.getElementById('cs-phone') || {}).value.trim(),
      head: head,
      role: (document.getElementById('cs-role') || {}).value.trim(),
      password: password
    };

    // Get Supabase client
    const supabase = getSupabaseClient();

    console.log('📨 Sending OTP to:', email.toLowerCase().trim());

    // Call Supabase to send OTP
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      throw error;
    }

    // Show success message
    if (errorDiv) {
      errorDiv.textContent = '✓ OTP sent to ' + email + '. Check your inbox.';
      errorDiv.style.display = 'block';
      errorDiv.style.color = '#155724';
      errorDiv.style.background = 'rgba(212, 237, 218, 1)';
      errorDiv.style.border = '1px solid rgba(195, 230, 203, 1)';
    }

    // Hide form, show OTP input
    const formPanel = document.getElementById('create-form-panel');
    const otpPanel = document.getElementById('otp-verify-panel');
    const emailDisplay = document.getElementById('otp-email-display');

    if (formPanel) formPanel.style.display = 'none';
    if (otpPanel) otpPanel.style.display = 'block';
    if (emailDisplay) emailDisplay.textContent = email;

    // Clear OTP input
    const otpInput = document.getElementById('cs-otp');
    if (otpInput) otpInput.value = '';

    // Focus on OTP input
    if (otpInput) setTimeout(() => otpInput.focus(), 300);

  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    
    if (errorDiv) {
      let userMessage = error.message || 'Error sending OTP. Please try again.';
      
      // Provide more helpful messages for common errors
      if (error.message.includes('not initialized')) {
        userMessage = '⚠️ Supabase not loaded. Please refresh the page and try again.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        userMessage = '⚠️ Network error. Check your internet connection.';
      }
      
      errorDiv.textContent = '✕ ' + userMessage;
      errorDiv.style.display = 'block';
      errorDiv.style.color = 'var(--red)';
      errorDiv.style.background = 'rgba(248,113,113,0.1)';
      errorDiv.style.border = '1px solid rgba(248,113,113,0.2)';
    }
  }
}

// Step 2: Verify OTP and create account
async function verifyOtpForSignup() {
  const otp = (document.getElementById('cs-otp') || {}).value.trim();
  const otpErrorDiv = document.getElementById('otp-error');
  const signupData = window.__signupData || {};
  const email = signupData.email;

  if (!otp) {
    if (otpErrorDiv) {
      otpErrorDiv.textContent = '✕ Please enter the OTP';
      otpErrorDiv.style.display = 'block';
    }
    return;
  }

  if (!email) {
    if (otpErrorDiv) {
      otpErrorDiv.textContent = '✕ Email information missing. Please start again.';
      otpErrorDiv.style.display = 'block';
    }
    return;
  }

  try {
    if (otpErrorDiv) {
      otpErrorDiv.textContent = 'Verifying OTP...';
      otpErrorDiv.style.display = 'block';
      otpErrorDiv.style.color = 'var(--text2)';
      otpErrorDiv.style.background = 'rgba(102,126,234,0.1)';
      otpErrorDiv.style.border = '1px solid rgba(102,126,234,0.2)';
    }

    // Debug logging
    console.log('🔍 Verifying OTP with:');
    console.log('  Email:', email);
    console.log('  OTP length:', otp.length);
    console.log('  OTP value:', otp);

    // Get Supabase client
    const supabase = getSupabaseClient();

    // Verify OTP with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase().trim(),
      token: otp,
      type: 'email',
    });

    console.log('Supabase response:', { data, error });

    if (error) {
      throw error;
    }

    // OTP verified successfully - now complete the registration
    if (otpErrorDiv) {
      otpErrorDiv.textContent = '✓ Email verified! Creating system...';
      otpErrorDiv.style.display = 'block';
      otpErrorDiv.style.color = '#155724';
      otpErrorDiv.style.background = 'rgba(212, 237, 218, 1)';
      otpErrorDiv.style.border = '1px solid rgba(195, 230, 203, 1)';
    }

    // Generate system key (same as original registerCollege)
    const key = 'EDU-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const college = signupData.college || 'Your College';
    
    // Store system key + institute name
    const storeSet = window.storeSet || function(k, v) { localStorage.setItem(k, v); };
    storeSet('edusys-key', key);
    storeSet('edusys-college', college);

    // Persist key in database (best-effort)
    try {
      await fetch('/api/system-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key })
      });
    } catch (e) {
      // Ignore DB failures; local key still works
    }

    // Clear any stale session before auto-login
    try { localStorage.removeItem('edusys_session'); } catch (e) {}

    // Create Head account + login (best-effort)
    var autoLoginOk = false;
    try {
      const headName = signupData.head || 'Head';
      const headEmail = signupData.email || email;
      const headPassword = signupData.password || password;
      const roleValue = String(signupData.role || 'Head').toLowerCase();
      const finalRole = roleValue.includes('head') ? 'Head' : 'Head';
      await fetch('/api/users/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: headName,
          email: headEmail,
          password: headPassword,
          role: finalRole,
          dept: 'All',
          institute: college,
          key: key
        })
      }).catch(function() {});

      if (typeof authLoginServer === 'function') {
        autoLoginOk = await authLoginServer(headEmail, headPassword, 'Head');
      } else {
        const loginRes = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: headEmail, password: headPassword })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok && loginData && loginData.ok && loginData.user) {
          if (typeof setSessionFromUser === 'function') {
            setSessionFromUser(loginData.user);
          } else {
            const storeSet = window.storeSet || function(k, v) { localStorage.setItem(k, v); };
            storeSet('edusys_session', JSON.stringify({
              email: loginData.user.email,
              role: loginData.user.role,
              name: loginData.user.name,
              dept: loginData.user.dept || 'All',
              title: loginData.user.title || loginData.user.role,
              institute: loginData.user.institute || college
            }));
          }
          autoLoginOk = true;
        }
      }
    } catch (e) {
      autoLoginOk = false;
    }

    if (autoLoginOk && typeof showPage === 'function') {
      const showToast = window.showToast || function(msg, type) { console.log(msg); };
      showToast(college + ' created! System Key: ' + key, 'success');
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(key).catch(function() {});
      }
      showPage('erp');
    } else {
      // Display success page with key
      const otpPanel = document.getElementById('otp-verify-panel');
      const keyPanel = document.getElementById('key-panel');
      const keyDisplay = document.getElementById('generated-key');

      if (otpPanel) otpPanel.style.display = 'none';
      if (keyPanel) {
        keyPanel.style.display = 'block';
        // Update success message
        const heading = keyPanel.querySelector('h3');
        if (heading) heading.textContent = college + ' System Created!';
      }
      if (keyDisplay) keyDisplay.textContent = key;

      // Show success toast
      const showToast = window.showToast || function(msg, type) { console.log(msg); };
      showToast(college + ' registered and verified! System Key: ' + key, 'success');
    }

    // Clear sensitive data
    window.__signupData = null;

  } catch (error) {
    console.error('Error verifying OTP:', error);
    if (otpErrorDiv) {
      const errorMsg = error.message || 'Invalid OTP or verification failed';
      otpErrorDiv.textContent = '✕ ' + errorMsg;
      otpErrorDiv.style.display = 'block';
      otpErrorDiv.style.color = 'var(--red)';
      otpErrorDiv.style.background = 'rgba(248,113,113,0.1)';
      otpErrorDiv.style.border = '1px solid rgba(248,113,113,0.2)';
    }
  }
}

// Step 3: Go back to form if user wants to resend OTP
function backToFormFromOtp() {
  const formPanel = document.getElementById('create-form-panel');
  const otpPanel = document.getElementById('otp-verify-panel');
  const csError = document.getElementById('cs-error');
  const otpError = document.getElementById('otp-error');

  if (formPanel) formPanel.style.display = 'block';
  if (otpPanel) otpPanel.style.display = 'none';
  if (csError) csError.style.display = 'none';
  if (otpError) otpError.style.display = 'none';

  // Clear OTP input but keep form data
  const otpInput = document.getElementById('cs-otp');
  if (otpInput) otpInput.value = '';
}

// Legacy function - kept for backward compatibility
async function sendOtp() {
  const email = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
  const messageDiv = document.getElementById('message');

  if (!email) {
    if (messageDiv) {
      messageDiv.textContent = 'Please enter an email address';
      messageDiv.className = 'message error';
    }
    return;
  }

  try {
    if (messageDiv) {
      messageDiv.textContent = 'Sending OTP...';
      messageDiv.className = 'message info';
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      throw error;
    }

    if (messageDiv) {
      messageDiv.textContent = `OTP sent to ${email}. Check your inbox.`;
      messageDiv.className = 'message success';
    }

    if (document.getElementById('otpSection')) {
      document.getElementById('otpSection').style.display = 'block';
    }
    if (document.getElementById('sendOtpBtn')) {
      document.getElementById('sendOtpBtn').disabled = true;
    }
    if (document.getElementById('email')) {
      document.getElementById('email').disabled = true;
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    if (messageDiv) {
      messageDiv.textContent = `Error: ${error.message}`;
      messageDiv.className = 'message error';
    }
  }
}

// Legacy function - kept for backward compatibility
async function verifyOtp() {
  const email = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
  const otp = document.getElementById('otp') ? document.getElementById('otp').value.trim() : '';
  const messageDiv = document.getElementById('message');

  if (!email || !otp) {
    if (messageDiv) {
      messageDiv.textContent = 'Please enter both email and OTP';
      messageDiv.className = 'message error';
    }
    return;
  }

  try {
    if (messageDiv) {
      messageDiv.textContent = 'Verifying OTP...';
      messageDiv.className = 'message info';
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'email',
    });

    if (error) {
      throw error;
    }

    if (messageDiv) {
      messageDiv.textContent = '✓ Signup successful! Account created and verified.';
      messageDiv.className = 'message success';
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    console.log('User data:', userData.user);

    if (userData.user) {
      const userInfoDiv = document.getElementById('userInfo');
      if (userInfoDiv) {
        userInfoDiv.innerHTML = `
          <h3>User Account Created</h3>
          <p><strong>Email:</strong> ${userData.user.email}</p>
          <p><strong>ID:</strong> ${userData.user.id}</p>
          <p><strong>Created At:</strong> ${new Date(userData.user.created_at).toLocaleString()}</p>
        `;
        userInfoDiv.style.display = 'block';
      }
    }

    if (document.getElementById('inputSection')) {
      document.getElementById('inputSection').style.display = 'none';
    }
    if (document.getElementById('otpSection')) {
      document.getElementById('otpSection').style.display = 'none';
    }
    if (document.getElementById('resetBtn')) {
      document.getElementById('resetBtn').style.display = 'block';
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    if (messageDiv) {
      messageDiv.textContent = `Error: ${error.message}`;
      messageDiv.className = 'message error';
    }
  }
}

// Legacy function - kept for backward compatibility
function resetForm() {
  if (document.getElementById('email')) document.getElementById('email').value = '';
  if (document.getElementById('otp')) document.getElementById('otp').value = '';
  if (document.getElementById('message')) {
    document.getElementById('message').textContent = '';
  }
  if (document.getElementById('userInfo')) document.getElementById('userInfo').style.display = 'none';
  if (document.getElementById('inputSection')) document.getElementById('inputSection').style.display = 'block';
  if (document.getElementById('otpSection')) document.getElementById('otpSection').style.display = 'none';
  if (document.getElementById('resetBtn')) document.getElementById('resetBtn').style.display = 'none';
  if (document.getElementById('sendOtpBtn')) document.getElementById('sendOtpBtn').disabled = false;
  if (document.getElementById('email')) document.getElementById('email').disabled = false;
}

// Check if user already logged in
async function checkAuth() {
  try {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (user) {
      console.log('User already logged in:', user.email);
      if (document.getElementById('inputSection')) {
        document.getElementById('inputSection').style.display = 'none';
      }
      if (document.getElementById('otpSection')) {
        document.getElementById('otpSection').style.display = 'none';
      }
      
      const userInfoDiv = document.getElementById('userInfo');
      if (userInfoDiv) {
        userInfoDiv.innerHTML = `
          <h3>Already Logged In</h3>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>ID:</strong> ${user.id}</p>
        `;
        userInfoDiv.style.display = 'block';
      }
      if (document.getElementById('resetBtn')) {
        document.getElementById('resetBtn').style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Auth check error:', error);
  }
}

// Run auth check on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', checkAuth);
}
