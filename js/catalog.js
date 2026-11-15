'use strict';

const PRODUCTS = [
    { id: 1, name: "Fresh Farm Milk (1L)", category: "Dairy & Eggs", price: 480, icon: "fa-glass-water", brand: "FoodMaster" },
    { id: 2, name: "Organic Eggs (10 pcs)", category: "Dairy & Eggs", price: 650, icon: "fa-egg", brand: "Agro-Poultry" },
    { id: 3, name: "Artisanal Wheat Bread", category: "Bakery", price: 220, icon: "fa-bread-slice", brand: "Local Bakery" },
    { id: 4, name: "Farmer's Butter (200g)", category: "Dairy & Eggs", price: 1150, icon: "fa-cubes", brand: "Syrobogatov" },
    { id: 5, name: "Cottage Cheese (400g)", category: "Dairy & Eggs", price: 890, icon: "fa-bowl-rice", brand: "FoodMaster" },
    { id: 6, name: "Syrdariya Rice (1kg)", category: "Pantry", price: 780, icon: "fa-box", brand: "Sultan" },
    { id: 7, name: "Lay's Classic Chips", category: "Snacks", price: 720, icon: "fa-cookie", brand: "Lay's" },
    { id: 8, name: "Nestlé Nesquik Cereal", category: "Pantry", price: 1250, icon: "fa-bowl-food", brand: "Nestlé" },
    { id: 9, name: "Syrobogatov Gouda Cheese", category: "Dairy & Eggs", price: 1680, icon: "fa-cheese", brand: "Syrobogatov" },
    { id: 10, name: "Durum Wheat Spaghetti", category: "Bakery", price: 420, icon: "fa-utensils", brand: "Sultan" },
    { id: 11, name: "Fresh Red Apples (1kg)", category: "Pantry", price: 850, icon: "fa-apple-whole", brand: "Astana Fresh" },
    { id: 12, name: "Organic Cucumbers (1kg)", category: "Pantry", price: 690, icon: "fa-carrot", brand: "Astana Fresh" }
];

let cart = [];
let currentCategory = 'All';
let activeOfferBrand = null;

function isDeliverySelected() {
    return $('input[name="fulfillment"]:checked').val() === 'delivery';
}

function findCartLine(productId) {
    return cart.find((line) => line.product.id === productId);
}

function addToCart(product) {
    const line = findCartLine(product.id);
    if (line) {
        line.qty += 1;
    } else {
        cart.push({ product: product, qty: 1 });
    }
}

function removeOneFromCart(productId) {
    const line = findCartLine(productId);
    if (!line) return;
    line.qty -= 1;
    if (line.qty <= 0) {
        cart = cart.filter((l) => l !== line);
    }
}

function countCartItems() {
    return cart.reduce((sum, line) => sum + line.qty, 0);
}

function calculateOrderTotals(itemsArray, isDelivery, useBonus, userBonusBalance) {
    const subtotal = itemsArray.reduce((acc, line) => acc + line.product.price * line.qty, 0);

    let fee = 0;
    if (isDelivery && subtotal < 5000 && subtotal > 0) {
        fee = 500;
    }

    const grossTotal = subtotal + fee;
    let bonusDiscount = 0;

    if (useBonus && userBonusBalance > 0 && grossTotal > 0) {
        bonusDiscount = Math.min(userBonusBalance, grossTotal);
    }

    const grandTotal = Math.max(0, grossTotal - bonusDiscount);

    return { subtotal, fee, bonusDiscount, grandTotal };
}

function loadUserBonusBalance() {
    const activeUser = getActiveUser();
    const $toggle = $('#use-bonuses-toggle');

    if (activeUser) {
        const bonus = activeUser.bonus || 0;
        $('#user-bonus-balance').text(`${bonus.toLocaleString()} Points`);
        $toggle.prop('disabled', bonus <= 0);
    } else {
        $('#user-bonus-balance').text('0 Points (Login First)');
        $toggle.prop('disabled', true);
    }
}

