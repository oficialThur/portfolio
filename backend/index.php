<?php

header('Content-Type: application/json; charset=utf-8');
http_response_code(200);

echo json_encode([
    'service' => 'portfolio-backend',
    'status' => 'ok',
    'endpoints' => [
        'health' => '/healthz.php',
        'contact' => '/contato.php',
    ],
]);
