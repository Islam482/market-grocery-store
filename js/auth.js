'use strict';

function showAlert(message, type = 'danger') {
    
    $('#auth-alert')
        .stop(true, true)
        .removeClass('d-none alert-danger alert-success')
        .addClass('alert-' + type)
        .text(message)
        .hide()
        .fadeIn(300);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;   
const PHONE_RE = /^(\+7|8)\d{10}$/;                 

function readField($field) {

    if ($field.is(':checkbox')) return $field.prop('checked');

    const raw = $field.val();
    
    return $field.is('[type="password"]') ? raw : raw.trim();
}

function showFieldError($field, message) {
    $field.addClass('is-invalid');
    
    $('<div>', { class: 'field-error text-danger small mt-1', text: message })
        .hide()
        .appendTo($field.parent())
        .slideDown(150);
}

function clearFieldError($field) {
    $field.removeClass('is-invalid')
        .parent().find('.field-error').remove();
}

function validateFields($form, rules) {
    let allValid = true;

    $.each(rules, function (_, rule) {
        const $field = $(rule.selector);
        clearFieldError($field);

        if (!rule.test(readField($field))) {
            showFieldError($field, rule.message);
            allValid = false;
        }
    });

    $form.find('.is-invalid:first').trigger('focus');
    return allValid;
}

function bindFieldCleanup($form, rules) {

    
    $form.on('input change', 'input', function () {
        const $field = $(this);
        const rule = rules.find((r) => r.selector === '#' + $field.attr('id'));
        if (rule && rule.test(readField($field))) {
            clearFieldError($field);
        }
    });
    
    $form.on('focusout', 'input:not([type="password"], [type="checkbox"])', function () {
        $(this).val($(this).val().trim());
    });
}


function addPhoneField() {
    $('<div>', { class: 'mb-3' })
        .append(
            $('<label>', { for: 'reg-phone', class: 'form-label small fw-bold', text: 'Phone number' }),
            $('<input>', {
                type: 'tel',
                id: 'reg-phone',
                class: 'form-control',
                placeholder: '+7 701 123 45 67',
                required: true
            })
        )
        .insertAfter($('#reg-email').parent());
}

const registerRules = [
    {
        selector: '#reg-name',
        test: (v) => /^\p{L}[\p{L}\s.'-]+$/u.test(v),
        message: 'Enter your full name: letters only, at least 2 characters.'
    },
    {
        selector: '#reg-email',
        test: (v) => EMAIL_RE.test(v),
        message: 'Enter a valid e-mail, for example name@mail.kz.'
    },
    {
        selector: '#reg-phone',
        test: (v) => PHONE_RE.test(v.replace(/[\s()-]/g, '')),
        message: 'Enter a Kazakhstan phone number like +7 701 123 45 67.'
    },
    {
        selector: '#reg-password',
        test: (v) => v.length >= 6 && v.trim() !== '',
        message: 'Password must be at least 6 characters and not only spaces.'
    },
    {
        selector: '#termsCheck',
        test: (v) => v === true,
        message: 'You must accept the terms and conditions.'
    }
];

const loginRules = [
    {
        selector: '#login-email',
        test: (v) => EMAIL_RE.test(v),
        message: 'Enter a valid e-mail address.'
    },
    {
        selector: '#login-password',
        test: (v) => v !== '',
        message: 'Enter your password.'
    }
];

$(function () {
    
    const users = JSON.parse(localStorage.getItem('market_users')) || [];
    if (users.length === 0) {
        users.push({
            name: 'Islam Brimbayev',
            email: 'customer@mail.kz',
            password: '123456',
            bonus: 1450
        });
        localStorage.setItem('market_users', JSON.stringify(users));
    }

    if (localStorage.getItem('market_active_user')) {
        window.location.href = 'dashboard.html';
        return;
    }

    addPhoneField();

    const $loginForm = $('#login-form');
    const $registerForm = $('#register-form');

    bindFieldCleanup($loginForm, loginRules);
    bindFieldCleanup($registerForm, registerRules);

    
    $loginForm.on('submit', function (event) {
        
        
        
        event.preventDefault();

        if (!validateFields($loginForm, loginRules)) return;

        const email = $('#login-email').val().trim().toLowerCase();
        const password = $('#login-password').val();

        const registeredUsers = JSON.parse(localStorage.getItem('market_users')) || [];
        const matchedUser = registeredUsers.find((u) => u.email.toLowerCase() === email && u.password === password);

        if (matchedUser !== undefined) {
            localStorage.setItem('market_active_user', JSON.stringify(matchedUser));
            showAlert('Login successful! Redirecting...', 'success');
            setTimeout(function () {
                window.location.href = 'dashboard.html';
            }, 800);
        } else {
            showAlert('Invalid email or password. Please try again.');
        }
    });

    
    $registerForm.on('submit', function (event) {
        event.preventDefault();   

        if (!validateFields($registerForm, registerRules)) return;

        const name = $('#reg-name').val().trim();
        const email = $('#reg-email').val().trim().toLowerCase();
        const phone = $('#reg-phone').val().replace(/[\s()-]/g, '');
        const password = $('#reg-password').val();

        const registeredUsers = JSON.parse(localStorage.getItem('market_users')) || [];

        if (registeredUsers.some((u) => u.email.toLowerCase() === email)) {
            showFieldError($('#reg-email'), 'An account with this email already exists!');
            return;
        }

        const newUser = { name: name, email: email, phone: phone, password: password, bonus: 500 };
        registeredUsers.push(newUser);
        localStorage.setItem('market_users', JSON.stringify(registeredUsers));
        localStorage.setItem('market_active_user', JSON.stringify(newUser));

        showAlert('Registration successful! Redirecting to dashboard...', 'success');
        $registerForm.trigger('reset');

        setTimeout(function () {
            window.location.href = 'dashboard.html';
        }, 1000);
    });
});
