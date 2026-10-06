<?php
// Vinayaga Construction - lightweight PHP JSON API
// Designed for shared hosting such as Hostinger. No database is required.
declare(strict_types=1);
session_start();
header('Content-Type: application/json; charset=utf-8');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_HASH = '$2y$12$5VBhaAKbU6ukgW5o7Ipg7uF1om3D1b3fSELfm3iVd.fx62ztwrELG';
const DATA_DIR = __DIR__ . DIRECTORY_SEPARATOR . 'data';
const DATA_FILE = DATA_DIR . DIRECTORY_SEPARATOR . 'site-data.json';
const UPLOAD_DIR = __DIR__ . DIRECTORY_SEPARATOR . 'uploads';

function defaults(): array {
    return [
        'projects' => [
            ['id'=>'proj_1','title'=>'Luxury Villa','location'=>'Karaikudi, Tamil Nadu','category'=>'Residential • 4500 sq.ft','status'=>'COMPLETED','completionDate'=>'2024-03','image'=>'image/ezgif-frame-050.jpg','description'=>'Modern two-story luxury residence featuring expansive glass facades, private infinity pool, and integrated landscaped terraces.'],
            ['id'=>'proj_2','title'=>'Modern Residence','location'=>'Karaikudi, Tamil Nadu','category'=>'Residential • 3200 sq.ft','status'=>'COMPLETED','completionDate'=>'2024-01','image'=>'image/ezgif-frame-049.jpg','description'=>'Contemporary family home with customized interior aesthetics, high-performance acoustic glass, and ambient evening LED illumination.'],
            ['id'=>'proj_3','title'=>'Premium Estate','location'=>'Karaikudi, Tamil Nadu','category'=>'Residential • 5800 sq.ft','status'=>'COMPLETED','completionDate'=>'2023-11','image'=>'image/ezgif-frame-048.jpg','description'=>'Expansive luxury estate built with double-height living ceilings, organic stone cladding, and wide driveway parking.'],
            ['id'=>'proj_4','title'=>'Contemporary Home','location'=>'Karaikudi, Tamil Nadu','category'=>'Residential • 2800 sq.ft','status'=>'ONGOING','completionDate'=>'2025-06','image'=>'image/ezgif-frame-047.jpg','description'=>'Minimalist architecture with optimal natural cross-ventilation, energy-efficient planning, and tailored spatial layout.'],
            ['id'=>'proj_5','title'=>'Executive Bungalow','location'=>'Karaikudi, Tamil Nadu','category'=>'Residential • 3900 sq.ft','status'=>'COMPLETED','completionDate'=>'2023-08','image'=>'image/ezgif-frame-046.jpg','description'=>'High-end bespoke bungalow designed for executive lifestyles, premium entertainment spaces, and private manicured lawn.'],
            ['id'=>'proj_6','title'=>'Designer Villa','location'=>'Karaikudi, Tamil Nadu','category'=>'Residential • 4100 sq.ft','status'=>'ONGOING','completionDate'=>'2025-08','image'=>'image/ezgif-frame-045.jpg','description'=>'Architectural masterpiece incorporating cantilevered balconies, smart automation, and bespoke interior wood accents.']
        ],
        'services' => [
            ['id'=>'serv_1','num'=>'01','icon'=>'🏛️','title'=>'Architectural Design','desc'=>'Bespoke architectural concepts crafted to reflect your personality and lifestyle vision.'],
            ['id'=>'serv_2','num'=>'02','icon'=>'📐','title'=>'Building Design & Planning','desc'=>'Comprehensive building plans with regulatory compliance and engineering precision.'],
            ['id'=>'serv_3','num'=>'03','icon'=>'🏗️','title'=>'Structural Construction','desc'=>'Robust structural frameworks using premium materials and advanced construction techniques.'],
            ['id'=>'serv_4','num'=>'04','icon'=>'🔨','title'=>'Renovation','desc'=>'Transform existing spaces with thoughtful renovation that breathes new life into your property.'],
            ['id'=>'serv_5','num'=>'05','icon'=>'✨','title'=>'Interior & Finishing','desc'=>'Luxury interior finishing with premium materials, textures and craftsmanship throughout.'],
            ['id'=>'serv_6','num'=>'06','icon'=>'⚡','title'=>'Electrical & Plumbing / MEP','desc'=>'Complete MEP systems engineered for efficiency, safety and long-term reliability.'],
            ['id'=>'serv_7','num'=>'07','icon'=>'📊','title'=>'Project Management','desc'=>'End-to-end project management ensuring timely delivery within budget and quality standards.'],
            ['id'=>'serv_8','num'=>'08','icon'=>'🖥️','title'=>'2D & 3D Planning','desc'=>'Detailed 2D floor plans and photorealistic 3D visualisations before construction begins.']
        ],
        'contact' => [
            'phone'=>'+91 9003837874','email'=>'yugaseelanv2000@gmail.com','location'=>'Karaikudi, Tamil Nadu','whatsapp'=>'919003837874','tagline'=>'FROM VISION TO REALITY.','brandMessage'=>'Premium Construction • Thoughtful Design • Trusted Execution'
        ]
    ];
}

