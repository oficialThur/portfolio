<?php

require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = $_ENV['ALLOWED_ORIGINS'] ?? getenv('ALLOWED_ORIGINS') ?: '';
$allowed = array_values(array_filter(array_map('trim', explode(',', $allowedOrigins))));

if (empty($allowed)) {
    $allowed = ['http://localhost:5173', 'http://localhost:5174'];
}

if (in_array($origin, $allowed)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Origem não permitida.']);
    exit;
}

const CONTACT_EMAIL = 'oficialthurhenrique@gmail.com';

$rateLimitEnabledRaw = $_ENV['RATE_LIMIT_ENABLED'] ?? getenv('RATE_LIMIT_ENABLED') ?: 'true';
$rateLimitEnabled = filter_var($rateLimitEnabledRaw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
if ($rateLimitEnabled === null) {
    $rateLimitEnabled = true;
}

$rateLimitMaxRaw = $_ENV['RATE_LIMIT_MAX'] ?? getenv('RATE_LIMIT_MAX') ?: '5';
$rateLimitMax = max(1, (int) $rateLimitMaxRaw);

$rateLimitMinRaw = $_ENV['RATE_LIMIT_MIN'] ?? getenv('RATE_LIMIT_MIN') ?: '15';
$rateLimitMin = max(1, (int) $rateLimitMinRaw);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
    exit;
}

function checkRateLimit(string $ip, int $maxRequests, int $windowMinutes): bool
{
    $file     = sys_get_temp_dir() . '/rl_' . md5($ip) . '.json';
    $now      = time();
    $window   = $windowMinutes * 60;
    $requests = file_exists($file)
        ? (json_decode(file_get_contents($file), true) ?? [])
        : [];

    $requests = array_filter($requests, fn($t) => ($now - $t) < $window);

    if (count($requests) >= $maxRequests) return false;

    $requests[] = $now;
    file_put_contents($file, json_encode(array_values($requests)));
    return true;
}

function sendWithResend(
    string $apiKey,
    string $from,
    string $to,
    string $replyTo,
    string $subject,
    string $textBody
): array {
    if ($apiKey === '') {
        return ['success' => false, 'error' => 'RESEND_API_KEY ausente'];
    }

    $payload = [
        'from' => $from,
        'to' => [$to],
        'reply_to' => $replyTo,
        'subject' => $subject,
        'text' => $textBody,
    ];

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Authorization: Bearer {$apiKey}\r\nContent-Type: application/json\r\n",
            'content' => json_encode($payload, JSON_UNESCAPED_UNICODE),
            'timeout' => 12,
            'ignore_errors' => true,
        ],
    ]);

    $response = @file_get_contents('https://api.resend.com/emails', false, $context);
    $statusLine = $http_response_header[0] ?? '';
    $statusCode = preg_match('/HTTP\/\d+(?:\.\d+)?\s+(\d+)/', $statusLine, $m)
        ? (int) $m[1]
        : 0;

    if ($statusCode >= 200 && $statusCode < 300) {
        return ['success' => true, 'error' => null];
    }

    $responseBody = is_string($response) ? $response : '';
    return [
        'success' => false,
        'error' => 'Resend HTTP ' . $statusCode . ($responseBody !== '' ? ': ' . $responseBody : ''),
    ];
}


$clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];

if ($rateLimitEnabled && !checkRateLimit($clientIp, $rateLimitMax, $rateLimitMin)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Muitas tentativas. Aguarde alguns minutos.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'JSON inválido.']);
    exit;
}

$errors = [];

$name        = trim($body['name']        ?? '');
$email       = trim($body['email']       ?? '');
$message     = trim($body['message']     ?? '');
$isRecruiter = isset($body['isRecruiter']) ? (bool) $body['isRecruiter'] : null;

if (mb_strlen($name) < 2)   $errors['name'][]    = 'Nome deve ter pelo menos 2 caracteres.';
if (mb_strlen($name) > 100) $errors['name'][]    = 'Nome muito longo.';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'][] = 'E-mail inválido.';

if (mb_strlen($message) < 10)   $errors['message'][] = 'Mensagem deve ter pelo menos 10 caracteres.';
if (mb_strlen($message) > 2000) $errors['message'][] = 'Mensagem muito longa.';

