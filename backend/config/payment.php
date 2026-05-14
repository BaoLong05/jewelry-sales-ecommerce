<?php

return [
    'bank_name'    => env('BANK_NAME', 'Vietcombank'),
    'bank_bin'     => env('BANK_BIN', '970436'),
    'bank_account' => env('BANK_ACCOUNT'),
    'bank_owner'   => env('BANK_OWNER'),

    //momo
    'momo' => [
        'partner_code' => env('MOMO_PARTNER_CODE'),
        'access_key'   => env('MOMO_ACCESS_KEY'),
        'secret_key'   => env('MOMO_SECRET_KEY'),
        'endpoint'     => env('MOMO_ENDPOINT'),
        'redirect_url' => env('MOMO_REDIRECT_URL'),
        'ipn_url'      => env('MOMO_IPN_URL'),
    ],
];
