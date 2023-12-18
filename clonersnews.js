// script.js
const baseUrl = 'https://hacker-news.firebaseio.com/v0/';

let pageStoryIds = [];

document.addEventListener('DOMContentLoaded', () => {
  // Sélectionne le conteneur où afficher les données
  const dataContainer = document.getElementById('dataContainer');
  const sectionBtn = document.getElementById('sectionBtn');

  sectionBtn.addEventListener('change', () => {
    const selectedSection = sectionBtn.value;
    const apiUrl = `${baseUrl}${selectedSection}.json`;

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erreur de réseau - ${response.status}`);
        }
        return response.json();
      })
      .then(storyIds => {
        maxItem = storyIds[0]
        const startIndex = (currentPage - 1) * 10;
        const endIndex = currentPage * 10;
        if (flag == 0){
          pageStoryIds = storyIds.slice(startIndex, endIndex);
        } else {
          pageStoryIds = [160704, 126809]
        }
        // Fetch details of each story, job, and poll
        const itemPromises = pageStoryIds.map(itemId =>
            fetch(`${baseUrl}item/${itemId}.json`).then(response => response.json())
        );

        console.log(itemPromises);

        // Wait for all item details to be fetched
        return Promise.all(itemPromises);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des données:', error);
      });
  });
});
