/* ══════════════════════════════════════════════════════════
   VINAYAGA CONSTRUCTION — ADMIN DASHBOARD JAVASCRIPT
   ══════════════════════════════════════════════════════════ */

'use strict';

// Toast helper
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Global App State
let projects = [];
let services = [];
let contact = {};
let currentEditingProjectId = null;
let currentEditingServiceId = null;
let pendingImage = null;
let busy = false;

// Initialize Admin. No browser-only password or fake session flag.
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('app').hidden = true;
  initTabs();
  initModals();
  initForms();
  await initAuth();
});

async function loadData() {
  const data = await VCBackend.load();
  projects = data.projects;
  services = data.services;
  contact = data.contact;
  renderOverview(); renderProjects(); renderServices(); renderContactForm();
}

function setLoggedOut(message = '') {
  document.getElementById('app').hidden = true;
  document.getElementById('login-screen').style.display = 'flex';
  const error = document.getElementById('login-error');
  error.textContent = message;
  error.style.display = message ? 'block' : 'none';
}

async function openDashboard() {
  await VCBackend.requireAdmin();
  await loadData();
  document.getElementById('login-error').style.display = 'none';
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').hidden = false;
}

async function initAuth() {
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    button.disabled = true;
    try {
      await VCBackend.signIn(document.getElementById('login-username').value.trim(),
        document.getElementById('login-password').value);
      await openDashboard();
      document.getElementById('login-password').value = '';
      showToast('Signed in. Changes now save to Supabase.');
    } catch (error) { setLoggedOut(error.message); }
    finally { button.disabled = false; }
  });
  document.getElementById('btn-logout').addEventListener('click', async () => {
    try { await VCBackend.signOut(); setLoggedOut(); }
    catch (error) { showToast(error.message, 6000); }
  });
  try {
    const session = await VCBackend.session();
    if (session) await openDashboard();
  } catch (error) { setLoggedOut(error.message); }
  if (VCBackend.configured()) {
    VCBackend.client().auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setLoggedOut('Session ended. Sign in again.');
    });
  }
}

// Only show success after the server confirms the write. Failed saves keep the form open.
async function runSave(action) {
  if (busy) return;
  busy = true;
  document.querySelectorAll('#app button').forEach(b => b.disabled = true);
  try { await action(); }
  catch (error) { showToast('Not saved: ' + error.message, 8000); }
  finally {
    busy = false;
    document.querySelectorAll('#app button').forEach(b => b.disabled = false);
  }
}

// Navigation Tabs
function initTabs() {
  const navItems = document.querySelectorAll('.nav-item');
  const panes = document.querySelectorAll('.tab-pane');
  const topbarTitle = document.getElementById('topbar-title');

  const titles = {
    overview: 'Overview Dashboard',
    projects: 'Manage Architectural Projects',
    services: 'Manage Construction Services',
    contact: 'Company & Contact Details'
  };

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.dataset.tab;

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      panes.forEach(pane => {
        pane.classList.toggle('active', pane.id === `tab-${tabId}`);
      });

      if (topbarTitle && titles[tabId]) {
        topbarTitle.textContent = titles[tabId];
      }

      // Close mobile sidebar if open
      document.querySelector('.sidebar').classList.remove('mobile-open');
    });
  });

  // Mobile sidebar toggle
  const mobileToggle = document.getElementById('sidebar-mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('mobile-open');
    });
  }
}

// Render Overview tab stats
function renderOverview() {
  document.getElementById('stat-total-projects').textContent = projects.length;
  document.getElementById('stat-completed-projects').textContent = projects.filter(p => p.status === 'COMPLETED').length;
  document.getElementById('stat-ongoing-projects').textContent = projects.filter(p => p.status === 'ONGOING').length;
  document.getElementById('stat-total-services').textContent = services.length;
}

// ══════════════════════════════════════════════════════════
// PROJECTS MANAGEMENT
// ══════════════════════════════════════════════════════════

