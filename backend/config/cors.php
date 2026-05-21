<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://192.168.33.13:5173',
        'http://localhost:5173',
        'https://jewelry-sales-ecommerce.pages.dev',
        'https://4b2a2491.jewelry-sales-ecommerce.pages.dev',
    ],

    'allowed_origins_patterns' => [
        '/^https:\/\/.*\.jewelry-sales-ecommerce\.pages\.dev$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];