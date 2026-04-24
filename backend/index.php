<?php

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/Controller/QuestionController.php';

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Gérer les requêtes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialiser la base de données
$db = new Database();
$pdo = $db->connect();

// Créer le contrôleur
$controller = new QuestionController($pdo);

// Parser la route
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Exemple: /quiz-four_des_casseaux/backend/api/questions/1
$path_parts = explode('/', $request_uri);

// Trouver l'index de 'api' dans les parties
$api_index = array_search('api', $path_parts);

if ($api_index === false) {
    http_response_code(404);
    echo json_encode(['error' => 'Route non trouvée']);
    exit();
}

// Récupérer la partie après 'api'
$remaining_path = array_slice($path_parts, $api_index + 1);
$remaining_path = array_filter($remaining_path); // Enlever les éléments vides

// Routes
$method = $_SERVER['REQUEST_METHOD'];

if (empty($remaining_path)) {
    // GET /api
    if ($method === 'GET') {
        echo json_encode(['message' => 'API Quiz Four des Casseaux']);
        exit();
    }
} elseif ($remaining_path[0] === 'questions') {
    
    if ($method === 'GET') {
        
        if (count($remaining_path) === 1) {
            // GET /api/questions
            $controller->getAllQuestions();
        } elseif (count($remaining_path) === 2) {
            // GET /api/questions/{id}
            $id = $remaining_path[1];
            $controller->getQuestion($id);
        } elseif (count($remaining_path) === 3 && $remaining_path[2] === 'reponses') {
            // GET /api/questions/{id}/reponses
            $id = $remaining_path[1];
            $controller->getAnswersByQuestion($id);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Route non trouvée']);
        }
    } elseif ($method === 'POST') {
        if (count($remaining_path) === 1) {
            // POST /api/questions (Backoffice - Ajouter Question)
            $controller->createQuestionWithAnswers();
        } else {
             http_response_code(404);
             echo json_encode(['error' => 'Route non trouvée']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Méthode non autorisée']);
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route non trouvée']);
}
?>
