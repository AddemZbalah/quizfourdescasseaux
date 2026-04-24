<?php

require_once __DIR__ . '/../Entity/Question.php';
require_once __DIR__ . '/../Entity/Reponse.php';

class QuestionRepository {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Récupérer une question avec ses réponses
     */
    public function getQuestionWithAnswers($questionId) {
        $sql = "SELECT id, intitule, indice, type FROM questions WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $questionId]);
        $questionData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$questionData) {
            return null;
        }

        $question = new Question(
            $questionData['id'],
            $questionData['intitule'],
            $questionData['indice'],
            $questionData['type']
        );

        // Récupérer les réponses possibles
        $sql = "SELECT id, question_id, intitule, type, is_correct FROM reponses WHERE question_id = :question_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':question_id' => $questionId]);
        $reponses = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $reponse = new Reponse(
                $row['id'],
                $row['question_id'],
                $row['intitule'],
                $row['type'],
                $row['is_correct']
            );
            $reponses[] = $reponse->toArray();
        }

        return [
            'question' => $question->toArray(),
            'reponses' => $reponses
        ];
    }

    /**
     * Récupérer toutes les questions
     */
    public function getAllQuestions() {
        $sql = "SELECT id, intitule, indice, type FROM questions";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $questions = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $question = new Question(
                $row['id'],
                $row['intitule'],
                $row['indice'],
                $row['type']
            );
            $questions[] = $question->toArray();
        }

        return $questions;
    }

    /**
     * Récupérer une question par ID
     */
    public function getQuestionById($id) {
        $sql = "SELECT id, intitule, indice, type FROM questions WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Question(
            $row['id'],
            $row['intitule'],
            $row['indice'],
            $row['type']
        );
    }

    /**
     * Créer une nouvelle question et retourner son ID généré
     */
    public function createQuestion($intitule, $indice, $type) {
        $sql = "INSERT INTO questions (intitule, indice, type) VALUES (:intitule, :indice, :type)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':intitule' => $intitule,
            ':indice' => $indice,
            ':type' => $type
        ]);

        return $this->pdo->lastInsertId();
    }

    /**
     * Supprimer une question
     */
    public function deleteQuestion($id) {
        $sql = "DELETE FROM questions WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }
}
?>
