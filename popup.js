document.getElementById('convert-btn').addEventListener('click', async () => {
    const input = document.getElementById('input-word').value.trim();
    const outputContainer = document.getElementById('output-container');
    outputContainer.innerHTML = ''; // Clear previous results
  
    if (!input) {
      outputContainer.textContent = 'Please enter a sentence';
      return;
    }
  
    try {
      // Load phoneme mapping
      const response = await fetch(chrome.runtime.getURL('phonemes.json'));
      const phonemeMap = await response.json();
  
      // Split into words and process
      const words = input.split(/\s+/);
      
      for (const word of words) {
        const cleanedWord = word.toLowerCase().replace(/[^a-z]/g, '');
        const phonemes = phonemeMap[cleanedWord];
        
        // Create word container
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word-container';
        
        // Add word text
        const wordText = document.createElement('div');
        wordText.textContent = word;
        wordDiv.appendChild(wordText);
  
        if (phonemes) {
          const firstPhoneme = phonemes.split(' ')[0];
          const img = document.createElement('img');
          img.className = 'phoneme-image';
          img.src = chrome.runtime.getURL(`images/${firstPhoneme}.png`);
          img.alt = firstPhoneme;
          wordDiv.appendChild(img);
        } else {
          const errorSpan = document.createElement('span');
          errorSpan.textContent = '❌';
          errorSpan.title = 'Word not found';
          wordDiv.appendChild(errorSpan);
        }
  
        outputContainer.appendChild(wordDiv);
      }
  
    } catch (error) {
      console.error('Error:', error);
      outputContainer.textContent = 'Error processing request';
    }
  });