function showCartMessage(type, text) {
    $('.cart-message').remove();

    $('<div>', { class: `cart-message alert alert-${type} py-2 small`, role: 'alert', text: text })
        .hide()
        .insertBefore('#checkout-btn')
        .fadeIn(250)
        .delay(3500)
        .fadeOut(500, function () {
            $(this).remove();
        });
}

function renderProducts(itemsToRender) {
    const $grid = $('#products-grid').empty();

    if (itemsToRender.length === 0) {
        $('<div>', { class: 'col-12 text-center py-5' })
            .html('<i class="fa-solid fa-magnifying-glass text-muted fs-1 mb-2"></i>' +
                '<p class="text-muted fw-bold">No products found matching your search or filter.</p>')
            .appendTo($grid);
        return;
    }

    $.each(itemsToRender, function (_, product) {
        const isPromo = activeOfferBrand !== null &&
            product.brand.toLowerCase() === activeOfferBrand.toLowerCase();

        const $badges = $('<div>', { class: 'd-flex gap-1 flex-wrap mb-2' })
            .append($('<span>', { class: 'badge bg-success-subtle text-success small', text: 'In Stock' }));

        if (isPromo) {
            $badges.append($('<span>', { class: 'badge bg-danger text-white small', text: 'Special Offer' }));
        }

        const $addBtn = $('<button>', {
            type: 'button',
            class: 'btn btn-warning btn-sm fw-bold rounded-pill add-to-cart-btn',
            'data-id': product.id
        })
            .append($('<i>', { class: 'fa-solid fa-plus me-1' }))
            .append(' Add');

        const $footer = $('<div>', { class: 'mt-auto d-flex align-items-center justify-content-between pt-2' })
            .append($('<span>', { class: 'fw-bold fs-6 text-primary', text: `${product.price.toLocaleString()} KZT` }))
            .append($addBtn);

        const $body = $('<div>', { class: 'card-body p-3 d-flex flex-column' })
            .append($badges)
            .append($('<h3>', { class: 'h6 fw-bold mb-1', text: product.name }))
            .append($('<p>', { class: 'small text-muted mb-2', text: product.brand }))
            .append($footer);

        const $imgWrapper = $('<div>', { class: 'product-img-wrapper' })
            .append($('<i>', { class: `fa-solid ${product.icon}` }));

        const $card = $('<div>', {
            class: `card h-100 product-card shadow-sm border-0 ${isPromo ? 'border-warning border-2' : ''}`
        }).append($imgWrapper, $body);

        $('<div>', { class: 'col-6 col-md-4' }).append($card).appendTo($grid);
    });
}

function getVisibleProducts() {
    const query = $('#catalog-search-input').val().trim().toLowerCase();

    return PRODUCTS.filter((p) => {
        if (activeOfferBrand !== null) {
            return p.brand.toLowerCase() === activeOfferBrand.toLowerCase();
        }
        const matchesCategory = (currentCategory === 'All' || p.category === currentCategory);
        const matchesQuery = p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query);
        return matchesCategory && matchesQuery;
    });
}

function swapGrid() {
    $('#products-grid').stop(true, true).fadeOut(150, function () {
        renderProducts(getVisibleProducts());
        $(this).fadeIn(150);
    });
}

function highlightCategory($btn) {
    $btn.removeClass('btn-outline-secondary').addClass('btn-warning active')
        .siblings('.category-btn').removeClass('btn-warning active').addClass('btn-outline-secondary');
}

function applyOffer(brandName, categoryName) {
    activeOfferBrand = brandName;
    currentCategory = categoryName;
    $('#catalog-search-input').val('');

    highlightCategory(
        $('#category-btn-group .category-btn').filter(function () {
            return $(this).text().includes(categoryName);
        })
    );

    swapGrid();

    $('html, body').animate({ scrollTop: $('#catalog-section-header').offset().top - 90 }, 400);
}

