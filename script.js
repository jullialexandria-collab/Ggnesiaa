/* =====================================================
   GGNESIA NEWS
   SCRIPT.JS
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =================================================
       DATA
       ================================================= */

    let articles = [];


    /* =================================================
       ELEMENTS
       ================================================= */

    const menuButton = document.getElementById("menuButton");
    const closeMenu = document.getElementById("closeMenu");
    const sideMenu = document.getElementById("sideMenu");
    const menuOverlay = document.getElementById("menuOverlay");

    const searchButton = document.getElementById("searchButton");
    const searchBox = document.getElementById("searchBox");
    const searchInput = document.getElementById("searchInput");
    const searchSubmit = document.getElementById("searchSubmit");

    const highlightImage =
        document.getElementById("highlightImage");

    const highlightCategory =
        document.getElementById("highlightCategory");

    const highlightTitle =
        document.getElementById("highlightTitle");

    const highlightMeta =
        document.getElementById("highlightMeta");

    const highlightTicker =
        document.getElementById("highlightTicker");

    const sliderDots =
        document.getElementById("sliderDots");

    const popularList =
        document.getElementById("popularList");

    const latestGrid =
        document.getElementById("latestGrid");

    const gameNewsGrid =
        document.getElementById("gameNewsGrid");

    const esportsGrid =
        document.getElementById("esportsGrid");


    /* =================================================
       MENU
       ================================================= */

    function openMenu() {

        sideMenu.classList.add("active");
        menuOverlay.classList.add("active");

        document.body.style.overflow = "hidden";
    }


    function closeSideMenu() {

        sideMenu.classList.remove("active");
        menuOverlay.classList.remove("active");

        document.body.style.overflow = "";
    }


    if (menuButton) {
        menuButton.addEventListener("click", openMenu);
    }


    if (closeMenu) {
        closeMenu.addEventListener("click", closeSideMenu);
    }


    if (menuOverlay) {
        menuOverlay.addEventListener("click", closeSideMenu);
    }


    /* =================================================
       ESC CLOSE MENU
       ================================================= */

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            closeSideMenu();

            if (searchBox) {
                searchBox.classList.remove("active");
            }

        }

    });


    /* =================================================
       DROPDOWN MENU
       ================================================= */

    const menuGroups =
        document.querySelectorAll(".menu-group");


    menuGroups.forEach((group) => {

        const dropdown =
            group.querySelector(".menu-dropdown");


        if (!dropdown) return;


        dropdown.addEventListener("click", () => {

            const isOpen =
                group.classList.contains("open");


            menuGroups.forEach((otherGroup) => {
                otherGroup.classList.remove("open");
            });


            if (!isOpen) {
                group.classList.add("open");
            }

        });

    });


    /* =================================================
       SEARCH
       ================================================= */

    if (searchButton) {

        searchButton.addEventListener("click", () => {

            searchBox.classList.toggle("active");

            if (searchBox.classList.contains("active")) {

                setTimeout(() => {
                    searchInput.focus();
                }, 250);

            }

        });

    }


    /* =================================================
       SEARCH FUNCTION
       ================================================= */

    function searchArticles() {

        const keyword =
            searchInput.value.trim().toLowerCase();


        if (!keyword) {

            renderLatest(articles);

            return;
        }


        const results =
            articles.filter((article) => {

                const title =
                    article.title?.toLowerCase() || "";

                const category =
                    article.category?.toLowerCase() || "";

                const description =
                    article.description?.toLowerCase() || "";

                const game =
                    article.game?.toLowerCase() || "";


                return (
                    title.includes(keyword) ||
                    category.includes(keyword) ||
                    description.includes(keyword) ||
                    game.includes(keyword)
                );

            });


        renderLatest(results);

        document.querySelector(".latest-section")
            ?.scrollIntoView({
                behavior: "smooth"
            });

    }


    if (searchSubmit) {

        searchSubmit.addEventListener(
            "click",
            searchArticles
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {
                    searchArticles();
                }

            }
        );

    }


    /* =================================================
       LOAD ARTICLES
       ================================================= */

    async function loadArticles() {

        try {

            const response =
                await fetch("data/articles.json");


            if (!response.ok) {
                throw new Error(
                    "Gagal mengambil articles.json"
                );
            }


            articles = await response.json();


            if (!Array.isArray(articles)) {

                throw new Error(
                    "Format articles.json harus berupa array"
                );

            }


            renderWebsite();

        } catch (error) {

            console.error(
                "GGNesia Error:",
                error
            );


            showLoadingError();

        }

    }


    /* =================================================
       RENDER WEBSITE
       ================================================= */

    function renderWebsite() {

        renderHighlight();

        renderPopular();

        renderLatest(articles);

        renderGameNews("all");

        renderEsports();

        renderGameButtons();

    }


    /* =================================================
       HIGHLIGHT
       ================================================= */

    let highlightIndex = 0;
    let highlightTimer;


    function getHighlights() {

        return articles.filter((article) => {

            return (
                article.highlight === true ||
                article.featured === true
            );

        });

    }


    function renderHighlight() {

        const highlights =
            getHighlights();


        if (!highlights.length) {

            if (articles.length) {

                renderHighlightArticle(
                    articles[0]
                );

            }

            return;
        }


        renderHighlightArticle(
            highlights[highlightIndex]
        );


        renderDots(highlights.length);

        startHighlightSlider(highlights);

    }


    function renderHighlightArticle(article) {

        if (!article) return;


        highlightImage.src =
            article.image || "assets/images/highlight.jpg";


        highlightImage.alt =
            article.title || "Berita gaming";


        highlightCategory.textContent =
            article.category || "GAMING";


        highlightTitle.textContent =
            article.title || "Berita Gaming";


        highlightMeta.textContent =
            `${article.author || "GGNesia"} • ${article.date || "Hari ini"}`;


        highlightTicker.textContent =
            article.title || "Berita gaming terbaru";

    }


    /* =================================================
       HIGHLIGHT DOTS
       ================================================= */

    function renderDots(total) {

        sliderDots.innerHTML = "";


        for (let i = 0; i < total; i++) {

            const dot =
                document.createElement("span");


            if (i === highlightIndex) {
                dot.classList.add("active");
            }


            dot.addEventListener("click", () => {

                highlightIndex = i;


                const highlights =
                    getHighlights();


                renderHighlightArticle(
                    highlights[highlightIndex]
                );


                renderDots(highlights.length);

                restartHighlightSlider(highlights);

            });


            sliderDots.appendChild(dot);

        }

    }


    /* =================================================
       HIGHLIGHT SLIDER
       ================================================= */

    function startHighlightSlider(highlights) {

        clearInterval(highlightTimer);


        if (highlights.length <= 1) {
            return;
        }


        highlightTimer =
            setInterval(() => {

                highlightIndex++;


                if (
                    highlightIndex >=
                    highlights.length
                ) {

                    highlightIndex = 0;

                }


                renderHighlightArticle(
                    highlights[highlightIndex]
                );


                renderDots(
                    highlights.length
                );


            }, 5000);

    }


    function restartHighlightSlider(highlights) {

        clearInterval(highlightTimer);

        startHighlightSlider(highlights);

    }


    /* =================================================
       POPULAR
       ================================================= */

    function renderPopular() {

        if (!popularList) return;


        let popularArticles =
            articles.filter(
                article => article.popular === true
            );


        if (!popularArticles.length) {

            popularArticles =
                [...articles].slice(0, 5);

        }


        popularList.innerHTML = "";


        popularArticles
            .slice(0, 6)
            .forEach((article, index) => {

                const item =
                    document.createElement("article");


                item.className =
                    "popular-item";


                item.innerHTML = `

                    <div class="popular-content">

                        <span class="category">
                            ${escapeHTML(
                                article.category || "GAMING"
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                article.title || "Berita Gaming"
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                article.author || "GGNesia"
                            )}
                            •
                            ${escapeHTML(
                                article.date || ""
                            )}
                        </p>

                    </div>

                    <div class="popular-image">

                        <img
                            src="${escapeAttribute(
                                article.image ||
                                "assets/images/highlight.jpg"
                            )}"
                            alt="${escapeAttribute(
                                article.title || "Berita gaming"
                            )}"
                            loading="lazy"
                        >

                    </div>

                `;


                popularList.appendChild(item);

            });

    }


    /* =================================================
       LATEST NEWS
       ================================================= */

    function renderLatest(list) {

        if (!latestGrid) return;


        latestGrid.innerHTML = "";


        if (!list.length) {

            latestGrid.innerHTML = `

                <div class="empty-state">

                    Tidak ada berita yang ditemukan.

                </div>

            `;

            return;
        }


        list
            .slice(0, 12)
            .forEach((article) => {

                latestGrid.appendChild(
                    createNewsCard(article)
                );

            });

    }


    /* =================================================
       NEWS CARD
       ================================================= */

    function createNewsCard(article) {

        const card =
            document.createElement("article");


        card.className =
            "news-card";


        card.innerHTML = `

            <div class="news-card-image">

                <img
                    src="${escapeAttribute(
                        article.image ||
                        "assets/images/highlight.jpg"
                    )}"
                    alt="${escapeAttribute(
                        article.title || "Berita gaming"
                    )}"
                    loading="lazy"
                >

            </div>


            <div class="news-card-content">

                <span class="category">
                    ${escapeHTML(
                        article.category || "GAMING"
                    )}
                </span>


                <h3>
                    ${escapeHTML(
                        article.title || "Berita Gaming"
                    )}
                </h3>


                <p>
                    ${escapeHTML(
                        article.author || "GGNesia"
                    )}
                    •
                    ${escapeHTML(
                        article.date || ""
                    )}
                </p>

            </div>

        `;


        return card;

    }


    /* =================================================
       GAME NEWS
       ================================================= */

    function renderGameNews(game) {

        if (!gameNewsGrid) return;


        let filtered;


        if (game === "all") {

            filtered = articles;

        } else {

            filtered =
                articles.filter((article) => {

                    return (
                        article.game === game
                    );

                });

        }


        gameNewsGrid.innerHTML = "";


        if (!filtered.length) {

            gameNewsGrid.innerHTML = `

                <div class="empty-state">

                    Belum ada berita untuk kategori ini.

                </div>

            `;

            return;
        }


        filtered
            .slice(0, 6)
            .forEach((article) => {

                gameNewsGrid.appendChild(
                    createNewsCard(article)
                );

            });

    }


    /* =================================================
       GAME BUTTONS
       ================================================= */

    function renderGameButtons() {

        const buttons =
            document.querySelectorAll(
                ".game-categories button"
            );


        if (!buttons.length) return;


        buttons.forEach((button, index) => {

            if (index === 0) {
                button.classList.add("active");
            }


            button.addEventListener("click", () => {

                buttons.forEach((btn) => {
                    btn.classList.remove("active");
                });


                button.classList.add("active");


                const game =
                    button.dataset.game;


                renderGameNews(game);

            });

        });

    }


    /* =================================================
       ESPORTS
       ================================================= */

    function renderEsports() {

        if (!esportsGrid) return;


        const esportsArticles =
            articles.filter((article) => {

                return (
                    article.type === "esports" ||
                    article.category === "ESPORTS"
                );

            });


        const list =
            esportsArticles.length
                ? esportsArticles
                : articles;


        esportsGrid.innerHTML = "";


        list
            .slice(0, 6)
            .forEach((article) => {

                esportsGrid.appendChild(
                    createNewsCard(article)
                );

            });

    }


    /* =================================================
       ERROR
       ================================================= */

    function showLoadingError() {

        const errorHTML = `

            <div class="empty-state">

                <h3>
                    Berita belum dapat dimuat
                </h3>

                <p style="margin-top:10px;">
                    Pastikan file
                    <strong>
                        data/articles.json
                    </strong>
                    sudah tersedia.
                </p>

            </div>

        `;


        if (popularList) {
            popularList.innerHTML = errorHTML;
        }


        if (latestGrid) {
            latestGrid.innerHTML = errorHTML;
        }


        if (gameNewsGrid) {
            gameNewsGrid.innerHTML = errorHTML;
        }


        if (esportsGrid) {
            esportsGrid.innerHTML = errorHTML;
        }

    }


    /* =================================================
       SECURITY HELPERS
       ================================================= */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function escapeAttribute(value) {

        return escapeHTML(value);

    }


    /* =================================================
       START
       ================================================= */

    loadArticles();

});