function ensureStorage(): void {
    if (!is_dir(DATA_DIR)) @mkdir(DATA_DIR, 0755, true);
    if (!is_dir(UPLOAD_DIR)) @mkdir(UPLOAD_DIR, 0755, true);
    if (!file_exists(DATA_FILE)) {
        @file_put_contents(DATA_FILE, json_encode(defaults(), JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE), LOCK_EX);
    }
}
function readData(): array {
    ensureStorage();
    $raw = @file_get_contents(DATA_FILE);
    $data = json_decode($raw ?: '', true);
    return is_array($data) ? array_merge(defaults(), $data) : defaults();
}
function writeData(array $data): void {
    ensureStorage();
    @file_put_contents(DATA_FILE, json_encode($data, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE), LOCK_EX);
}
function jsonOut(bool $ok, $data=null, string $message=''): never {
    echo json_encode(['ok'=>$ok,'data'=>$data,'message'=>$message], JSON_UNESCAPED_UNICODE);
    exit;
}
function requireLogin(): void {
    if (empty($_SESSION['vc_admin_logged_in'])) jsonOut(false, null, 'Unauthorized');
}
function inputJson(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '', true);
    return is_array($data) ? $data : [];
}

ensureStorage();
$action = $_GET['action'] ?? '';

if ($action === 'bootstrap' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    jsonOut(true, readData());
}
if ($action === 'session' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    jsonOut(true, ['loggedIn'=>!empty($_SESSION['vc_admin_logged_in'])]);
}
if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $d=inputJson();
    $user=trim((string)($d['username']??'')); $pass=(string)($d['password']??'');
    if ($user===ADMIN_USERNAME && password_verify($pass, ADMIN_PASSWORD_HASH)) {
        $_SESSION['vc_admin_logged_in']=true;
        session_regenerate_id(true);
        jsonOut(true, ['loggedIn'=>true], 'Login successful');
    }
    http_response_code(401); jsonOut(false,null,'Invalid username or password.');
}
if ($action === 'logout' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $_SESSION=[]; if (ini_get('session.use_cookies')) { $p=session_get_cookie_params(); setcookie(session_name(),'',time()-42000,$p['path'],$p['domain'],$p['secure'],$p['httponly']); } session_destroy();
    jsonOut(true,null,'Logged out');
}

requireLogin();

if ($action === 'save_projects' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $d=inputJson(); $data=readData(); $data['projects']=is_array($d['projects']??null)?$d['projects']:[]; writeData($data); jsonOut(true,$data['projects'],'Projects saved');
}
if ($action === 'save_services' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $d=inputJson(); $data=readData(); $data['services']=is_array($d['services']??null)?$d['services']:[]; writeData($data); jsonOut(true,$data['services'],'Services saved');
}
if ($action === 'save_contact' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $d=inputJson(); $data=readData(); $data['contact']=is_array($d['contact']??null)?$d['contact']:[]; writeData($data); jsonOut(true,$data['contact'],'Contact saved');
}
if ($action === 'reset' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data=defaults(); writeData($data); jsonOut(true,$data,'Data reset');
}
if ($action === 'upload_image' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) jsonOut(false,null,'Image upload failed.');
    $f=$_FILES['image'];
    if ($f['size'] > 12*1024*1024) jsonOut(false,null,'Image is larger than 12 MB.');
    $mime=(new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    $allowed=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','image/gif'=>'gif'];
    if (!isset($allowed[$mime])) jsonOut(false,null,'Only JPG, PNG, WebP or GIF images are allowed.');
    $name='project_'.date('Ymd_His').'_'.bin2hex(random_bytes(4)).'.'.$allowed[$mime];
    $dest=UPLOAD_DIR.DIRECTORY_SEPARATOR.$name;
    if (!move_uploaded_file($f['tmp_name'],$dest)) jsonOut(false,null,'Could not save uploaded image.');
    @chmod($dest,0644);
    jsonOut(true, ['path'=>'uploads/'.$name], 'Image uploaded');
}

jsonOut(false,null,'Unknown action');