function updateCartUI() {
    $('#cart-count-badge').text(`Cart Items: ${countCartItems()}`);

    const $list = $('#cart-items-list').empty();

    if (cart.length === 0) {
        
        $('<li>', { class: 'list-group-item text-muted text-center py-3' })
            .html('<i class="fa-solid fa-basket-shopping me-1"></i> Your cart is currently empty.')
            .appendTo($list);

        $('#cart-subtotal, #cart-delivery, #cart-total').text('0 KZT');
        $('#bonus-discount-row').addClass('d-none');
        return;
    }

    $.each(cart, function (_, line) {
        const item = line.product;

        const $details = $('<div>', { class: 'me-2' })
            .append($('<strong>', { class: 'small d-block', text: item.name }))
            .append($('<span>', { class: 'text-muted small', text: `${item.price.toLocaleString()} KZT \u00d7 ${line.qty} = ${(item.price * line.qty).toLocaleString()} KZT` }));

        
        const $controls = $('<div>', { class: 'd-flex align-items-center gap-1 flex-shrink-0' })
            .append($('<button>', { type: 'button', class: 'btn btn-outline-secondary btn-sm py-0 px-2 qty-minus-btn', 'aria-label': 'One less', text: '\u2212' }))
            .append($('<span>', { class: 'badge bg-warning text-dark', text: `\u00d7${line.qty}` }))
            .append($('<button>', { type: 'button', class: 'btn btn-outline-secondary btn-sm py-0 px-2 qty-plus-btn', 'aria-label': 'One more', text: '+' }));

        $('<li>', {
            class: 'list-group-item d-flex justify-content-between align-items-center p-2',
            'data-id': item.id
        })
            .append($details, $controls)
            .appendTo($list);
    });

    const activeUser = getActiveUser();
    const userBonusBalance = activeUser ? (activeUser.bonus || 0) : 0;
    
    const isBonusChecked = $('#use-bonuses-toggle').prop('checked');
    const isDelivery = isDeliverySelected();

    const totals = calculateOrderTotals(cart, isDelivery, isBonusChecked, userBonusBalance);

    $('#cart-subtotal').text(`${totals.subtotal.toLocaleString()} KZT`);

    const $delivery = $('#cart-delivery');
    if (isDelivery && totals.fee > 0) {
        $delivery.text(`${totals.fee} KZT`).attr('class', 'fw-bold text-dark');
    } else {
        $delivery.text('Free').attr('class', 'fw-bold text-success');
    }

    const $bonusRow = $('#bonus-discount-row');
    if (totals.bonusDiscount > 0) {
        $bonusRow.removeClass('d-none');
        $('#cart-bonus-discount').text(`-${totals.bonusDiscount.toLocaleString()} KZT`);
    } else {
        $bonusRow.addClass('d-none');
    }

    $('#cart-total').text(`${totals.grandTotal.toLocaleString()} KZT`);
}

function handleCheckout() {
    if (cart.length === 0) {
        showCartMessage('warning', 'Your cart is empty! Add products first.');
        return;
    }

    let addressText = 'Zhagalau 4, Astana (Store Pickup)';
    const isDelivery = isDeliverySelected();

    if (isDelivery) {
        const $address = $('#delivery-address');
        const inputAddress = $address.val().trim();

        if (inputAddress === '') {
            $address.addClass('is-invalid').trigger('focus');
            showCartMessage('danger', 'Please enter your delivery address in Astana.');
            return;
        }
        addressText = inputAddress;
    }

    const activeUser = getActiveUser();
    const userEmail = activeUser ? activeUser.email : 'guest@mail.kz';
    const $bonusToggle = $('#use-bonuses-toggle');
    const userBonusBalance = activeUser ? (activeUser.bonus || 0) : 0;

    const totals = calculateOrderTotals(cart, isDelivery, $bonusToggle.prop('checked'), userBonusBalance);
    const orderRef = `#BZ-${Math.floor(10000 + Math.random() * 90000)}`;
    const today = new Date().toLocaleDateString('ru-RU');
    const itemSummary = cart.map((l) => (l.qty > 1 ? `${l.product.name} \u00d7${l.qty}` : l.product.name)).join(', ');
    const statusText = isDelivery ? 'Out for Delivery' : 'Ready for Pickup';

    const newOrder = {
        id: orderRef,
        userEmail,
        date: today,
        items: itemSummary,
        total: `${totals.grandTotal.toLocaleString()} KZT`,
        status: statusText,
        address: addressText
    };

    const orders = JSON.parse(localStorage.getItem('market_orders')) || [];
    orders.unshift(newOrder);
    localStorage.setItem('market_orders', JSON.stringify(orders));

    if (activeUser) {
        const earnedBonus = calculateCashback(totals.subtotal);
        activeUser.bonus = (activeUser.bonus || 0) - totals.bonusDiscount + earnedBonus;
        localStorage.setItem('market_active_user', JSON.stringify(activeUser));

        const users = JSON.parse(localStorage.getItem('market_users')) || [];
        const userIdx = users.findIndex((u) => u.email === activeUser.email);
        if (userIdx !== -1) {
            users[userIdx].bonus = activeUser.bonus;
            localStorage.setItem('market_users', JSON.stringify(users));
        }
        loadUserBonusBalance();
    }

    cart = [];
    $bonusToggle.prop('checked', false);
    updateCartUI();
    showCartMessage('success', `Pre-order ${orderRef} submitted! Total paid: ${totals.grandTotal.toLocaleString()} KZT. Check your dashboard for the status.`);
}




