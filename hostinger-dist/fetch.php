<?php

declare(strict_types=1);

$allowedOrigin = getenv('ALLOWED_ORIGIN') ?: '*';
$maxBytes = (int) (getenv('MAX_BYTES') ?: '8388608');
$timeoutSeconds = (int) (getenv('TIMEOUT_SECONDS') ?: '15');
$maxRedirects = (int) (getenv('MAX_REDIRECTS') ?: '5');

$browserHeaders = [
    'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/*,*/*;q=0.8',
    'Accept-Language: en-US,en;q=0.9',
    'Accept-Encoding: identity',
];

function sendCorsHeaders(string $allowedOrigin): void
{
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept');
    header('Access-Control-Max-Age: 86400');
}

function sendJson(int $status, array $payload, string $allowedOrigin): never
{
    http_response_code($status);
    sendCorsHeaders($allowedOrigin);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function startsWith(string $value, string $prefix): bool
{
    return $prefix === '' || strncmp($value, $prefix, strlen($prefix)) === 0;
}

function containsText(string $value, string $needle): bool
{
    return $needle === '' || strpos($value, $needle) !== false;
}

function safeHeaderValue(string $value): string
{
    return str_replace(["\r", "\n"], '', $value);
}

function isPublicIp(string $ip): bool
{
    return filter_var(
        $ip,
        FILTER_VALIDATE_IP,
        FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
    ) !== false;
}

function resolvePublicAddress(string $host): bool
{
    if (filter_var($host, FILTER_VALIDATE_IP)) {
        return isPublicIp($host);
    }

    $ipv4 = gethostbynamel($host);
    if (is_array($ipv4) && $ipv4 !== []) {
        foreach ($ipv4 as $ip) {
            if (!isPublicIp($ip)) {
                return false;
            }
        }

        return true;
    }

    if (function_exists('dns_get_record')) {
        $aaaa = dns_get_record($host, DNS_AAAA);
        if (is_array($aaaa) && $aaaa !== []) {
            foreach ($aaaa as $record) {
                if (!isset($record['ipv6']) || !isPublicIp($record['ipv6'])) {
                    return false;
                }
            }

            return true;
        }
    }

    return false;
}

function validateTargetUrl(?string $rawUrl): string
{
    if ($rawUrl === null || $rawUrl === '') {
        throw new RuntimeException('missing url query param', 400);
    }

    if (!filter_var($rawUrl, FILTER_VALIDATE_URL)) {
        throw new RuntimeException('invalid url', 400);
    }

    $parts = parse_url($rawUrl);
    if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])) {
        throw new RuntimeException('invalid url', 400);
    }

    if ($parts['scheme'] !== 'http' && $parts['scheme'] !== 'https') {
        throw new RuntimeException('invalid protocol', 400);
    }

    if (isset($parts['user']) || isset($parts['pass'])) {
        throw new RuntimeException('credentials are not allowed in url', 400);
    }

    if (!resolvePublicAddress($parts['host'])) {
        throw new RuntimeException('target host is not public', 403);
    }

    return $rawUrl;
}

function resolveRelativeUrl(string $baseUrl, string $relative): string
{
    $base = parse_url($baseUrl);
    if (!is_array($base) || !isset($base['scheme'], $base['host'])) {
        throw new RuntimeException('invalid redirect url', 502);
    }

    if (startsWith($relative, '//')) {
        return $base['scheme'] . ':' . $relative;
    }

    $port = isset($base['port']) ? ':' . $base['port'] : '';

    if (startsWith($relative, '/')) {
        return $base['scheme'] . '://' . $base['host'] . $port . $relative;
    }

    $path = $base['path'] ?? '/';
    $dir = substr($path, 0, strrpos($path, '/') + 1);

    return $base['scheme'] . '://' . $base['host'] . $port . $dir . $relative;
}

function fetchUpstream(string $url, array $browserHeaders, int $timeoutSeconds, int $maxRedirects, int $maxBytes): array
{
    $currentUrl = validateTargetUrl($url);

    for ($i = 0; $i <= $maxRedirects; $i++) {
        $responseHeaders = [];
        $body = '';

        $ch = curl_init($currentUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT => $timeoutSeconds,
            CURLOPT_TIMEOUT => $timeoutSeconds,
            CURLOPT_HTTPHEADER => $browserHeaders,
            CURLOPT_HEADERFUNCTION => static function ($curl, string $headerLine) use (&$responseHeaders): int {
                $trimmed = trim($headerLine);
                $length = strlen($headerLine);

                if ($trimmed === '' || startsWith($trimmed, 'HTTP/')) {
                    return $length;
                }

                $parts = explode(':', $trimmed, 2);
                if (count($parts) === 2) {
                    $responseHeaders[strtolower(trim($parts[0]))] = trim($parts[1]);
                }

                return $length;
            },
            CURLOPT_WRITEFUNCTION => static function ($curl, string $chunk) use (&$body, $maxBytes): int {
                $body .= $chunk;
                if (strlen($body) > $maxBytes) {
                    return 0;
                }

                return strlen($chunk);
            },
        ]);

        curl_exec($ch);
        $curlError = curl_error($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);

        if ($curlError !== '') {
            if (containsText(strtolower($curlError), 'operation aborted')) {
                throw new RuntimeException('upstream response too large', 413);
            }

            throw new RuntimeException('upstream fetch failed', 502);
        }

        if (in_array($status, [301, 302, 303, 307, 308], true) && isset($responseHeaders['location'])) {
            $location = $responseHeaders['location'];
            $currentUrl = validateTargetUrl(preg_match('#^https?://#i', $location)
                ? $location
                : resolveRelativeUrl($currentUrl, $location));
            continue;
        }

        return [
            'status' => $status,
            'body' => $body,
            'content_type' => $responseHeaders['content-type'] ?? 'application/octet-stream',
            'final_url' => $currentUrl,
        ];
    }

    throw new RuntimeException('too many redirects', 508);
}

sendCorsHeaders($allowedOrigin);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(405, ['error' => 'method not allowed'], $allowedOrigin);
}

if (!function_exists('curl_init')) {
    sendJson(500, ['error' => 'PHP cURL extension is required'], $allowedOrigin);
}

try {
    $result = fetchUpstream(
        $_GET['url'] ?? null,
        $browserHeaders,
        $timeoutSeconds,
        $maxRedirects,
        $maxBytes
    );

    http_response_code($result['status']);
    header('Content-Type: ' . safeHeaderValue($result['content_type']));
    header('Cache-Control: private, max-age=120');
    header('X-Final-URL: ' . safeHeaderValue($result['final_url']));
    echo $result['body'];
} catch (RuntimeException $e) {
    $status = $e->getCode();
    if ($status < 400 || $status > 599) {
        $status = 502;
    }

    sendJson($status, ['error' => $e->getMessage()], $allowedOrigin);
}
