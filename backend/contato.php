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
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_MIN = 15;

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

function checkRateLimit(string $ip): bool
{
    $file     = sys_get_temp_dir() . '/rl_' . md5($ip) . '.json';
    $now      = time();
    $window   = RATE_LIMIT_MIN * 60;
    $requests = file_exists($file)
        ? (json_decode(file_get_contents($file), true) ?? [])
        : [];

    $requests = array_filter($requests, fn($t) => ($now - $t) < $window);

    if (count($requests) >= RATE_LIMIT_MAX) return false;

    $requests[] = $now;
    file_put_contents($file, json_encode(array_values($requests)));
    return true;
}

$clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];

if (!checkRateLimit($clientIp)) {
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
$mail = new PHPMailer(true);
$smtpUser = $_ENV['SMTP_USER'] ?? getenv('SMTP_USER') ?: '';
$smtpPass = $_ENV['SMTP_PASS'] ?? getenv('SMTP_PASS') ?: '';

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username  = $smtpUser;
    $mail->Password  = $smtpPass;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet   = 'UTF-8';

    $mail->setFrom($smtpUser, 'Portfolio Contact');
    $mail->addAddress(CONTACT_EMAIL);
    $mail->addReplyTo($email, $name);

    $mail->isHTML(false);
    $mail->Subject = $subject;
    $mail->Body    = $emailBody;

    $mail->send();
    $sent = true;
} catch (Exception $e) {
    $sent = false;
}

if (!$sent) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Falha ao enviar e-mail. Tente novamente.']);
    exit;
}

http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);

?>