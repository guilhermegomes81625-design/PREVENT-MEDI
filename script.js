const privacy = document.querySelector('#privacy');
document.querySelector('#open-privacy').addEventListener('click', () => privacy.showModal());
document.querySelector('#close-privacy').addEventListener('click', () => privacy.close());
privacy.addEventListener('click', event => { if (event.target === privacy) { const r = privacy.getBoundingClientRect(); if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) privacy.close(); } });
document.querySelector('#year').textContent = new Date().getFullYear();