function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (projects.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--surface); border: 1px dashed var(--border); border-radius: 8px;">
        <p style="color: var(--grey-light); margin-bottom: 1rem;">No projects found.</p>
        <button class="btn-primary" onclick="openProjectModal()">+ Add Your First Project</button>
      </div>
    `;
    return;
  }

  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-admin-card';

    // Status class
    const statusClass = project.status === 'COMPLETED' ? 'badge-completed' : (project.status === 'ONGOING' ? 'badge-ongoing' : 'badge-upcoming');

    // Safe image display
    let imgSrc = project.image || 'image/ezgif-frame-050.jpg';
    if (!imgSrc.startsWith('data:') && !imgSrc.startsWith('http')) {
      if (!imgSrc.startsWith('../')) {
        imgSrc = '../' + imgSrc;
      }
    }

    card.innerHTML = `
      <div class="project-thumb-wrap">
        <img src="${escapeHtml(VCBackend.safeImage(imgSrc))}" alt="${escapeHtml(project.title)}" class="project-thumb" onerror="this.src='../image/ezgif-frame-050.jpg'" />
        <span class="project-status-badge ${statusClass}">${escapeHtml(project.status)}</span>
      </div>
      <div class="project-card-body">
        <h3 class="project-card-title">${escapeHtml(project.title)}</h3>
        <div class="project-meta-row">
          <span>📍 ${escapeHtml(project.location)}</span>
          <span>📐 ${escapeHtml(project.category)}</span>
          ${project.completionDate ? `<span>📅 ${escapeHtml(project.completionDate)}</span>` : ''}
        </div>
        <p class="project-card-desc">${escapeHtml(project.description || 'No description provided.')}</p>
        <div class="project-card-actions">
          <button class="btn-icon-action btn-edit" onclick="editProject('${project.id}')">
            ✏️ Edit
          </button>
          <button class="btn-icon-action btn-delete" onclick="deleteProject('${project.id}')">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  renderOverview();
}

// Open project modal for create
window.openProjectModal = function() {
  currentEditingProjectId = null;
  pendingImage = null;
  document.getElementById('project-modal-title').textContent = 'Add New Architectural Project';
  document.getElementById('project-form').reset();
  document.getElementById('project-image-preview').style.display = 'none';
  document.getElementById('project-image-url').value = 'image/ezgif-frame-050.jpg';
  updateProjectImagePreview('../image/ezgif-frame-050.jpg');
  openModal('modal-project');
};

// Edit existing project
window.editProject = function(id) {
  const project = projects.find(p => p.id === id);
  if (!project) return;

  currentEditingProjectId = id;
  pendingImage = null;
  document.getElementById('project-modal-title').textContent = 'Edit Project: ' + project.title;

  document.getElementById('proj-title').value = project.title || '';
  document.getElementById('proj-location').value = project.location || '';
  document.getElementById('proj-category').value = project.category || '';
  document.getElementById('proj-status').value = project.status || 'COMPLETED';
  document.getElementById('proj-date').value = project.completionDate || '';
  document.getElementById('proj-desc').value = project.description || '';
  document.getElementById('project-image-url').value = project.image || '';

  let displayImg = project.image || 'image/ezgif-frame-050.jpg';
  if (!displayImg.startsWith('data:') && !displayImg.startsWith('http')) {
    if (!displayImg.startsWith('../')) {
      displayImg = '../' + displayImg;
    }
  }
  updateProjectImagePreview(displayImg);

  openModal('modal-project');
};

// Delete project
window.deleteProject = async function(id) {
  const project = projects.find(p => p.id === id);
  if (!project || !confirm(`Delete project "${project.title}" from the public site?`)) return;
  await runSave(async () => {
    await VCBackend.saveSection('projects', projects.filter(p => p.id !== id));
    await loadData();
    showToast('Project deleted from Supabase.');
  });
};

// Update preview image
function updateProjectImagePreview(src) {
  const preview = document.getElementById('project-image-preview');
  preview.src = VCBackend.safeImage(src);
  preview.style.display = 'block';
}

