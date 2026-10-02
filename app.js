(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const cfg = window.NEXORA_CONFIG || {};
  const status = document.getElementById('formStatus');
  const button = document.getElementById('submitBtn');

  function showStatus(message, type) {
    status.textContent = message;
    status.className = 'form-status show ' + type;
  }

  if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes('YOUR-PROJECT') || !cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_ANON_KEY.includes('YOUR_SUPABASE')) {
    showStatus('Contact form is not configured yet. Add your Supabase URL and anon/publishable key in config.js.', 'error');
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    status.className = 'form-status';

    if (!window.supabase || !cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes('YOUR-PROJECT') || !cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_ANON_KEY.includes('YOUR_SUPABASE')) {
      showStatus('Supabase is not configured. Update config.js first.', 'error');
      return;
    }

    const client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    const payload = {
      full_name: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim() || null,
      company: document.getElementById('company').value.trim() || null,
      service: document.getElementById('service').value,
      message: document.getElementById('message').value.trim()
    };

    if (!payload.full_name || !payload.email || !payload.service || !payload.message) {
      showStatus('Please fill in all required fields.', 'error');
      return;
    }

    button.disabled = true;
    button.textContent = 'Sending...';

    try {
      const { error } = await client.from('contact_messages').insert(payload);
      if (error) throw error;
      form.reset();
      showStatus('Thank you! Your message has been sent successfully. Nexora will contact you soon.', 'success');
    } catch (error) {
      console.error(error);
      showStatus('We could not send your message. Please try again later.', 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Send Message';
    }
  });
})();
