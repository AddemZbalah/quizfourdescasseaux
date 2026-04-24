<?php

require_once __DIR__ . '/../Entity/Reponse.php';

class ReponseRepository {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Récupérer toutes les réponses d'une question
     */
    public function getReponsesByQuestionId($questionId) {
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

        return $reponses;
    }

    /**
     * Récupérer une réponse par ID
     */
    public function getReponseById($id) {
        $sql = "SELECT id, question_id, intitule, type, is_correct FROM reponses WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Reponse(
            $row['id'],
            $row['question_id'],
            $row['intitule'],
            $row['type'],
            $row['is_correct']
        );
    }

    /**
     * Récupérer toutes les réponses
     */
    public function getAllReponses() {
        $sql = "SELECT id, question_id, intitule, type, is_correct FROM reponses";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
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

        return $reponses;
    }
}
?>