// ══════════════════════════════════════════════════════════
// SERVICES MANAGEMENT
// ══════════════════════════════════════════════════════════

function renderServices() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (services.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--surface); border: 1px dashed var(--border); border-radius: 8px;">
        <p style="color: var(--grey-light); margin-bottom: 1rem;">No services found.</p>
        <button class="btn-primary" onclick="openServiceModal()">+ Add Your First Service</button>
      </div>
    `;
    return;
  }

  services.forEach(service => {
    const card = document.createElement('div');
    card.className = 'service-admin-card';

    card.innerHTML = `
      <div class="service-card-top">
        <span class="service-number">${escapeHtml(service.num)}</span>
        <span class="service-icon-display">${escapeHtml(service.icon)}</span>
      </div>
      <h3>${escapeHtml(service.title)}</h3>
      <p>${escapeHtml(service.desc)}</p>
      <div class="project-card-actions">
        <button class="btn-icon-action btn-edit" onclick="editService('${service.id}')">
          ✏️ Edit
        </button>
        <button class="btn-icon-action btn-delete" onclick="deleteService('${service.id}')">
          🗑️ Delete
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  renderOverview();
}

// Open Service modal
window.openServiceModal = function() {
  currentEditingServiceId = null;
  document.getElementById('service-modal-title').textContent = 'Add New Construction Service';
  document.getElementById('service-form').reset();
  const nextNum = String(services.length + 1).padStart(2, '0');
  document.getElementById('serv-num').value = nextNum;
  document.getElementById('serv-icon').value = '🏗️';
  openModal('modal-service');
};

// Edit Service
window.editService = function(id) {
  const service = services.find(s => s.id === id);
  if (!service) return;

  currentEditingServiceId = id;
  document.getElementById('service-modal-title').textContent = 'Edit Service: ' + service.title;
  document.getElementById('serv-num').value = service.num || '';
  document.getElementById('serv-icon').value = service.icon || '🏗️';
  document.getElementById('serv-title').value = service.title || '';
  document.getElementById('serv-desc').value = service.desc || '';

  openModal('modal-service');
};

// Delete Service
window.deleteService = async function(id) {
  const service = services.find(s => s.id === id);
  if (!service || !confirm(`Delete service "${service.title}"?`)) return;
  await runSave(async () => {
    await VCBackend.saveSection('services', services.filter(s => s.id !== id));
    await loadData();
    showToast('Service deleted from Supabase.');
  });
};

// ══════════════════════════════════════════════════════════
// CONTACT SETTINGS MANAGEMENT
// ══════════════════════════════════════════════════════════

function renderContactForm() {
  document.getElementById('contact-phone').value = contact.phone || '';
  document.getElementById('contact-email').value = contact.email || '';
  document.getElementById('contact-location').value = contact.location || '';
  document.getElementById('contact-whatsapp').value = contact.whatsapp || '';
  document.getElementById('contact-tagline').value = contact.tagline || '';
  document.getElementById('contact-brandmsg').value = contact.brandMessage || '';
}

// ══════════════════════════════════════════════════════════
// MODAL CONTROLS & FORMS
// ══════════════════════════════════════════════════════════

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    const body = modal.querySelector('.modal-body');
    if (body) body.scrollTop = 0;
  }
}

function closeModal(id) {
  const modal = typeof id === 'string' ? document.getElementById(id) : id;
  if (modal) {
    modal.classList.remove('open');
    if (!document.querySelector('.modal-overlay.open')) {
      document.body.style.overflow = '';
    }
  }
}

function initModals() {
  // Close buttons
  document.querySelectorAll('.btn-close-modal, .btn-cancel-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) closeModal(modal);
    });
  });

  // Click outside modal container to close
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // Keyboard Escape listener
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModalEl = document.querySelector('.modal-overlay.open');
      if (openModalEl) closeModal(openModalEl);
    }
  });
}

