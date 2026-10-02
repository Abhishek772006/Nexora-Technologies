(function(){
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a[data-page]').forEach(a=>{
    const page=a.getAttribute('data-page');
    if(page===current || (current==='' && page==='index.html')) a.classList.add('active');
  });
  const toggle=document.querySelector('.menu-toggle');
  const menu=document.querySelector('.site-nav');
  if(toggle && menu){
    toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open'); toggle.setAttribute('aria-expanded',String(open));});
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));
  }
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
})();
