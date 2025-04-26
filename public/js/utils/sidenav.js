// sidenav.js
import { toggleModoClaro } from './themeManager.js';

export function initSidenav() {
  // Event listeners
  document.querySelector('.overlay')?.addEventListener('click', closeNav);
  document.getElementById('sidenav')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('closebtn')) closeNav();
  });
}

export function toggleNav() {
  const sidenav = document.getElementById('sidenav');
  sidenav?.classList.toggle('open');
  document.querySelector('.hamburger')?.classList.toggle('is-active');
}

export function openNav() {
  document.getElementById('sidenav')?.classList.add('open');
  document.querySelector('.hamburger')?.classList.add('is-active');
}

export function closeNav() {
  document.getElementById('sidenav')?.classList.remove('open');
  document.querySelector('.hamburger')?.classList.remove('is-active');
}

// Export para uso em HTML se necessário
window.toggleModoClaro = toggleModoClaro;
window.toggleNav = toggleNav;