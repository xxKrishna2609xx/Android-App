export const config = {
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  contact: {
    email: import.meta.env.VITE_CONTACT_EMAIL || "support@rightadsdigital.com",
    phone: import.meta.env.VITE_CONTACT_PHONE || "+91 98765 00000",
    address: import.meta.env.VITE_CONTACT_ADDRESS || "14, Business Hub, Sector 21, Mumbai, Maharashtra 400001",
  },
  socials: {
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK || '#',
    instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM || '#',
    linkedin: import.meta.env.VITE_SOCIAL_LINKEDIN || '#',
    twitter: import.meta.env.VITE_SOCIAL_TWITTER || '#',
  },
  policies: {
    privacy: import.meta.env.VITE_POLICY_PRIVACY || '#',
    terms: import.meta.env.VITE_POLICY_TERMS || '#',
  },
  navTabs: [
    { label: 'Home', to: '/', match: (p) => p === '/' },
    { label: 'Categories', to: '/categories', match: (p) => p === '/categories' || p.startsWith('/category') },
    
    { label: 'Services', to: '/search', match: () => false },
  ],
  defaultCategories: [
    'All Categories', 'Food & Dining', 'Health & Wellness', 'Education',
    'Real Estate', 'Technology', 'Retail', 'Travel', 'Beauty & Spa', 'Auto Services'
  ],
  defaultSuggestions: [
    'Web Development', 'SEO Services', 'Graphic Design',
    'Social Media Marketing', 'Mobile App Development', 'Branding'
  ]
};
