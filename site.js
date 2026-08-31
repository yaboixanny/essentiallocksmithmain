(() => {
    const callBar = document.querySelector(".mobile-call-bar");

    if (!callBar) {
        return;
    }

    const updateCallBar = () => {
        const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
        const hasScrolledPastThreshold = scrollableDistance > 0 && window.scrollY >= scrollableDistance * 0.07;

        callBar.classList.toggle("is-visible", hasScrolledPastThreshold);
        callBar.setAttribute("aria-hidden", String(!hasScrolledPastThreshold));
    };

    window.addEventListener("scroll", updateCallBar, { passive: true });
    window.addEventListener("resize", updateCallBar);
    updateCallBar();

    const menuToggle = document.querySelector(".mobile-menu-toggle");
    const mobileMenu = document.querySelector(".mobile-nav");

    if (!menuToggle || !mobileMenu) {
        return;
    }

    const closeMenu = () => {
        menuToggle.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("is-open");
    };

    menuToggle.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    window.addEventListener("resize", () => {
        if (window.innerWidth > 800) {
            closeMenu();
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });
})();
