'use strict';
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


window.VC_DEFAULTS = { projects: DEFAULT_PROJECTS, services: DEFAULT_SERVICES, contact: DEFAULT_CONTACT };
