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
    public function getReponsesByQuestionId($ordre) {
        $sql = "SELECT id, ordre, intitule, type, is_correct FROM reponses WHERE ordre = :ordre";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':ordre' => $ordre]);
        $reponses = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $reponse = new Reponse(
                $row['id'],
                $row['ordre'],
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
        $sql = "SELECT id, ordre, intitule, type, is_correct FROM reponses WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return new Reponse(
            $row['id'],
            $row['ordre'],
            $row['intitule'],
            $row['type'],
            $row['is_correct']
        );
    }

    /**
     * Récupérer toutes les réponses
     */
    public function getAllReponses() {
        $sql = "SELECT id, ordre, intitule, type, is_correct FROM reponses";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $reponses = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $reponse = new Reponse(
                $row['id'],
                $row['ordre'],
                $row['intitule'],
                $row['type'],
                $row['is_correct']
            );
            $reponses[] = $reponse->toArray();
        }

        return $reponses;
    }

    /**
     * Créer une nouvelle réponse
     */
    public function createReponse($ordre, $intitule, $type, $isCorrect) {
        $sql = "INSERT INTO reponses (ordre, intitule, type, is_correct) VALUES (:ordre, :intitule, :type, :is_correct)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            ':ordre' => $ordre,
            ':intitule' => $intitule,
            ':type' => $type,
            ':is_correct' => (int) $isCorrect // Convert boolean to integer for SQL
        ]);
    }

    /**
     * Supprimer une réponse
     */
    public function deleteReponse($id) {
        $sql = "DELETE FROM reponses WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }
}
?>
