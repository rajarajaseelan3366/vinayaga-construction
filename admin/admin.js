/* ══════════════════════════════════════════════════════════
   VINAYAGA CONSTRUCTION — ADMIN DASHBOARD JAVASCRIPT
   ══════════════════════════════════════════════════════════ */

'use strict';

// Default Data Sets
const DEFAULT_PROJECTS = [
  {
    id: 'proj_1',
    title: 'Luxury Villa',
    location: 'Karaikudi, Tamil Nadu',
    category: 'Residential • 4500 sq.ft',
    status: 'COMPLETED',
    completionDate: '2024-03',
    image: 'image/ezgif-frame-050.jpg',
    description: 'Modern two-story luxury residence featuring expansive glass facades, private infinity pool, and integrated landscaped terraces.'
  },
  {
    id: 'proj_2',
    title: 'Modern Residence',
    location: 'Karaikudi, Tamil Nadu',
    category: 'Residential • 3200 sq.ft',
    status: 'COMPLETED',
    completionDate: '2024-01',
    image: 'image/ezgif-frame-049.jpg',
    description: 'Contemporary family home with customized interior aesthetics, high-performance acoustic glass, and ambient evening LED illumination.'
  },
  {
    id: 'proj_3',
    title: 'Premium Estate',
    location: 'Karaikudi, Tamil Nadu',
    category: 'Residential • 5800 sq.ft',
    status: 'COMPLETED',
    completionDate: '2023-11',
    image: 'image/ezgif-frame-048.jpg',
    description: 'Expansive luxury estate built with double-height living ceilings, organic stone cladding, and wide driveway parking.'
  },
  {
    id: 'proj_4',
    title: 'Contemporary Home',
    location: 'Karaikudi, Tamil Nadu',
    category: 'Residential • 2800 sq.ft',
    status: 'ONGOING',
    completionDate: '2025-06',
    image: 'image/ezgif-frame-047.jpg',
    description: 'Minimalist architecture with optimal natural cross-ventilation, energy-efficient planning, and tailored spatial layout.'
  },
  {
    id: 'proj_5',
    title: 'Executive Bungalow',
    location: 'Karaikudi, Tamil Nadu',
    category: 'Residential • 3900 sq.ft',
    status: 'COMPLETED',
    completionDate: '2023-08',
    image: 'image/ezgif-frame-046.jpg',
    description: 'High-end bespoke bungalow designed for executive lifestyles, premium entertainment spaces, and private manicured lawn.'
  },
  {
    id: 'proj_6',
    title: 'Designer Villa',
    location: 'Karaikudi, Tamil Nadu',
    category: 'Residential • 4100 sq.ft',
    status: 'ONGOING',
    completionDate: '2025-08',
    image: 'image/ezgif-frame-045.jpg',
    description: 'Architectural masterpiece incorporating cantilevered balconies, smart automation, and bespoke interior wood accents.'
  }
];

const DEFAULT_SERVICES = [
  {
    id: 'serv_1',
    num: '01',
    icon: '🏛️',
    title: 'Architectural Design',
    desc: 'Bespoke architectural concepts crafted to reflect your personality and lifestyle vision.'
  },
  {
    id: 'serv_2',
    num: '02',
    icon: '📐',
    title: 'Building Design & Planning',
    desc: 'Comprehensive building plans with regulatory compliance and engineering precision.'
  },
  {
    id: 'serv_3',
    num: '03',
    icon: '🏗️',
    title: 'Structural Construction',
    desc: 'Robust structural frameworks using premium materials and advanced construction techniques.'
  },
  {
    id: 'serv_4',
    num: '04',
    icon: '🔨',
    title: 'Renovation',
    desc: 'Transform existing spaces with thoughtful renovation that breathes new life into your property.'
  },
  {
    id: 'serv_5',
    num: '05',
    icon: '✨',
    title: 'Interior & Finishing',
    desc: 'Luxury interior finishing with premium materials, textures and craftsmanship throughout.'
  },
  {
    id: 'serv_6',
    num: '06',
    icon: '⚡',
    title: 'Electrical & Plumbing / MEP',
    desc: 'Complete MEP systems engineered for efficiency, safety and long-term reliability.'
  },
  {
    id: 'serv_7',
    num: '07',
    icon: '📊',
    title: 'Project Management',
    desc: 'End-to-end project management ensuring timely delivery within budget and quality standards.'
  },
  {
    id: 'serv_8',
    num: '08',
    icon: '🖥️',
    title: '2D & 3D Planning',
    desc: 'Detailed 2D floor plans and photorealistic 3D visualisations before construction begins.'
  }
];

