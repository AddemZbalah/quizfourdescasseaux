-- Création de la base de données (décommenter si besoin)
-- CREATE DATABASE IF NOT EXISTS four_des_casseaux;
-- USE four_des_casseaux;

-- 1. La table questionnaire
CREATE TABLE questionnaire (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT
);

-- 2. La table question
CREATE TABLE question (
    id INT AUTO_INCREMENT PRIMARY KEY,
    questionnaire_id INT NOT NULL,
    intitule VARCHAR(255) NOT NULL,
    type ENUM('qcm', 'text') NOT NULL,
    ordre INT NOT NULL,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaire(id) ON DELETE CASCADE
);

-- 3. La table reponse_possible (Uniquement pour les QCM)
CREATE TABLE reponse_possible (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    texte VARCHAR(255) NOT NULL,
    FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE
);

-- 4. La table reponse_utilisateur (Pour stocker les résultats)
CREATE TABLE reponse_utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visiteur_id VARCHAR(255) NOT NULL,
    question_id INT NOT NULL,
    reponse_choisie_id INT NULL,
    texte_libre TEXT NULL,
    FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE,
    FOREIGN KEY (reponse_choisie_id) REFERENCES reponse_possible(id) ON DELETE SET NULL
);
