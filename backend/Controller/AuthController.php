<?php

require_once __DIR__ . '/../Repository/AdminRepository.php';

class AuthController {
    private $adminRepository;
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->adminRepository = new AdminRepository($pdo);
    }

    public function login() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!$data || !isset($data['username']) || !isset($data['password'])) {
            return $this->respondJson(['error' => 'Identifiants manquants'], 400);
        }

        $username = trim($data['username']);
        $password = $data['password'];

        $admin = $this->adminRepository->findByUsername($username);

        if ($admin && password_verify($password, $admin->password)) {
            // Créer la session
            $_SESSION['admin_id'] = $admin->id;
            $_SESSION['admin_username'] = $admin->username;

            return $this->respondJson(['success' => true, 'message' => 'Connecté']);
        }

        return $this->respondJson(['error' => 'Identifiants incorrects'], 401);
    }

    public function logout() {
        session_destroy();
        return $this->respondJson(['success' => true, 'message' => 'Déconnecté']);
    }

    public function verifyAuth() {
        if (isset($_SESSION['admin_id'])) {
            return $this->respondJson(['is_logged_in' => true, 'username' => $_SESSION['admin_username']]);
        }
        return $this->respondJson(['is_logged_in' => false], 401);
    }

    // Petite commande pour créer un admin temporaire ("admin" / "admin123")
    public function setupAdmin() {
        if ($this->adminRepository->findByUsername('admin')) {
            return $this->respondJson(['error' => 'Le compte admin existe déjà.']);
        }

        $hash = password_hash('admin123', PASSWORD_DEFAULT);
        $this->adminRepository->createAdmin('admin', $hash);
        
        return $this->respondJson(['success' => true, 'message' => 'Le compte Utilisateur: admin / Mot de passe: admin123 a été créé avec succès.']);
    }

    private function respondJson($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
?>