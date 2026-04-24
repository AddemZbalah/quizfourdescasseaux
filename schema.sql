CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intitule VARCHAR(255) NOT NULL,
      indice VARCHAR(255),
    type ENUM('qcm', 'texte', 'images') NOT NULL
);

CREATE TABLE reponses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    intitule VARCHAR(255) NOT NULL,
    type ENUM('qcm', 'texte', 'images') NOT NULL,
    is_correct BOOLEAN NOT NULL,

    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

INSERT INTO questions (intitule, indice, type) VALUES
('Quelle est la capitale de la France ?', 'ça commence par un P', 'qcm'),
('Quels sont les deux ingrédients pour faire une grenadine à l''eau ?', '', 'texte'),
('Quelle est la capitale de la Suisse ?', '', 'qcm'),
('Choisis le schéma correct.', '', 'images');

INSERT INTO reponses (question_id, intitule, type, is_correct) VALUES

-- QCM (question_id = 1)
(1, 'Paris', 'qcm', TRUE),
(1, 'Lyon', 'qcm', FALSE),
(1, 'Marseille', 'qcm', FALSE),
(1, 'Toulouse', 'qcm', FALSE),

-- Question texte (question_id = 2)
(2, 'Eau', 'texte', TRUE),
(2, 'Grenadine', 'texte', TRUE),
(2, 'Sucre', 'texte', FALSE),

-- QCM (question_id = 3)
(3, 'Genève', 'qcm', TRUE),
(3, 'Paris', 'qcm', FALSE),
(3, 'Marseille', 'qcm', FALSE),
(3, 'Toulouse', 'qcm', FALSE),

-- QCM (question_id = 4)
(4, 'img_1', 'images', TRUE),
(4, 'img_2', 'images', FALSE),
(4, 'img_3', 'images', FALSE),
(4, 'img_4', 'images', FALSE);