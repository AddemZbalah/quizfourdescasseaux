-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 21 mai 2026 à 18:32
-- Version du serveur : 11.8.6-MariaDB-log
-- Version de PHP : 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `u894554401_quizcasseaux`
--

-- --------------------------------------------------------

--
-- Structure de la table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `admins`
--

INSERT INTO `admins` (`id`, `username`, `password`, `created_at`) VALUES
(1, 'admin_four-des-casseaux', '$2b$10$S0HJQ2x1r/OixbqaIp./FOGMLGFWPKWFJrT8Rh0FHwGU24sYNCoZ6', '2026-04-24 20:09:10');

-- --------------------------------------------------------

--
-- Structure de la table `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `intitule` varchar(255) NOT NULL,
  `indice` varchar(255) DEFAULT NULL,
  `type` enum('qcm','texte','images') NOT NULL,
  `ordre` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `questions`
--

INSERT INTO `questions` (`id`, `intitule`, `indice`, `type`, `ordre`) VALUES
(11, 'Quel <b>combustible</b> était utilisé pour chauffer les fours au <b>commencement</b> de la fabrication de la porcelaine ?', 'Coche la bonne réponse en t\'aidant des <b>photos sur le mur</b>', 'qcm', 1),
(12, 'Quelle est la <b>recette</b> de la porcelaine ?', 'Donne les composants', 'texte', 2),
(14, 'De quelle <b>couleur</b> est une flamme de grand feu à partir de 1300°C ?', '', 'texte', 3),
(15, 'A quel moment intervient le <b>bain d\'émail</b> ?', 'Observe bien la théière', 'qcm', 4),
(16, 'Comment s\'appelle <b>une pièce non émaillée</b> une fois finie ?', 'Observe bien l\'ours', 'texte', 5),
(17, 'Que mesuraient <b>les « montres » fusibles</b> ?', '', 'texte', 6),
(18, 'Quelle est la qualité de la porcelaine qui lui permet de stopper le <b>courant électrique</b> ?', '', 'qcm', 7),
(19, 'Quel nom donnait-on aux fours pour la <b>décoration</b> ?', '', 'texte', 8),
(20, 'Combien de <b>foyers</b> (fourneaux) le four des Casseaux possède t-il ?', 'Donne le nombre en chiffres', 'texte', 9),
(21, 'Avec quoi fermait on <b>les portes</b> du four des Casseaux ?', 'Regarde autour de toi, à la sortie du four', 'qcm', 10);

-- --------------------------------------------------------

--
-- Structure de la table `reponses`
--

CREATE TABLE `reponses` (
  `id` int(11) NOT NULL,
  `ordre` int(11) NOT NULL,
  `intitule` varchar(255) NOT NULL,
  `type` enum('qcm','texte','images') NOT NULL,
  `is_correct` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `reponses`
--

INSERT INTO `reponses` (`id`, `ordre`, `intitule`, `type`, `is_correct`) VALUES
(28, 1, 'Gaz', 'qcm', 0),
(30, 2, 'Kaolin', 'texte', 1),
(31, 2, 'Quartz', 'texte', 1),
(32, 2, 'Feldspath', 'texte', 1),
(35, 3, 'Blanche', 'texte', 1),
(36, 4, 'Avant la première cuisson', 'qcm', 0),
(37, 4, 'Après la deuxième cuisson', 'qcm', 0),
(38, 4, 'Entre les deux cuissons', 'qcm', 1),
(39, 5, 'Biscuit', 'texte', 1),
(40, 6, 'La température', 'texte', 1),
(41, 7, 'Isolante', 'qcm', 1),
(42, 7, 'Souple', 'qcm', 0),
(43, 7, 'Esthétique', 'qcm', 0),
(44, 7, 'Conductrice', 'qcm', 0),
(45, 8, 'Moufles', 'texte', 1),
(46, 9, '8', 'texte', 1),
(47, 10, 'Acier', 'qcm', 0),
(48, 10, 'Fer', 'qcm', 0),
(49, 10, 'Briques', 'qcm', 1),
(50, 10, 'Sable', 'qcm', 0),
(53, 1, 'Bois', 'qcm', 1),
(54, 1, 'Charbon', 'qcm', 0);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_admins_username` (`username`);

--
-- Index pour la table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_ordre_key` (`ordre`),
  ADD KEY `idx_questions_ordre` (`ordre`);

--
-- Index pour la table `reponses`
--
ALTER TABLE `reponses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reponses_question` (`ordre`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT pour la table `reponses`
--
ALTER TABLE `reponses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `reponses`
--
ALTER TABLE `reponses`
  ADD CONSTRAINT `fk_reponses_ordre` FOREIGN KEY (`ordre`) REFERENCES `questions` (`ordre`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
