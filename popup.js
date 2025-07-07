// import for pdf download
// import { jsPDF } from './lib/jspdf.umd.min.js';

// declare convert putton + listener for user to press enter key
document.getElementById('convert-btn').addEventListener('click', convertText);
document.getElementById('input-word').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') convertText();
});

// main conversion function
async function convertText() {

  // declare input + output container
  const input = document.getElementById('input-word').value.trim();
  const outputContainer = document.getElementById('output-container');
  outputContainer.innerHTML = '';

  // check for null input
  if (!input) {
    outputContainer.textContent = 'Please enter a word/sentence';
    return;
  }

  // try to convert each word
  try {

    // declare vars
    const response = await fetch('phonemes.json');
    const phonemeMap = await response.json();
    const words = input.split(/\s+/);
    const mode = document.querySelector('input[name="mode"]:checked').value;

    // work through all words in box
    for (const word of words) {

      // clean + place word into container
      const cleanedWord = word.toLowerCase().replace(/[^a-z]/g, '');
      const wordDiv = document.createElement('div');
      wordDiv.className = 'word-container';

      // get phonemes via json map
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
        if (['AW', 'OY'].includes(phoneme.toUpperCase())) {
          img.style.width = '250px';
          img.style.height = '125px';
        }

        phonemesContainer.appendChild(img);
      });

      wordDiv.appendChild(phonemesContainer);
      outputContainer.appendChild(wordDiv);
    }
  } catch (error) { // catch block for non existing word
    console.error('Error:', error);
    outputContainer.textContent = 'Error processing request';
  }
}

// helper method for image download
function getBase64FromImage(url) {
  return fetch(url)
    .then(res => res.blob())
    .then(blob => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    }));
}

document.getElementById('download-pdf').addEventListener('click', async () => {
  const pdf = new window.jspdf.jsPDF();
  const outputContainer = document.getElementById('output-container');
  const wordBlocks = outputContainer.querySelectorAll('.word-container');

  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 5;

  let yOffset = margin;
  const blockPadding = 8;
  const blockWidth = pageWidth - margin * 2;
  const imgHeight = 40;
  const imgSpacing = 5;

  for (const block of wordBlocks) {
    const word = block.querySelector('.word-text')?.textContent || '';

    // Start drawing block
    // Estimate block height dynamically after laying out images

    // Get phoneme images
    const images = block.querySelectorAll('img');
    
    // Calculate how many lines images will take:
    let lines = [];
    let currentLine = [];
    let currentLineWidth = 0;
    const maxContentWidth = blockWidth - blockPadding * 2;

    for (const img of images) {
      // Estimate image width based on aspect ratio for height = imgHeight
      const aspectRatio = img.naturalWidth / img.naturalHeight || 1;
      const imgWidth = imgHeight * aspectRatio;

      if (currentLineWidth + imgWidth > maxContentWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [];
        currentLineWidth = 0;
      }

      currentLine.push({ img, imgWidth });
      currentLineWidth += imgWidth + imgSpacing;
    }
    if (currentLine.length) lines.push(currentLine);

    // Calculate total height: 
    // word text height + (lines * imgHeight) + padding top and bottom
    const wordTextHeight = 10;
    const blockHeight = wordTextHeight + lines.length * (imgHeight + 5) + blockPadding * 2;

    // Page break if needed
    if (yOffset + blockHeight > pageHeight - margin) {
      pdf.addPage();
      yOffset = margin;
    }

    // Draw background rectangle (light gray)
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(margin, yOffset, blockWidth, blockHeight, 3, 3, 'F');

    // Draw word centered
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.text(word, margin + blockWidth / 2, yOffset + blockPadding + wordTextHeight, { align: 'center' });

// Reset to normal if needed later
pdf.setFont('helvetica', 'normal');

    // Draw phoneme images lines below word text
    let imageYOffset = yOffset + blockPadding + wordTextHeight + 5;

    for (const line of lines) {
      // Calculate total line width for centering
      const totalLineWidth = line.reduce((sum, { imgWidth }) => sum + imgWidth, 0) + imgSpacing * (line.length - 1);
      let xOffset = margin + (blockWidth - totalLineWidth) / 2;

      for (const { img, imgWidth } of line) {
        try {
          const imgData = await getBase64FromImage(img.src);
          pdf.addImage(imgData, 'PNG', xOffset, imageYOffset, imgWidth, imgHeight);
          xOffset += imgWidth + imgSpacing;
        } catch (e) {
          console.error('Error loading image for PDF:', img.src, e);
        }
      }

      imageYOffset += imgHeight + 5;
    }

    yOffset += blockHeight + 10; // space between blocks
  }

  pdf.save('phonomotor_images.pdf');
});