function initForms() {
  document.getElementById('project-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await runSave(async () => {
      const image = pendingImage ? await VCBackend.uploadImage(pendingImage) :
        document.getElementById('project-image-url').value.trim();
      const project = {
        id: currentEditingProjectId || 'proj_' + crypto.randomUUID(),
        title: document.getElementById('proj-title').value.trim(),
        location: document.getElementById('proj-location').value.trim(),
        category: document.getElementById('proj-category').value.trim() || 'Residential Villa',
        status: document.getElementById('proj-status').value,
        completionDate: document.getElementById('proj-date').value,
        description: document.getElementById('proj-desc').value.trim(),
        image: VCBackend.safeImage(image)
      };
      if (!project.title || !project.location) throw new Error('Title and location are required.');
      const next = currentEditingProjectId ? projects.map(p => p.id === currentEditingProjectId ? project : p) : [project, ...projects];
      await VCBackend.saveSection('projects', next);
      pendingImage = null;
      await loadData(); closeModal('modal-project');
      showToast('Project saved to Supabase. Refresh the public site to see it.');
    });
  });
  document.getElementById('proj-file-upload').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      showToast('Choose a JPG, PNG or WebP image under 10 MB.', 6000); event.target.value = ''; return;
    }
    const button = document.querySelector('#project-form button[type="submit"]');
    button.disabled = true;
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read image.'));
        reader.readAsDataURL(file);
      });
      pendingImage = await new Promise((resolve, reject) => compressImage(dataUrl, 1200, 0.8, resolve, reject));
      updateProjectImagePreview(pendingImage);
      showToast('Photo ready. Click Save Project to upload it.');
    } catch (error) { showToast(error.message, 6000); }
    finally { button.disabled = false; }
  });
  document.querySelectorAll('.preset-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      pendingImage = null;
      document.getElementById('project-image-url').value = thumb.dataset.path;
      updateProjectImagePreview('../' + thumb.dataset.path);
      document.querySelectorAll('.preset-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
  document.getElementById('service-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await runSave(async () => {
      const service = {
        id: currentEditingServiceId || 'serv_' + crypto.randomUUID(),
        num: document.getElementById('serv-num').value.trim() || String(services.length + 1).padStart(2, '0'),
        icon: document.getElementById('serv-icon').value.trim() || '🏗️',
        title: document.getElementById('serv-title').value.trim(),
        desc: document.getElementById('serv-desc').value.trim()
      };
      if (!service.title || !service.desc) throw new Error('Title and description are required.');
      const next = currentEditingServiceId ? services.map(s => s.id === currentEditingServiceId ? service : s) : [...services, service];
      await VCBackend.saveSection('services', next);
      await loadData(); closeModal('modal-service');
      showToast('Service saved to Supabase.');
    });
  });
  document.getElementById('contact-settings-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await runSave(async () => {
      const next = {
        phone: document.getElementById('contact-phone').value.trim(),
        email: document.getElementById('contact-email').value.trim(),
        location: document.getElementById('contact-location').value.trim(),
        whatsapp: document.getElementById('contact-whatsapp').value.trim(),
        tagline: document.getElementById('contact-tagline').value.trim(),
        brandMessage: document.getElementById('contact-brandmsg').value.trim()
      };
      await VCBackend.saveSection('contact', next);
      await loadData(); showToast('Company details saved to Supabase.');
    });
  });
  document.getElementById('btn-reset-defaults').addEventListener('click', async () => {
    if (!confirm('Reset the PUBLIC site projects, services and contact details to the original defaults? This replaces your custom content.')) return;
    await runSave(async () => {
      await VCBackend.reset(); await loadData();
      showToast('Public content reset to defaults.');
    });
  });
}

// Utility: Image compressor
function compressImage(base64Str, maxWidth, quality, callback, onError) {
  const img = new Image();
  img.onerror = () => onError(new Error('Could not open this image.'));
  img.src = base64Str;
  img.onload = () => {
    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    const compressed = canvas.toDataURL('image/jpeg', quality);
    callback(compressed);
  };
}

// Helper: Escape HTML string
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
