// Photo mapping (example: syllables to image file paths)
const syllablePhotoMap = {
    "cat": "photos/cat.jpg",
    "dog": "photos/dog.jpg",
    "but": "photos/butterfly.jpg",
    "sun": "photos/sun.jpg",
    "moon": "photos/moon.jpg"
    
    // Add more syllable-image mappings here
  };
  
  // Function to map words to photos
  function mapWordsToPhotos(input) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ""; // Clear previous results
  
    const words = input.split(" ");
    words.forEach((word) => {
      // Extract starting syllable
      const lowerWord = word.toLowerCase();
      const syllable = Object.keys(syllablePhotoMap).find(key => lowerWord.startsWith(key));
      
      if (syllable) {
        // Create an <img> element for the matched photo
        const img = document.createElement("img");
        img.src = syllablePhotoMap[syllable];
        img.alt = syllable;
        resultsDiv.appendChild(img);
      }
    });
  }
  
  // Event listener for the button
  document.getElementById("mapButton").addEventListener("click", () => {
    const phraseInput = document.getElementById("phraseInput").value;
    if (phraseInput.trim() !== "") {
      mapWordsToPhotos(phraseInput.trim());
    }
  });
  