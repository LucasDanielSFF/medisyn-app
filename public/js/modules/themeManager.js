// ==================================================
// ►►► Gerenciamento de Tema e Menu
// ==================================================

export function toggleModoClaro() { 
  document.body.classList.toggle('modo-claro');
  localStorage.setItem('tema', document.body.classList.contains('modo-claro') ? 'claro' : 'escuro');
}

export function openNav() {
  document.getElementById('sidenav').classList.add('open');
}

export function closeNav() {
  document.getElementById('sidenav').classList.remove('open');
}