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
     * Récupérer les réponses possibles d'une question
     * GET /api/questions/{id}/reponses
     */
    public function getAnswersByQuestion($questionId) {
        $reponses = $this->reponseRepository->getReponsesByQuestionId($questionId);

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

            // Créer les réponses (si présentes)
            foreach ($reponses as $rep) {
                // S'assurer qu'il y a l'intitulé et le boolean
                if (isset($rep['intitule']) && isset($rep['is_correct'])) {
                    // Le type de la réponse est généralement le même que la question
                    $repType = isset($rep['type']) ? $rep['type'] : $type;
                    
                    $this->reponseRepository->createReponse(
                        $questionId, 
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
     * Répondre avec JSON et headers CORS
     */
    private function respondJson($data, $statusCode = 200) {
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
?>
