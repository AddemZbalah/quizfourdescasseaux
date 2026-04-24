<?php

require_once __DIR__ . '/../Entity/Admin.php';

class AdminRepository {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function findByUsername($username) {
        $stmt = $this->pdo->prepare("SELECT id, username, password FROM admins WHERE username = :username");
        $stmt->execute([':username' => $username]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            return new Admin($row['id'], $row['username'], $row['password']);
        }
        return null;
    }

    public function createAdmin($username, $passwordHash) {
        $stmt = $this->pdo->prepare("INSERT INTO admins (username, password) VALUES (:username, :password)");
        return $stmt->execute([
            ':username' => $username,
            ':password' => $passwordHash
        ]);
    }
}
?>