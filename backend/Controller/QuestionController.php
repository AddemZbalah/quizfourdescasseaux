<?php

require_once __DIR__ . '/../Repository/QuestionRepository.php';
require_once __DIR__ . '/../Repository/ReponseRepository.php';

class QuestionController {
    private $questionRepository;
    private $reponseRepository;

    public function __construct($pdo) {
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
