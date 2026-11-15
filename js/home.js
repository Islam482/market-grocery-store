'use strict';

$(function () {
    initPromoSlider();   // defined in main.js

    $('#slider-track').on('click', '.offer-claim-btn', function () {
        const $btn = $(this);
        const brand = $btn.attr('data-brand');
        const category = $btn.attr('data-category');

        if (brand && category) {
            window.location.href = 'catalog.html?' + $.param({ brand: brand, category: category });
        }
    });
});
