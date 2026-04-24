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
        $sql = "SELECT id, intitule, indice, type, ordre FROM questions WHERE id = :id";
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
            $questionData['type'],
            $questionData['ordre']
        );

        // Récupérer les réponses possibles en utilisant l'ordre
        $sql = "SELECT id, ordre, intitule, type, is_correct FROM reponses WHERE ordre = :ordre";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':ordre' => $questionData['ordre']]);
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

        return [
            'question' => $question->toArray(),
            'reponses' => $reponses
        ];
    }

    /**
     * Récupérer toutes les questions
     */
    public function getAllQuestions() {
        $sql = "SELECT id, intitule, indice, type, ordre FROM questions ORDER BY ordre ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $questions = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $question = new Question(
                $row['id'],
                $row['intitule'],
                $row['indice'],
                $row['type'],
                $row['ordre']
            );
            $questions[] = $question->toArray();
        }

        return $questions;
    }

    /**
     * Récupérer une question par ID
     */
    public function getQuestionById($id) {
        $sql = "SELECT id, intitule, indice, type, ordre FROM questions WHERE id = :id";
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
            $row['type'],
            $row['ordre']
        );
    }

    /**
     * Créer une nouvelle question et retourner son ID généré
     */
    public function createQuestion($intitule, $indice, $type) {
        // Trouver la valeur d'ordre la plus haute actuelle
        $stmtOrdre = $this->pdo->query("SELECT MAX(ordre) as max_ordre FROM questions");
        $row = $stmtOrdre->fetch(PDO::FETCH_ASSOC);
        $nextOrdre = $row && $row['max_ordre'] !== null ? (int)$row['max_ordre'] + 1 : 1;

        $sql = "INSERT INTO questions (intitule, indice, type, ordre) VALUES (:intitule, :indice, :type, :ordre)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':intitule' => $intitule,
            ':indice' => $indice,
            ':type' => $type,
            ':ordre' => $nextOrdre
        ]);

        return $this->pdo->lastInsertId();
    }

    /**
     * Supprimer une question
     */
    public function deleteQuestion($id) {
        // Obtenir d'abord l'ordre de la question supprimée
        $stmtGet = $this->pdo->prepare("SELECT ordre FROM questions WHERE id = :id");
        $stmtGet->execute([':id' => $id]);
        $row = $stmtGet->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $deletedOrdre = $row['ordre'];

            // Supprimer la question
            $sql = "DELETE FROM questions WHERE id = :id";
            $stmt = $this->pdo->prepare($sql);
            $result = $stmt->execute([':id' => $id]);

            if ($result && $deletedOrdre !== null) {
                // Décrémenter l'ordre des questions suivantes de 1
                $sqlUpdate = "UPDATE questions SET ordre = ordre - 1 WHERE ordre > :deletedOrdre ORDER BY ordre ASC";
                $stmtUpdate = $this->pdo->prepare($sqlUpdate);
                $stmtUpdate->execute([':deletedOrdre' => $deletedOrdre]);
            }
            return $result;
        }

        return false;
    }
}
?>
