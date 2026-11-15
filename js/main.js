'use strict';


function getActiveUser() {
    const activeUserJson = localStorage.getItem('market_active_user');
    return activeUserJson ? JSON.parse(activeUserJson) : null;
}


function calculateCashback(amount) {
    if (typeof amount !== 'number' || amount <= 0) {
        return 0;
    }
    return Math.floor(amount * 0.05);
}

function initPromoSlider() {
    const $viewport = $('#slider-viewport');
    if ($viewport.length === 0) return;

    const totalCards = $('.custom-slider-card').length;
    const isMobile = window.matchMedia('(max-width: 768px)');
    let currentIndex = 0;
    let timer = null;

    const cardsPerView = () => (isMobile.matches ? 1 : 3);
    const maxIndex = () => totalCards - cardsPerView();
    const offsetFor = (index) => index * ($viewport.width() / cardsPerView());

    function goTo(index) {
        currentIndex = index;
        $viewport.stop(true).animate({ scrollLeft: offsetFor(index) }, 600);
    }

    function nextSlide() {
        goTo(currentIndex < maxIndex() ? currentIndex + 1 : 0);
    }

    function prevSlide() {
        goTo(currentIndex > 0 ? currentIndex - 1 : maxIndex());
    }

    function stopAutoplay() {
        if (timer) clearInterval(timer);
    }

    function startAutoplay() {
        stopAutoplay();
        timer = setInterval(nextSlide, 5000);
    }

    $('#slider-next-btn').on('click', function () {
        nextSlide();
        startAutoplay();
    });

    $('#slider-prev-btn').on('click', function () {
        prevSlide();
        startAutoplay();
    });

    $viewport.on('mouseenter', stopAutoplay).on('mouseleave', startAutoplay);

    $(window).on('resize', function () {
        currentIndex = Math.min(currentIndex, maxIndex());
        $viewport.stop(true).scrollLeft(offsetFor(currentIndex));
    });

    startAutoplay();
}

$(function () {
    const activeUser = getActiveUser();
    if (!activeUser) return;

    const firstName = activeUser.name.split(' ')[0];

    $('a[href="auth.html"]').each(function () {
        $(this)
            .text(' ' + firstName)
            .prepend($('<i>', { class: 'fa-solid fa-user me-1' }));
    });
});
