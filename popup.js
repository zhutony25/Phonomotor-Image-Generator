document.getElementById('convert-btn').addEventListener('click', convertText);
document.getElementById('input-word').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') convertText();
});

async function convertText() {
  const input = document.getElementById('input-word').value.trim();
  const outputContainer = document.getElementById('output-container');
  outputContainer.innerHTML = '';

  if (!input) {
    outputContainer.textContent = 'Please enter a word/sentence';
    return;
  }

  try {
    const response = await fetch('phonemes.json'); // Local path, no chrome.runtime
    const phonemeMap = await response.json();
    const words = input.split(/\s+/);
    const mode = document.querySelector('input[name="mode"]:checked').value;

    for (const word of words) {
      const cleanedWord = word.toLowerCase().replace(/[^a-z]/g, '');
      const wordDiv = document.createElement('div');
      wordDiv.className = 'word-container';

      const fullPhonemeString = phonemeMap[cleanedWord];
      if (!fullPhonemeString) {
        const errorSpan = document.createElement('span');
        errorSpan.textContent = '❌';
        errorSpan.title = 'Phonemes not found';
        wordDiv.appendChild(document.createTextNode(word + ' '));
        wordDiv.appendChild(errorSpan);
        outputContainer.appendChild(wordDiv);
        continue;
      }

      const phonemeList = fullPhonemeString.split(' ').map(p => p.replace(/\d/g, ''));
      const selectedPhonemes = mode === 'initial' ? [phonemeList[0]] : phonemeList;

      // Word label
      const wordText = document.createElement('div');
      wordText.className = 'word-text';
      wordText.textContent = word;
      wordDiv.appendChild(wordText);

      const phonemesContainer = document.createElement('div');
      phonemesContainer.className = 'phonemes-container';

      selectedPhonemes.forEach(phoneme => {
        const img = document.createElement('img');
        img.className = 'phoneme-image';
        img.src = `phonemes/${phoneme}.png`;
        img.alt = phoneme;

        // 🎯 Set custom size for specific phonemes
        if (['OW', 'AW', 'OY'].includes(phoneme.toUpperCase())) {
          img.style.width = '250px';
          img.style.height = '125px';
        }

        phonemesContainer.appendChild(img);
      });

      wordDiv.appendChild(phonemesContainer);
      outputContainer.appendChild(wordDiv);
    }
  } catch (error) {
    console.error('Error:', error);
    outputContainer.textContent = 'Error processing request';
  }
}

