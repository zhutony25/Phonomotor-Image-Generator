document.getElementById('convert-btn').addEventListener('click', async () => {
    const input = document.getElementById('input-word').value.trim();
    const outputDiv = document.getElementById('phonemes-output');
    const imageElement = document.getElementById('output-image');
  
    if (!input) {
      outputDiv.textContent = 'Please enter a word';
      return;
    }
  
    try {
      // Load phoneme mapping
      const response = await fetch(chrome.runtime.getURL('phonemes.json'));
      const phonemeMap = await response.json();
  
      // Convert to phonemes
      const words = input.split(' ');
      const firstWord = words[0].toLowerCase();
      const phonemes = phonemeMap[firstWord];
  
      if (!phonemes) {
        outputDiv.textContent = 'Word not found in dictionary';
        return;
      }
  
      const firstPhoneme = phonemes.split(' ')[0].toLowerCase();
      outputDiv.textContent = `Phonemes: ${phonemes}`;
  
      // Show first phoneme image
      imageElement.src = chrome.runtime.getURL(`images/${firstPhoneme}.png`);
      imageElement.hidden = false;
  
    } catch (error) {
      console.error('Error:', error);
      outputDiv.textContent = 'Error processing request';
    }
  });