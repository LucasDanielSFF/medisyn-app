export function initTheme() {
  const temaSalvo = localStorage.getItem('tema');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  
  // Verificação mais robusta
  const shouldApplyLight = temaSalvo === 'claro' || (!temaSalvo && prefersLight);
  document.body.classList.toggle('modo-claro', shouldApplyLight);
}

export function toggleModoClaro() {
  const modoClaroAtivo = document.body.classList.toggle('modo-claro');
  localStorage.setItem('tema', modoClaroAtivo ? 'claro' : 'escuro');
  
  // Forçar redesenho para alguns navegadores
  document.body.style.animation = 'none';
  setTimeout(() => document.body.style.animation = '', 10);
}