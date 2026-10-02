(function () {
  const cfg = window.NEXORA_CONFIG || {};
  const configured =
    cfg.SUPABASE_URL &&
    !cfg.SUPABASE_URL.includes('YOUR-PROJECT') &&
    cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_ANON_KEY.includes('YOUR_SUPABASE');

  const isLogin = !!document.getElementById('loginForm');
  const isDashboard = !!document.getElementById('dashboardSection');

  function showStatus(el, message, type) {
    if (!el) return;
    el.textContent = message || '';
    el.className = message ? 'form-status show ' + type : 'form-status';
  }

  if (!configured || !window.supabase) {
    const status = document.getElementById('loginStatus') || document.getElementById('dashboardStatus');
    showStatus(status, 'Supabase is not configured. Check config.js.', 'error');
    const btn = document.getElementById('loginBtn');
    if (btn) btn.disabled = true;
    return;
  }

  const client = window.supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_ANON_KEY
  );

  if (isLogin) {
    const form = document.getElementById('loginForm');
    const status = document.getElementById('loginStatus');
    const btn = document.getElementById('loginBtn');

    // If an authenticated session already exists, go straight to the dashboard.
    client.auth.getSession().then(({ data }) => {
      if (data.session) {
        location.replace('admin-dashboard.html');
      }
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      showStatus(status, '', '');
      btn.disabled = true;
      btn.textContent = 'Signing in...';

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      try {
        const { error } = await client.auth.signInWithPassword({ email, password });

        if (error) {
          showStatus(
            status,
            'Login failed. Check your email and password, and make sure the user exists in Supabase Authentication.',
            'error'
          );
          return;
        }

        location.replace('admin-dashboard.html');
      } catch (error) {
        console.error(error);
        showStatus(status, 'Unable to sign in right now. Please try again.', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Login';
      }
    });
  }

  if (isDashboard) {
    const body = document.getElementById('messagesBody');
    const status = document.getElementById('dashboardStatus');
    const refresh = document.getElementById('refreshBtn');
    const logout = document.getElementById('logoutBtn');

    async function isAuthorizedAdmin() {
      const { data: sessionData, error: sessionError } = await client.auth.getSession();

      if (sessionError || !sessionData.session) {
        location.replace('admin.html');
        return false;
      }

      // RLS is the final security boundary. This query confirms that the
      // logged-in Supabase user is present in public.admins.
      const { data: adminRow, error: adminError } = await client
        .from('admins')
        .select('user_id')
        .eq('user_id', sessionData.session.user.id)
        .maybeSingle();

      if (adminError || !adminRow) {
        await client.auth.signOut();
        showStatus(
          status,
          'This account is not authorized for the Nexora admin dashboard.',
          'error'
        );
        setTimeout(() => location.replace('admin.html'), 1800);
        return false;
      }

      return true;
    }

    function escapeHtml(value) {
      return String(value ?? '').replace(/[&<>'"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[char];
      });
    }

    async function loadMessages() {
      showStatus(status, '', '');
      body.innerHTML =
        '<tr><td colspan="6" class="empty">Loading messages...</td></tr>';

      const { data, error } = await client
        .from('contact_messages')
        .select('id,created_at,full_name,email,phone,company,service,message')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        body.innerHTML =
          '<tr><td colspan="6" class="empty">Could not load messages.</td></tr>';
        showStatus(
          status,
          'Messages could not be loaded. ' + (error.message || 'Check public.admins and Supabase RLS policies.'),
          'error'
        );
        return;
      }

      if (!data || data.length === 0) {
        body.innerHTML =
          '<tr><td colspan="6" class="empty">No client messages yet.</td></tr>';
        return;
      }

      body.innerHTML = data.map(function (row) {
        const date = row.created_at
          ? new Date(row.created_at).toLocaleString()
          : '—';

        return `
          <tr>
            <td>${escapeHtml(date)}</td>
            <td><strong>${escapeHtml(row.full_name)}</strong></td>
            <td>
              ${escapeHtml(row.email)}
              ${row.phone ? '<br><span class="muted">' + escapeHtml(row.phone) + '</span>' : ''}
            </td>
            <td>${escapeHtml(row.company || '—')}</td>
            <td><span class="badge">${escapeHtml(row.service)}</span></td>
            <td>${escapeHtml(row.message)}</td>
          </tr>
        `;
      }).join('');
    }

    refresh.addEventListener('click', async function () {
      const authorized = await isAuthorizedAdmin();
      if (authorized) loadMessages();
    });

    logout.addEventListener('click', async function () {
      logout.disabled = true;
      logout.textContent = 'Logging out...';
      await client.auth.signOut();
      location.replace('admin.html');
    });

    client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        location.replace('admin.html');
      }
    });

    isAuthorizedAdmin().then(function (authorized) {
      if (authorized) loadMessages();
    });
  }
})();
