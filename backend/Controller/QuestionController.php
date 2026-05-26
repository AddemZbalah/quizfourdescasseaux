<?php

require_once __DIR__ . '/../Repository/QuestionRepository.php';
require_once __DIR__ . '/../Repository/ReponseRepository.php';

class QuestionController {
    private $questionRepository;
    private $reponseRepository;
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->questionRepository = new QuestionRepository($pdo);
        $this->reponseRepository = new ReponseRepository($pdo);
    }

    /**
     * Récupérer une question avec ses réponses
     * GET /api/questions/{id}
     */
    public function getQuestion($id) {
        $result = $this->questionRepository->getQuestionWithAnswers($id);

        if (!$result) {
            return $this->respondJson(['error' => 'Question non trouvée'], 404);
        }

        return $this->respondJson($result);
    }

    /**
     * Récupérer toutes les questions
     * GET /api/questions
     */
    public function getAllQuestions() {
        $questions = $this->questionRepository->getAllQuestions();
        return $this->respondJson(['questions' => $questions]);
    }

    /**
     * Récupérer toutes les questions AVEC leurs réponses pour l'admin
     * GET /api/questions-details
     */
    public function getAllQuestionsWithAnswers() {
        $questions = $this->questionRepository->getAllQuestions();
        foreach ($questions as $key => $q) {
            $questions[$key]['reponses'] = $this->reponseRepository->getReponsesByQuestionId($q['ordre']);
        }
        return $this->respondJson(['questions' => $questions]);
    }

    /**
     * Récupérer les réponses possibles d'une question
     * GET /api/questions/{id}/reponses
     */
    public function getAnswersByQuestion($questionId) {
        $question = $this->questionRepository->getQuestionById($questionId);
        if (!$question) {
            return $this->respondJson(['error' => 'Question non trouvée'], 404);
        }
        
        $reponses = $this->reponseRepository->getReponsesByQuestionId($question->ordre);

        if (empty($reponses)) {
            return $this->respondJson(['error' => 'Aucune réponse trouvée'], 404);
        }

        return $this->respondJson(['reponses' => $reponses]);
    }

    /**
     * Créer une question avec ses réponses (admin)
     * POST /api/questions
     */
    public function createQuestionWithAnswers() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!$data || !isset($data['intitule']) || !isset($data['type'])) {
            return $this->respondJson(['error' => 'Données invalides'], 400);
        }

        $intitule = trim($data['intitule']);
        $indice = isset($data['indice']) ? trim($data['indice']) : null;
        $type = $data['type']; // 'qcm', 'texte', 'images'
        $reponses = isset($data['reponses']) && is_array($data['reponses']) ? $data['reponses'] : [];

        try {
            $this->pdo->beginTransaction();

            // Créer la question
            $questionId = $this->questionRepository->createQuestion($intitule, $indice, $type);
            
            // On récupère la question créée pour avoir son "ordre"
            $questionCreee = $this->questionRepository->getQuestionById($questionId);
            $ordreId = $questionCreee->ordre;

            // Créer les réponses (si présentes)
            foreach ($reponses as $rep) {
                // S'assurer qu'il y a l'intitulé et le boolean
                if (isset($rep['intitule']) && isset($rep['is_correct'])) {
                    // Le type de la réponse est généralement le même que la question
                    $repType = isset($rep['type']) ? $rep['type'] : $type;
                    
                    $this->reponseRepository->createReponse(
                        $ordreId, 
                        trim($rep['intitule']), 
                        $repType, 
                        (bool)$rep['is_correct']
                    );
                }
            }

            $this->pdo->commit();

            return $this->respondJson([
                'success' => true,
                'message' => 'Question créée avec succès',
                'question_id' => $questionId
            ], 201);
            
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return $this->respondJson(['error' => 'Erreur lors de la création : ' . $e->getMessage()], 500);
        }
    }

    /**
     * Ajouter une réponse à une question (admin)
     * POST /api/reponses
     */
    public function addReponseToQuestion() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!$data || !isset($data['ordre']) || !isset($data['intitule']) || !isset($data['is_correct'])) {
            return $this->respondJson(['error' => 'Données invalides'], 400);
        }

        $ordre = $data['ordre'];
        $intitule = trim($data['intitule']);
        $isCorrect = (bool)$data['is_correct'];

        // Trouver la question correspondante pour avoir son type
        $questions = $this->questionRepository->getAllQuestions();
        $type = 'qcm'; // Default
        foreach($questions as $q) {
            if($q['ordre'] == $ordre) {
                $type = $q['type'];
                break;
            }
        }

        try {
            $this->reponseRepository->createReponse(
                $ordre, 
                $intitule, 
                $type, 
                $isCorrect
            );

            return $this->respondJson([
                'success' => true,
                'message' => 'Réponse ajoutée avec succès'
            ], 201);
            
        } catch (Exception $e) {
            return $this->respondJson(['error' => 'Erreur lors de l\'ajout : ' . $e->getMessage()], 500);
        }
    }

    /**
     * Supprimer une question (et ses réponses en cascade)
     * DELETE /api/questions/{id}
     */
    public function deleteQuestion($id) {
        $success = $this->questionRepository->deleteQuestion($id);
        if ($success) {
            return $this->respondJson(['success' => true, 'message' => 'Question supprimée']);
        }
        return $this->respondJson(['error' => 'Erreur lors de la suppression de la question'], 500);
    }

    /**
     * Réordonner une question
     * POST /api/questions/reorder
     * Body: { id: number, new_ordre: number }
     */
    public function reorderQuestion() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!$data || !isset($data['id']) || !isset($data['new_ordre'])) {
            return $this->respondJson(['error' => 'Données invalides'], 400);
        }

        $id = (int)$data['id'];
        $newOrdre = (int)$data['new_ordre'];

        if ($id <= 0 || $newOrdre <= 0) {
            return $this->respondJson(['error' => 'Paramètres invalides'], 400);
        }

        $result = $this->questionRepository->moveQuestionToOrder($id, $newOrdre);
        if (!isset($result['success']) || !$result['success']) {
            return $this->respondJson([
                'error' => isset($result['error']) ? $result['error'] : 'Erreur lors du réordonnancement'
            ], 400);
        }

        return $this->respondJson([
            'success' => true,
            'message' => 'Ordre de la question mis à jour'
        ]);
    }

    /**
     * Mettre à jour l'indice d'une question
     * POST /api/questions/{id}/indice
     */
    public function updateQuestionIndice($id) {
        $question = $this->questionRepository->getQuestionById($id);
        if (!$question) {
            return $this->respondJson(['error' => 'Question non trouvée'], 404);
        }

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!$data || !isset($data['indice'])) {
            return $this->respondJson(['error' => 'Données invalides'], 400);
        }

        $indice = trim((string)$data['indice']);
        if ($indice === '') {
            return $this->respondJson(['error' => 'Indice vide. Utilisez la suppression d\'indice.'], 400);
        }

        $success = $this->questionRepository->updateQuestionIndice((int)$id, $indice);
        if (!$success) {
            return $this->respondJson(['error' => 'Erreur lors de la mise à jour de l\'indice'], 500);
        }

        return $this->respondJson([
            'success' => true,
            'message' => 'Indice mis à jour'
        ]);
    }

    /**
     * Supprimer l'indice d'une question
     * DELETE /api/questions/{id}/indice
     */
    public function deleteQuestionIndice($id) {
        $question = $this->questionRepository->getQuestionById($id);
        if (!$question) {
            return $this->respondJson(['error' => 'Question non trouvée'], 404);
        }

        $success = $this->questionRepository->clearQuestionIndice((int)$id);
        if (!$success) {
            return $this->respondJson(['error' => 'Erreur lors de la suppression de l\'indice'], 500);
        }

        return $this->respondJson([
            'success' => true,
            'message' => 'Indice supprimé'
        ]);
    }

    /**
     * Supprimer une réponse
     * DELETE /api/reponses/{id}
     */
    public function deleteAnswer($id) {
        $success = $this->reponseRepository->deleteReponse($id);
        if ($success) {
            return $this->respondJson(['success' => true, 'message' => 'Réponse supprimée']);
        }
        return $this->respondJson(['error' => 'Erreur lors de la suppression de la réponse'], 500);
    }

    /**
     * Uploader une image
     * POST /api/upload
     */
    public function uploadImage() {
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            return $this->respondJson(['error' => 'Aucun fichier reçu ou erreur d\'upload'], 400);
        }

        $file = $_FILES['image'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!in_array($file['type'], $allowedTypes)) {
            return $this->respondJson(['error' => 'Type de fichier non autorisé. Uniquement JPG, PNG, GIF, WEBP.'], 400);
        }

        // Créer un nom unique pour éviter les collisions
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $newFilename = uniqid('img_') . '.' . $extension;
        
        // Chemin absolu vers le dossier images 
        $targetDir = realpath(__DIR__ . '/../../frontend/assets/questions-images/');
        if (!$targetDir) {
            // Créer le dossier s'il n'existe pas (par sécurité)
            mkdir(__DIR__ . '/../../frontend/assets/questions-images/', 0777, true);
            $targetDir = realpath(__DIR__ . '/../../frontend/assets/questions-images/');
        }

        $targetFile = $targetDir . '/' . $newFilename;

        if (move_uploaded_file($file['tmp_name'], $targetFile)) {
            return $this->respondJson([
                'success' => true,
                'filename' => $newFilename
            ]);
        } else {
            return $this->respondJson(['error' => 'Erreur lors de la sauvegarde du fichier sur le serveur'], 500);
        }
    }

    /**
     * Répondre avec JSON et headers CORS
     */
    private function respondJson($data, $statusCode = 200) {
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'http://localhost';
        header('Content-Type: application/json');
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
?>