$(function () {
    renderProducts(PRODUCTS);
    initPromoSlider();      
    loadUserBonusBalance();

    
    
    $('#delivery-address-container').removeClass('d-none').hide();

    
    const urlParams = new URLSearchParams(window.location.search);
    const offerBrand = urlParams.get('brand');
    const offerCategory = urlParams.get('category');
    if (offerBrand && offerCategory) {
        applyOffer(offerBrand, offerCategory);
    }

    $('#products-grid').on('click', '.add-to-cart-btn', function () {
        const productId = $(this).data('id');   
        const product = PRODUCTS.find((p) => p.id === productId);
        if (!product) return;

        addToCart(product);
        updateCartUI();

        
        $(`#cart-items-list > li[data-id="${productId}"]`).hide().fadeIn(200);

        
        $(this).closest('.product-card').fadeTo(120, 0.6).fadeTo(120, 1);
    });

    
    $('#cart-items-list').on('click', '.qty-plus-btn', function () {
        const product = PRODUCTS.find((p) => p.id === $(this).closest('li').data('id'));
        if (!product) return;

        addToCart(product);
        updateCartUI();
    });

    
    $('#cart-items-list').on('click', '.qty-minus-btn', function () {
        const $item = $(this).closest('li');
        if ($item.is(':animated')) return;          

        const productId = $item.data('id');
        const line = findCartLine(productId);
        if (!line) return;

        if (line.qty > 1) {
            removeOneFromCart(productId);
            updateCartUI();
        } else {
            
            $item.slideUp(200, function () {
                removeOneFromCart(productId);
                updateCartUI();
            });
        }
    });

    
    $('#catalog-search-input').on('input', function () {
        activeOfferBrand = null;
        renderProducts(getVisibleProducts());
    });

    $('.category-btn').on('click', function () {
        const $btn = $(this);

        
        if ($btn.hasClass('active') && activeOfferBrand === null) return;

        highlightCategory($btn);

        const label = $btn.text().trim();
        currentCategory = label === 'All Items' ? 'All' : label;
        activeOfferBrand = null;
        swapGrid();
    });

    
    $('#slider-track').on('click', '.offer-claim-btn', function () {
        const $btn = $(this);
        const brand = $btn.attr('data-brand');
        const category = $btn.attr('data-category');
        if (brand && category) {
            applyOffer(brand, category);
        }
    });

    $('input[name="fulfillment"]').on('change', function () {
        const isDelivery = $(this).val() === 'delivery';

        
        if (isDelivery) {
            $('#pickup-info-container').stop(true, true).slideUp(200);
            $('#delivery-address-container').stop(true, true).slideDown(300);
        } else {
            $('#delivery-address-container').stop(true, true).slideUp(200);
            $('#pickup-info-container').stop(true, true).slideDown(300);
        }

        $('#delivery-label-text').text(isDelivery ? 'Delivery Fee' : 'Pickup Fee');
        updateCartUI();
    });

    $('#delivery-address').on('input', function () {
        $(this).removeClass('is-invalid');
    });

    $('#checkout-btn').on('click', handleCheckout);
    $('#use-bonuses-toggle').on('change', updateCartUI);
});