export interface ICvTemplate {
    id: string;
    name: string;
    previewImage: string;
    layout: 'left-sidebar' | 'right-sidebar' | 'top-header' | 'split-header' | 'no-sidebar';
    colorScheme: {
        sidebar: string;
        accent: string;
        accentLight: string;
    };
}

export const CV_TEMPLATES: ICvTemplate[] = [
    {
        id: 'modern-teal',
        name: 'Modern Teal',
        previewImage: '/cv-templates/modern-teal.png',
        layout: 'left-sidebar',
        colorScheme: { sidebar: '#2c3e50', accent: '#1abc9c', accentLight: 'rgba(26,188,156,0.15)' },
    },
    {
        id: 'elegant-navy',
        name: 'Elegant Navy',
        previewImage: '/cv-templates/elegant-navy.png',
        layout: 'right-sidebar',
        colorScheme: { sidebar: '#1a237e', accent: '#42a5f5', accentLight: 'rgba(66,165,245,0.15)' },
    },
    {
        id: 'minimal-gray',
        name: 'Minimal Gray',
        previewImage: '/cv-templates/minimal-gray.png',
        layout: 'top-header',
        colorScheme: { sidebar: '#37474f', accent: '#78909c', accentLight: 'rgba(120,144,156,0.15)' },
    },
    {
        id: 'creative-purple',
        name: 'Creative Purple',
        previewImage: '/cv-templates/creative-purple.png',
        layout: 'left-sidebar',
        colorScheme: { sidebar: '#4a148c', accent: '#ce93d8', accentLight: 'rgba(206,147,216,0.15)' },
    },
    {
        id: 'professional-black',
        name: 'Professional Black',
        previewImage: '/cv-templates/professional-black.png',
        layout: 'right-sidebar',
        colorScheme: { sidebar: '#212121', accent: '#ff9800', accentLight: 'rgba(255,152,0,0.15)' },
    },
    {
        id: 'tech-blue',
        name: 'Tech Blue',
        previewImage: '/cv-templates/tech-blue.png',
        layout: 'left-sidebar',
        colorScheme: { sidebar: '#0d47a1', accent: '#29b6f6', accentLight: 'rgba(41,182,246,0.15)' },
    },
    {
        id: 'warm-brown',
        name: 'Warm Brown',
        previewImage: '/cv-templates/warm-brown.png',
        layout: 'left-sidebar',
        colorScheme: { sidebar: '#3e2723', accent: '#a1887f', accentLight: 'rgba(161,136,127,0.15)' },
    },
    {
        id: 'rose-gold',
        name: 'Rose Gold',
        previewImage: '/cv-templates/rose-gold.png',
        layout: 'right-sidebar',
        colorScheme: { sidebar: '#880e4f', accent: '#f48fb1', accentLight: 'rgba(244,143,177,0.15)' },
    },
    {
        id: 'forest-green',
        name: 'Forest Green',
        previewImage: '/cv-templates/forest-green.png',
        layout: 'left-sidebar',
        colorScheme: { sidebar: '#1b5e20', accent: '#66bb6a', accentLight: 'rgba(102,187,106,0.15)' },
    },
    {
        id: 'sunset-orange',
        name: 'Sunset Orange',
        previewImage: '/cv-templates/sunset-orange.png',
        layout: 'top-header',
        colorScheme: { sidebar: '#bf360c', accent: '#ff8a65', accentLight: 'rgba(255,138,101,0.15)' },
    },
    {
        id: 'executive-split',
        name: 'Executive Split',
        previewImage: '/cv-templates/executive-split.png',
        layout: 'split-header',
        colorScheme: { sidebar: '#263238', accent: '#26c6da', accentLight: 'rgba(38,198,218,0.15)' },
    },
    {
        id: 'modern-clean',
        name: 'Modern Clean',
        previewImage: '/cv-templates/modern-clean.png',
        layout: 'no-sidebar',
        colorScheme: { sidebar: '#ffffff', accent: '#e74c3c', accentLight: 'rgba(231,76,60,0.1)' },
    },
];