if (!is_bool($isRecruiter)) {
    $errors['isRecruiter'][] = 'Selecione uma opção.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

$name        = htmlspecialchars($name,    ENT_QUOTES, 'UTF-8');
$message     = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
$isRecruiter = (bool) $isRecruiter;
$recruiterLabel = $isRecruiter ? 'Sim' : 'Não';

$emailBody = <<<TEXT
Nova mensagem do portfólio

Nome:       $name
E-mail:     $email
Recrutador: $recruiterLabel

Mensagem:
$message
TEXT;

$headers  = "From: Portfolio Contact <noreply@seudominio.com>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$subject = $isRecruiter
    ? "[Recrutador] Nova mensagem de $name"
    : "[Contato] Nova mensagem de $name";
$smtpUser = $_ENV['SMTP_USER'] ?? getenv('SMTP_USER') ?: '';
$smtpPass = $_ENV['SMTP_PASS'] ?? getenv('SMTP_PASS') ?: '';
$smtpHost = $_ENV['SMTP_HOST'] ?? getenv('SMTP_HOST') ?: 'smtp.gmail.com';
$smtpPort = (int) ($_ENV['SMTP_PORT'] ?? getenv('SMTP_PORT') ?: 587);
$smtpAuthRaw = $_ENV['SMTP_AUTH'] ?? getenv('SMTP_AUTH') ?: 'true';
$smtpAuth = filter_var($smtpAuthRaw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
if ($smtpAuth === null) {
    $smtpAuth = true;
}

$smtpTimeoutRaw = $_ENV['SMTP_TIMEOUT'] ?? getenv('SMTP_TIMEOUT') ?: '20';
$smtpTimeout = max(5, (int) $smtpTimeoutRaw);
$attemptTimeout = min($smtpTimeout, 8);

$smtpSecureRaw = strtolower($_ENV['SMTP_SECURE'] ?? getenv('SMTP_SECURE') ?: 'tls');
$smtpFrom = $_ENV['SMTP_FROM'] ?? getenv('SMTP_FROM') ?: ($smtpUser ?: 'noreply@portfolio.local');
$smtpFromName = $_ENV['SMTP_FROM_NAME'] ?? getenv('SMTP_FROM_NAME') ?: 'Portfolio Contact';
$mailTransport = strtolower($_ENV['MAIL_TRANSPORT'] ?? getenv('MAIL_TRANSPORT') ?: 'auto');
$resendApiKey = $_ENV['RESEND_API_KEY'] ?? getenv('RESEND_API_KEY') ?: '';
$fromHeader = sprintf('%s <%s>', $smtpFromName, $smtpFrom);

if ($smtpAuth && ($smtpUser === '' || $smtpPass === '')) {
    if (!($mailTransport === 'resend' || ($mailTransport === 'auto' && $resendApiKey !== ''))) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Configuração SMTP incompleta.']);
        exit;
    }
}

$sent = false;
$lastError = null;

if ($mailTransport === 'resend' || ($mailTransport === 'auto' && $resendApiKey !== '')) {
    $resendResult = sendWithResend(
        $resendApiKey,
        $fromHeader,
        CONTACT_EMAIL,
        $email,
        $subject,
        $emailBody
    );

    if ($resendResult['success']) {
        $sent = true;
    } else {
        $lastError = $resendResult['error'];
        error_log('Resend send error: ' . $lastError);
    }
}

if ($sent) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);
    exit;
}

if ($mailTransport === 'resend') {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Falha ao enviar e-mail. Tente novamente.']);
    exit;
}

$smtpHosts = [$smtpHost];
$smtpHostIpv4 = gethostbyname($smtpHost);
if ($smtpHostIpv4 !== $smtpHost && filter_var($smtpHostIpv4, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
    $smtpHosts[] = $smtpHostIpv4;
}

$smtpAttempts = [[$smtpSecureRaw, $smtpPort]];

if ($smtpSecureRaw === 'tls' && $smtpPort === 587) {
    $smtpAttempts[] = ['ssl', 465];
}

if (!in_array(['tls', 587], $smtpAttempts, true)) {
    $smtpAttempts[] = ['tls', 587];
}

if (!in_array(['ssl', 465], $smtpAttempts, true)) {
    $smtpAttempts[] = ['ssl', 465];
}

foreach ($smtpHosts as $attemptHost) {
    foreach ($smtpAttempts as [$attemptSecure, $attemptPort]) {
        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = $attemptHost;
            $mail->Port = (int) $attemptPort;
            $mail->SMTPAuth = $smtpAuth;
            $mail->SMTPAutoTLS = ($attemptSecure !== 'none' && $attemptSecure !== '');
            $mail->Timeout = $attemptTimeout;
            $mail->CharSet = 'UTF-8';

            if ($smtpAuth) {
                $mail->Username = $smtpUser;
                $mail->Password = $smtpPass;
            }

            if ($attemptSecure === 'ssl') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            } elseif ($attemptSecure === 'none' || $attemptSecure === '') {
                $mail->SMTPSecure = false;
            } else {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            }

            $mail->setFrom($smtpFrom, $smtpFromName);
            $mail->addAddress(CONTACT_EMAIL);
            $mail->addReplyTo($email, $name);

            $mail->isHTML(false);
            $mail->Subject = $subject;
            $mail->Body = $emailBody;

            $mail->send();
            $sent = true;
            break 2;
        } catch (Throwable $e) {
            $lastError = $e->getMessage();
            error_log(sprintf(
                'SMTP send error host=%s port=%d secure=%s auth=%s timeout=%d: %s',
                $attemptHost,
                (int) $attemptPort,
                (string) $attemptSecure,
                $smtpAuth ? 'true' : 'false',
                $attemptTimeout,
                $lastError
            ));
        }
    }
}

if (!$sent) {
    http_response_code(500);
    error_log('SMTP final failure: ' . ($lastError ?? 'unknown error'));
    echo json_encode(['success' => false, 'message' => 'Falha ao enviar e-mail. Tente novamente.']);
    exit;
}

http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);

?>