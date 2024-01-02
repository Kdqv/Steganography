// Récupérer les éléments du DOM
const form = document.getElementById("form");
const mode = document.getElementsByName("mode");
const message = document.getElementById("message");
const image = document.getElementById("image");
const submit = document.getElementById("submit");
const result = document.getElementById("result");

// Créer un objet FileReader
const reader = new FileReader();

// Ajouter un écouteur d'événement sur le changement de mode
for (let i = 0; i < mode.length; i++) {
  mode[i].addEventListener("change", function() {
    // Vider le message et le résultat
    message.value = "";
    result.innerHTML = "";
    // Changer le placeholder du message selon le mode
    if (mode[i].value === "encode") {
      message.placeholder = "Entrez votre message secret ici";
    } else {
      message.placeholder = "Laissez ce champ vide";
    }
  });
}

// Ajouter un écouteur d'événement sur la soumission du formulaire
form.addEventListener("submit", function(e) {
  // Empêcher le comportement par défaut du formulaire
  e.preventDefault();
  // Vider le résultat
  result.innerHTML = "";
  // Vérifier si une image est sélectionnée
  if (image.files.length > 0) {
    // Lire le fichier image comme un URL
    reader.readAsDataURL(image.files[0]);
    // Ajouter un écouteur d'événement sur le chargement du fichier
    reader.addEventListener("load", function() {
      // Créer un élément Image
      const img = new Image();
      // Définir la source de l'image comme l'URL du fichier
      img.src = reader.result;
      // Ajouter un écouteur d'événement sur le chargement de l'image
      img.addEventListener("load", function() {
        // Créer un élément canvas
        const canvas = document.createElement("canvas");
        // Récupérer le contexte 2D du canvas
        const ctx = canvas.getContext("2d");
        // Définir la largeur et la hauteur du canvas comme celles de l'image
        canvas.width = img.width;
        canvas.height = img.height;
        // Dessiner l'image sur le canvas
        ctx.drawImage(img, 0, 0);
        // Récupérer les données de l'image sous forme d'un tableau d'octets
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        // Récupérer le mode choisi
        const selectedMode = document.querySelector("input[name=\"mode\"]:checked").value;
        // Si le mode est encoder
        if (selectedMode === "encode") {
          // Récupérer le message saisi
          const msg = message.value;
          // Vérifier si le message n'est pas vide
          if (msg !== "") {
            // Encoder le message dans les données de l'image
            encodeMessage(msg, imageData.data);
            // Mettre à jour les données du canvas avec les données modifiées
            ctx.putImageData(imageData, 0, 0);
            // Créer un élément Image
            const encodedImage = new Image();
            // Définir la source de l'image comme le contenu du canvas
            encodedImage.src = canvas.toDataURL();
            // Afficher l'image encodée dans le résultat
            result.appendChild(encodedImage);
            // Afficher un message de succès
            result.appendChild(document.createElement("p")).appendChild(document.createTextNode("Message encodé avec succès."));
          }
        } else if (selectedMode === "decode") {
          // Si le mode est décoder
          // Décoder le message à partir des données de l'image
          const msg = decodeMessage(imageData.data);
          // Afficher le message décodé dans le résultat
          result.appendChild(document.createElement("p")).appendChild(document.createTextNode("Message décodé : " + msg));
        }
      });
    });
  }
});

// Définir une fonction pour encoder un message dans les données d'une image
function encodeMessage(msg, data) {
  // Convertir le message en une chaîne binaire
  let binaryMsg = "";
  for (let i = 0; i < msg.length; i++) {
    // Obtenir le code ASCII du caractère
    let ascii = msg.charCodeAt(i);
    // Convertir le code ASCII en binaire sur 8 bits
    let binary = ascii.toString(2).padStart(8, "0");
    // Ajouter le binaire à la chaîne
    binaryMsg += binary;
  }
  // Ajouter un caractère de fin de message en binaire
  binaryMsg += "00000000";
  // Parcourir les données de l'image par blocs de 4 octets
  for (let i = 0; i < data.length; i += 4) {
    // Vérifier s'il reste des bits à encoder
    if (binaryMsg.length > 0) {
      // Modifier le bit de poids faible de l'octet rouge avec le premier bit du message
      data[i] = (data[i] & 254) | parseInt(binaryMsg[0]);
      // Supprimer le premier bit du message
      binaryMsg = binaryMsg.slice(1);
    } else {
      // Arrêter la boucle si le message est entièrement encodé
      break;
    }
  }
}

// Définir une fonction pour décoder un message à partir des données d'une image
function decodeMessage(data) {
  // Créer une variable pour stocker le message binaire
  let binaryMsg = "";
  // Parcourir les données de l'image par blocs de 4 octets
  for (let i = 0; i < data.length; i += 4) {
    // Récupérer le bit de poids faible de l'octet rouge
    let bit = data[i] & 1;
    // Ajouter le bit au message binaire
    binaryMsg += bit;
    // Vérifier si le message binaire se termine par 8 zéros
    if (binaryMsg.endsWith("00000000")) {
      // Arrêter la boucle si le caractère de fin de message est atteint
      break;
    }
  }
  // Créer une variable pour stocker le message texte
  let textMsg = "";
  // Parcourir le message binaire par blocs de 8 bits
  for (let i = 0; i < binaryMsg.length; i += 8) {
    // Récupérer le bloc de 8 bits
    let binary = binaryMsg.slice(i, i + 8);
    // Convertir le binaire en code ASCII
    let ascii = parseInt(binary, 2);
    // Convertir le code ASCII en caractère
    let char = String.fromCharCode(ascii);
    // Ajouter le caractère au message texte
    textMsg += char;
  }
  // Retourner le message texte
  return textMsg;
}
