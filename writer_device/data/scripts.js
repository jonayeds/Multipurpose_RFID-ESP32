/**
 * UniCard RFID Ecosystem - Global Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    // ── Mobile Navigation Toggle ──
    const menuToggle = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Simple animation for the hamburger bars
            const bars = menuToggle.querySelectorAll('span');
            if (navLinks.classList.contains('active')) {
                bars[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                const bars = menuToggle.querySelectorAll('span');
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });
    }

    // ── Close mobile menu when a link is clicked ──
    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const bars = menuToggle ? menuToggle.querySelectorAll('span') : [];
                bars.forEach(bar => bar.style.transform = 'none');
                if (bars[1]) bars[1].style.opacity = '1';
            });
        });
    }
});
