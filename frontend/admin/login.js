document.addEventListener('DOMContentLoaded', () => {
  // Si tu es en local, tu peux changer localhost, sinon ce sera ton URL Hostinger
  const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? 'http://localhost/quiz-four_des_casseaux/quizfourdescasseaux/backend/api'
    : 'https://espaceporcelaine.com/Quiz/backend/api';

  const loginForm = document.getElementById('loginForm');
  const messageBox = document.getElementById('loginMessage');
  const btn = loginForm.querySelector('button');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    btn.disabled = true;
    btn.innerText = 'Connexion...';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      // credentials: 'include' est vital pour stocker les cookies de session inter-domain
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        messageBox.className = 'message success';
        messageBox.innerText = 'Connexion réussie ! Redirection...';
        messageBox.style.display = 'block';
        messageBox.style.color = '#38a169'; // success color

        // Rediriger vers l'admin au bout d'une seconde
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 1000);
      } else {
        messageBox.className = 'message error';
        messageBox.innerText = data.error || 'Identifiants incorrects.';
        messageBox.style.display = 'block';
        messageBox.style.color = '#e53e3e'; // danger color
        btn.disabled = false;
        btn.innerText = 'Se connecter';
      }
    } catch (error) {
      messageBox.className = 'message error';
      messageBox.innerText = 'Erreur serveur. Veuillez réessayer plus tard.';
      messageBox.style.display = 'block';
      messageBox.style.color = '#e53e3e';
      btn.disabled = false;
      btn.innerText = 'Se connecter';
    }
  });
});