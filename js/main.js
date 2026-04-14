document.querySelectorAll('.nav-item').forEach(item => {
    let closeTimer = null;
    const menu = item.querySelector('.mega-menu');
    if (!menu) return;

    item.addEventListener('mouseenter', () => {
        clearTimeout(closeTimer);
        menu.style.opacity = '1';
        menu.style.visibility = 'visible';
        menu.style.transform = 'translateY(0)';
        menu.style.pointerEvents = 'all';
    });

    item.addEventListener('mouseleave', () => {
        closeTimer = setTimeout(() => {
            menu.style.opacity = '0';
            menu.style.visibility = 'hidden';
            menu.style.transform = 'translateY(-8px)';
            menu.style.pointerEvents = 'none';
        }, 150);
    });
});