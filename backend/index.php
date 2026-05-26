<?php

// Démarrer la session au tout début
session_start();

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/Controller/QuestionController.php';
require_once __DIR__ . '/Controller/AuthController.php';

// Headers CORS
// L'utilisation des Cookies de session avec JavaScript (credentials=include)
// requiert qu'on précise l'origine exacte et pas juste une "*"
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'http://localhost';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Gérer les requêtes OPTIONS (pour les navigateurs)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Fonction utilitaire pour protéger les routes de l'API
function authorize() {
    if (!isset($_SESSION['admin_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Non autorisé. Veuillez vous connecter.']);
        exit();
    }
}

// Initialiser la base de données
$db = new Database();
$pdo = $db->connect();

// Créer les contrôleurs
$controller = new QuestionController($pdo);
$authController = new AuthController($pdo);

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
        authorize(); // Sécurité
        if (count($remaining_path) === 1) {
            // POST /api/questions (Backoffice - Ajouter Question)
            $controller->createQuestionWithAnswers();
        } elseif (count($remaining_path) === 2 && $remaining_path[1] === 'reorder') {
            // POST /api/questions/reorder
            $controller->reorderQuestion();
        } elseif (count($remaining_path) === 3 && $remaining_path[2] === 'indice') {
            // POST /api/questions/{id}/indice
            $id = $remaining_path[1];
            $controller->updateQuestionIndice($id);
        } else {
             http_response_code(404);
             echo json_encode(['error' => 'Route non trouvée']);
        }
    } elseif ($method === 'DELETE') {
        authorize(); // Sécurité
        if (count($remaining_path) === 2) {
            // DELETE /api/questions/{id}
            $id = $remaining_path[1];
            $controller->deleteQuestion($id);
        } elseif (count($remaining_path) === 3 && $remaining_path[2] === 'indice') {
            // DELETE /api/questions/{id}/indice
            $id = $remaining_path[1];
            $controller->deleteQuestionIndice($id);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Méthode non autorisée']);
    }
} elseif ($remaining_path[0] === 'reponses') {
    authorize(); // Sécurité
    if ($method === 'DELETE') {
        if (count($remaining_path) === 2) {
            // DELETE /api/reponses/{id}
            $id = $remaining_path[1];
            $controller->deleteAnswer($id);
        }
    } elseif ($method === 'POST') {
        if (count($remaining_path) === 1) {
            // POST /api/reponses (Ajouter une seule réponse à une question existante)
            $controller->addReponseToQuestion();
        }
    }
} elseif ($remaining_path[0] === 'questions-details') {
    authorize(); // Sécurité
    if ($method === 'GET') {
        // GET /api/questions-details
        $controller->getAllQuestionsWithAnswers();
    }
} elseif ($remaining_path[0] === 'login') {
    if ($method === 'POST') {
        $authController->login();
    }
} elseif ($remaining_path[0] === 'logout') {
    if ($method === 'POST') {
        $authController->logout();
    }
} elseif ($remaining_path[0] === 'upload') {
    authorize(); // Sécurité
    if ($method === 'POST') {
        $controller->uploadImage();
    }
} elseif ($remaining_path[0] === 'me') {
    if ($method === 'GET') {
        $authController->verifyAuth();
    }
} elseif ($remaining_path[0] === 'setup-admin') {
    // ROUTE SECRETE DE PREMIERE CONFIGURATION
    if ($method === 'GET') {
        $authController->setupAdmin();
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route non trouvée']);
}
?>
