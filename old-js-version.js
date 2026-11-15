'use strict';

/*
 * old-js-version.js: NOT linked to any page.
 *
 * The three features below are the ORIGINAL plain-JavaScript versions, kept only so they
 * can be compared side by side with the jQuery rewrites:
 *
 *   1. register form handling        ->  js/auth.js      (registerRules + $registerForm.on('submit'))
 *   2. show / hide the delivery block ->  js/catalog.js   ($('input[name="fulfillment"]').on('change'))
 *   3. order list built in code      ->  js/dashboard.js (renderOrdersTable)
 *
 * Each one is wrapped in a function only so that this file stays valid JavaScript.
 * The code inside is unchanged from the original files.
 */

// ---------------------------------------------------------------------------
// 1. ORIGINAL register form handling (old js/auth.js)
// ---------------------------------------------------------------------------
function showAlertOld(message, type = 'danger') {
    const alertBox = document.getElementById('auth-alert');
    if (!alertBox) return;
    alertBox.className = `alert alert-${type} mb-3`;
    alertBox.textContent = message;
    alertBox.classList.remove('d-none');
}

function oldRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim().toLowerCase();
            const password = document.getElementById('reg-password').value;

            const registeredUsers = JSON.parse(localStorage.getItem('market_users')) || [];

            if (registeredUsers.some((u) => u.email.toLowerCase() === email)) {
                showAlertOld("An account with this email already exists!");
                return;
            }

            const newUser = { name: name, email: email, password: password, bonus: 500 };
            registeredUsers.push(newUser);
            localStorage.setItem('market_users', JSON.stringify(registeredUsers));
            localStorage.setItem('market_active_user', JSON.stringify(newUser));

            showAlertOld("Registration successful! Redirecting to dashboard...", "success");
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        });
    }
}

// ---------------------------------------------------------------------------
// 2. ORIGINAL show / hide of the delivery block (old js/catalog.js)
// ---------------------------------------------------------------------------
let fulfillmentMethodOld = 'pickup';

function oldDeliveryToggle() {
    const pickupRadio = document.getElementById('method-pickup');
    const deliveryRadio = document.getElementById('method-delivery');

    if (pickupRadio && deliveryRadio) {
        pickupRadio.addEventListener('change', () => {
            fulfillmentMethodOld = 'pickup';
            document.getElementById('delivery-address-container').classList.add('d-none');
            document.getElementById('pickup-info-container').classList.remove('d-none');
            document.getElementById('delivery-label-text').textContent = 'Pickup Fee';
            updateCartUI();
        });

        deliveryRadio.addEventListener('change', () => {
            fulfillmentMethodOld = 'delivery';
            document.getElementById('delivery-address-container').classList.remove('d-none');
            document.getElementById('pickup-info-container').classList.add('d-none');
            document.getElementById('delivery-label-text').textContent = 'Delivery Fee';
            updateCartUI();
        });
    }
}

// ---------------------------------------------------------------------------
// 3. ORIGINAL order list built in code (old js/dashboard.js)
// ---------------------------------------------------------------------------
function renderOrdersTableOld(userEmail) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    tbody.textContent = ''; // Clear existing table rows securely

    const orders = JSON.parse(localStorage.getItem('market_orders')) || [];
    let userOrders = orders.filter((o) => o.userEmail === userEmail);

    if (userOrders.length === 0) {
        userOrders = [
            {
                id: '#BZ-98234',
                date: '24.10.2026',
                items: 'Fresh Farm Milk (1L), Organic Eggs (10 pcs)',
                total: '1,130 KZT',
                status: 'Ready for Pickup'
            },
            {
                id: '#BZ-78210',
                date: '18.10.2026',
                items: "Artisanal Wheat Bread, Farmer's Butter (200g)",
                total: '1,370 KZT',
                status: 'Delivered'
            }
        ];
    }

    userOrders.forEach((order) => {
        const tr = document.createElement('tr');

        const idTd = document.createElement('td');
        idTd.className = 'fw-bold';
        idTd.textContent = order.id;

        const dateTd = document.createElement('td');
        dateTd.className = 'text-muted small';
        dateTd.textContent = order.date;

        const itemsTd = document.createElement('td');
        itemsTd.className = 'small';
        itemsTd.style.maxWidth = '250px';
        itemsTd.textContent = order.items;

        const totalTd = document.createElement('td');
        totalTd.className = 'fw-bold text-primary';
        totalTd.textContent = order.total;

        const statusTd = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = `badge ${order.status === 'Ready for Pickup' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`;
        badge.textContent = order.status;
        statusTd.appendChild(badge);

        tr.appendChild(idTd);
        tr.appendChild(dateTd);
        tr.appendChild(itemsTd);
        tr.appendChild(totalTd);
        tr.appendChild(statusTd);

        tbody.appendChild(tr);
    });
}
