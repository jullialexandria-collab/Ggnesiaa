/* ========================================
   GGNESIA - SCRIPT.JS
======================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==============================
       ELEMENT
    ============================== */

    const menuButton = document.getElementById("menuButton");
    const closeMenu = document.getElementById("closeMenu");
    const mobileMenu = document.getElementById("mobileMenu");
    const menuOverlay = document.getElementById("menuOverlay");

    const searchButton = document.getElementById("searchButton");
    const searchPanel = document.getElementById("searchPanel");
    const searchInput = document.getElementById("searchInput");
    const searchSubmit = document.getElementById("searchSubmit");


    /* ==============================
       MOBILE MENU
    ============================== */

    function openMenu() {
        mobileMenu.classList.add("active");
        menuOverlay.classList.add("active");

        document.body.style.overflow = "hidden";
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove("active");
        menuOverlay.classList.remove("active");

        document.body.style.overflow = "";
    }


    if (menuButton) {
        menuButton.addEventListener("click", openMenu);
    }

    if (closeMenu) {
        closeMenu.addEventListener("click", closeMobileMenu);
    }

    if (menuOverlay) {
        menuOverlay.addEventListener("click", closeMobileMenu);
    }


    /* ==============================
       TUTUP MENU DENGAN ESC
    ============================== */

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {
            closeMobileMenu();
            closeSearch();
        }

    });


    /* ==============================
       SEARCH
    ============================== */

    function openSearch() {

        searchPanel.classList.toggle("active");

        if (searchPanel.classList.contains("active")) {
            setTimeout(() => {
                searchInput.focus();
            }, 100);
        }

    }

    function closeSearch() {

        if (searchPanel) {
            searchPanel.classList.remove("active");
        }

    }


    if (searchButton) {
        searchButton.addEventListener("click", openSearch);
    }


    /* ==============================
       SEARCH FUNCTION
    ============================== */

    function searchNews() {

        const keyword = searchInput.value.trim();

        if (keyword === "") {
            alert("Silakan masukkan kata yang ingin dicari.");
            searchInput.focus();
            return;
        }

        alert("Mencari berita: " + keyword);

    }


    if (searchSubmit) {
        searchSubmit.addEventListener("click", searchNews);
    }


    /* ==============================
       SEARCH DENGAN ENTER
    ============================== */

    if (searchInput) {

        searchInput.addEventListener("keydown", (event) => {

            if (event.key === "Enter") {
                searchNews();
            }

        });

    }


    /* ==============================
       CLOSE MENU SAAT KLIK LINK
    ============================== */

    const mobileLinks = document.querySelectorAll(
        ".mobile-menu-content a"
    );

    mobileLinks.forEach((link) => {

        link.addEventListener("click", () => {
            closeMobileMenu();
        });

    });


    /* ==============================
       HEADER SHADOW SAAT SCROLL
    ============================== */

    window.addEventListener("scroll", () => {

        const header = document.querySelector(".site-header");

        if (!header) return;

        if (window.scrollY > 10) {
            header.style.boxShadow =
                "0 8px 25px rgba(0, 0, 0, 0.25)";
        } else {
            header.style.boxShadow = "none";
        }

    });


    /* ==============================
       IMAGE ERROR FALLBACK
    ============================== */

    const images = document.querySelectorAll("img");

    images.forEach((image) => {

        image.addEventListener("error", () => {

            image.style.background = "#162033";
            image.style.minHeight = "150px";

        });

    });

});
