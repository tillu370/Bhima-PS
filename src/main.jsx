import { buildWhatsAppUrl } from './lib/whatsappData.js';

// Visitors are sent straight to WhatsApp as soon as the site loads.
window.location.replace(buildWhatsAppUrl("Hi, I visited bhimaprintsolutions.in and would like to know more about your products."));
