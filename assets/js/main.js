// ============================================
// VERDES POR ACCIÓN — main.js
// ============================================

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }
});

// Mobile menu toggle
function toggleMenu() {
  const links = document.querySelector('.nav-links');
  links.classList.toggle('open');
}

// Close menu on link click (mobile)
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('open');
  });
});

// Tab switching (login form)
function setTab(type, el) {
  // Remove active from all tabs
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  el.classList.add('active');
  const content = document.getElementById('tab-' + type);
  if (content) content.classList.add('active');
}

// Login form handler
function handleLogin(event) {
  event.preventDefault();
  const activeTab = document.querySelector('.tab.active').textContent.trim();
  const isCiudadano = activeTab.includes('Natural') || activeTab.includes('ciudadano');

  showToast(
    isCiudadano
      ? '✅ Bienvenido ciudadano — redirigiendo a tu panel...'
      : '✅ Bienvenido convenio — verificando credenciales...',
    'success'
  );
}

// Toast notification
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 32px; right: 32px; z-index: 9999;
    background: ${type === 'success' ? '#1a3d2b' : '#c0392b'};
    color: #fff; padding: 14px 24px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 0.93rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    animation: slideUp 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Contact form handler
function handleContact(event) {
  event.preventDefault();
  showToast('📩 Mensaje enviado — te responderemos pronto!', 'success');
  event.target.reset();
}

// Entrance animations with IntersectionObserver
const animateOnScroll = () => {
  const elements = document.querySelectorAll('.info-card, .reg-card, .visual-card, .stat');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
};

document.addEventListener('DOMContentLoaded', animateOnScroll);

// Set active nav link based on current page
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.nav-links a');
  const path = window.location.pathname;
  links.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') && path.endsWith(link.getAttribute('href').split('/').pop())) {
      link.classList.add('active');
    }
  });
});