const DEFAULT_CONTACT = {
  phone: '+91 9003837874',
  email: 'yugaseelanv2000@gmail.com',
  location: 'Karaikudi, Tamil Nadu',
  whatsapp: '919003837874',
  tagline: 'FROM VISION TO REALITY.',
  brandMessage: 'Premium Construction • Thoughtful Design • Trusted Execution'
};

// Online API helpers (shared hosting / PHP)
const API_URL = '../api.php';

async function apiRequest(action, options = {}) {
  const response = await fetch(`${API_URL}?action=${encodeURIComponent(action)}`, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : {'Content-Type': 'application/json'}),
      ...(options.headers || {})
    }
  });
  const result = await response.json().catch(() => ({ok:false, message:'Invalid server response'}));
  if (!response.ok || !result.ok) throw new Error(result.message || 'Request failed');
  return result;
}

async function getRemoteData() {
  const result = await apiRequest('bootstrap', { method: 'GET' });
  return result.data;
}

async function saveStoredProjects(value) {
  const result = await apiRequest('save_projects', { method: 'POST', body: JSON.stringify({projects: value}) });
  projects = result.data;
  return result.data;
}
async function saveStoredServices(value) {
  const result = await apiRequest('save_services', { method: 'POST', body: JSON.stringify({services: value}) });
  services = result.data;
  return result.data;
}
async function saveStoredContact(value) {
  const result = await apiRequest('save_contact', { method: 'POST', body: JSON.stringify({contact: value}) });
  contact = result.data;
  return result.data;
}

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

// Initialize Admin
document.addEventListener('DOMContentLoaded', async () => {
  const loggedIn = await initAuth();
  if (!loggedIn) return;
  await loadData();
  initTabs();
  initModals();
  initForms();
  renderOverview();
  renderProjects();
  renderServices();
  renderContactForm();
});

// Authentication handling
async function initAuth() {
  const loginScreen = document.getElementById('login-screen');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('btn-logout');

  try {
    const result = await apiRequest('session', {method:'GET'});
    if (result.data && result.data.loggedIn) {
      loginScreen.style.display = 'none';
    } else {
      loginScreen.style.display = 'flex';
    }
  } catch (e) {
    loginScreen.style.display = 'flex';
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      try {
        await apiRequest('login', {method:'POST', body: JSON.stringify({username, password})});
        loginError.style.display = 'none';
        loginScreen.style.display = 'none';
        showToast('Welcome to Vinayaga Construction Admin');
        await loadData();
        renderOverview(); renderProjects(); renderServices(); renderContactForm();
      } catch (err) {
        loginError.textContent = err.message || 'Invalid username or password.';
        loginError.style.display = 'block';
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to log out of the admin panel?')) {
        try { await apiRequest('logout', {method:'POST'}); } catch (_) {}
        loginScreen.style.display = 'flex';
        showToast('Logged out successfully');
      }
    });
  }

  return loginScreen.style.display === 'none';
}

// Load Data
async function loadData() {
  const data = await getRemoteData();
  projects = Array.isArray(data.projects) && data.projects.length ? data.projects : DEFAULT_PROJECTS;
  services = Array.isArray(data.services) && data.services.length ? data.services : DEFAULT_SERVICES;
  contact = data.contact && Object.keys(data.contact).length ? data.contact : DEFAULT_CONTACT;
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
        <img src="${imgSrc}" alt="${escapeHtml(project.title)}" class="project-thumb" onerror="this.src='../image/ezgif-frame-050.jpg'" />
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
  if (!project) return;

  if (confirm(`Are you sure you want to delete the project "${project.title}"? This change will reflect on the public website.`)) {
    projects = projects.filter(p => p.id !== id);
    try { await saveStoredProjects(projects); } catch (e) { showToast(e.message || 'Could not save project.'); return; }
    renderProjects();
    showToast(`Project "${project.title}" deleted.`);
  }
};

