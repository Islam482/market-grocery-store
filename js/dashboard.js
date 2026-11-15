'use strict';

function renderOrdersTable(userEmail) {
    const $tbody = $('table tbody');
    $tbody.empty();

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

    $.each(userOrders, function (_, order) {
        const badgeClass = order.status === 'Ready for Pickup'
            ? 'bg-success-subtle text-success'
            : 'bg-secondary-subtle text-secondary';

        $('<tr>')
            .append(
                $('<td>', { class: 'fw-bold', text: order.id }),
                $('<td>', { class: 'text-muted small', text: order.date }),
                $('<td>', { class: 'small text-break', text: order.items }),
                $('<td>', { class: 'fw-bold text-primary', text: order.total }),
                $('<td>').append($('<span>', { class: 'badge ' + badgeClass, text: order.status }))
            )
            .appendTo($tbody);
    });
}

$(function () {
    const activeUser = getActiveUser();

    if (!activeUser) {
        window.location.href = 'auth.html';
        return;
    }


    $('#profile-name').text(activeUser.name);
    $('#profile-email').text(activeUser.email);
    $('#profile-bonus').text((activeUser.bonus || 0).toLocaleString());

    if (activeUser.name) {
        const initials = activeUser.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
        $('#profile-avatar').text(initials || 'U');
    }

    renderOrdersTable(activeUser.email);
    $('table tbody').on('click', 'tr', function () {

        $(this).toggleClass('table-active').siblings().removeClass('table-active');
    });

    $('#sign-out-btn').on('click', function () {
        localStorage.removeItem('market_active_user');
        $(this).prop('disabled', true);

        $('main').fadeOut(250, function () {
            window.location.href = 'auth.html';
        });
    });
});
