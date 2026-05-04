<?php

declare(strict_types=1);

$allowedOrigin = getenv('ALLOWED_ORIGIN') ?: '*';

header('Access-Control-Allow-Origin: ' . $allowedOrigin);
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['ok' => true], JSON_UNESCAPED_SLASHES);