// Update preview image
function updateProjectImagePreview(src) {
  const preview = document.getElementById('project-image-preview');
  preview.src = src;
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
  if (!service) return;

  if (confirm(`Are you sure you want to delete "${service.title}"?`)) {
    services = services.filter(s => s.id !== id);
    try { await saveStoredServices(services); } catch (e) { showToast(e.message || 'Could not save service.'); return; }
    renderServices();
    showToast(`Service "${service.title}" deleted.`);
  }
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
  // Project Form Submit
  const projForm = document.getElementById('project-form');
  if (projForm) {
    projForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('proj-title').value.trim();
      const location = document.getElementById('proj-location').value.trim();
      const category = document.getElementById('proj-category').value.trim();
      const status = document.getElementById('proj-status').value;
      const completionDate = document.getElementById('proj-date').value;
      const description = document.getElementById('proj-desc').value.trim();
      const image = document.getElementById('project-image-url').value.trim() || 'image/ezgif-frame-050.jpg';
      if (!title || !location) { alert('Please fill out the Title and Location.'); return; }

      if (currentEditingProjectId) {
        const index = projects.findIndex(p => p.id === currentEditingProjectId);
        if (index !== -1) projects[index] = {...projects[index], title, location, category, status, completionDate, description, image};
      } else {
        projects.unshift({id:'proj_' + Date.now(), title, location, category: category || 'Residential Villa', status, completionDate, description, image});
      }
      try {
        await saveStoredProjects(projects);
        renderProjects(); closeModal('modal-project');
        showToast(`Project "${title}" saved successfully.`);
      } catch (err) { showToast(err.message || 'Could not save project.'); }
    });
  }

  // Image File Upload handling - upload to server storage
  const fileInput = document.getElementById('proj-file-upload');
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        showToast('Uploading image...');
        const form = new FormData();
        form.append('image', file);
        const result = await apiRequest('upload_image', {method:'POST', body: form});
        const path = result.data.path;
        document.getElementById('project-image-url').value = path;
        updateProjectImagePreview('../' + path);
        showToast('Image uploaded successfully!');
      } catch (err) { showToast(err.message || 'Image upload failed.'); }
    });
  }

  // Preset Image Thumbnails Click
  document.querySelectorAll('.preset-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const path = thumb.dataset.path;
      document.getElementById('project-image-url').value = path;
      updateProjectImagePreview('../' + path);
      document.querySelectorAll('.preset-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  // Service Form Submit
  const servForm = document.getElementById('service-form');
  if (servForm) {
    servForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const num = document.getElementById('serv-num').value.trim();
      const icon = document.getElementById('serv-icon').value.trim() || '🏛️';
      const title = document.getElementById('serv-title').value.trim();
      const desc = document.getElementById('serv-desc').value.trim();
      if (!title || !desc) { alert('Please provide a title and description.'); return; }
      if (currentEditingServiceId) {
        const index = services.findIndex(s => s.id === currentEditingServiceId);
        if (index !== -1) services[index] = {...services[index], num, icon, title, desc};
      } else {
        services.push({id:'serv_' + Date.now(), num:num || String(services.length+1).padStart(2,'0'), icon, title, desc});
      }
      try { await saveStoredServices(services); renderServices(); closeModal('modal-service'); showToast(`Service "${title}" saved.`); }
      catch (err) { showToast(err.message || 'Could not save service.'); }
    });
  }

  // Contact Form Submit
  const contactForm = document.getElementById('contact-settings-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      contact = {
        phone: document.getElementById('contact-phone').value.trim(),
        email: document.getElementById('contact-email').value.trim(),
        location: document.getElementById('contact-location').value.trim(),
        whatsapp: document.getElementById('contact-whatsapp').value.trim(),
        tagline: document.getElementById('contact-tagline').value.trim(),
        brandMessage: document.getElementById('contact-brandmsg').value.trim()
      };
      try { await saveStoredContact(contact); showToast('Company contact details saved! Public site updated.'); }
      catch (err) { showToast(err.message || 'Could not save contact details.'); }
    });
  }

  // Reset to Defaults Button
  const resetBtn = document.getElementById('btn-reset-defaults');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to reset all Projects, Services, and Contact info to initial default values?')) {
        try {
          const result = await apiRequest('reset', {method:'POST'});
          projects = result.data.projects; services = result.data.services; contact = result.data.contact;
          renderOverview(); renderProjects(); renderServices(); renderContactForm();
          showToast('All data has been reset to defaults.');
        } catch (err) { showToast(err.message || 'Could not reset data.'); }
      }
    });
  }
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
