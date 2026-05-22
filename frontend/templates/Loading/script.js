const templateFile = await fetch(
  "./frontend/templates/Loading/loading-template.html",
);
const template = await templateFile.text();

const Loading = {};

Loading.render = function (text) {
  // Remplacement du tag par le texte souhaité, ou une valeur par défaut
  return template.replace("{{loading_text}}", text || "Veuillez patienter...");
};

export { Loading };
