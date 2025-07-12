// Mobile menu toggle functionality
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenu.classList.add('hidden'); // Ensure menu is hidden by default

mobileMenuButton.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
  const expanded = mobileMenuButton.getAttribute('aria-expanded') === 'true' || false;
  mobileMenuButton.setAttribute('aria-expanded', !expanded);

  // Toggle SVG icons
  const menuIcon = mobileMenuButton.querySelector('svg:first-of-type');
  const closeIcon = mobileMenuButton.querySelector('svg:last-of-type');

  menuIcon.classList.toggle('hidden');
  closeIcon.classList.toggle('hidden');
});

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    const menuIcon = mobileMenuButton.querySelector('svg:first-of-type');
    const closeIcon = mobileMenuButton.querySelector('svg:last-of-type');
    menuIcon.classList.remove('hidden');
    closeIcon.classList.add('hidden');
  });
});