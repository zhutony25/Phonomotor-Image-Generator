// Utility: Fetch JSON data
async function fetchPhonemeMap() {
  const response = await fetch('phonemes.json');
  return await response.json();
}

// Utility: Convert image URL to base64
function toBase64(url) {
  return fetch(url)
    .then(res => res.blob())
    .then(blob => new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    }));
}

// Convert Text to Phoneme Images
async function convertText() {
  const input = document.getElementById('input-word').value.trim();
  const output = document.getElementById('output-container');
  output.innerHTML = '';

  if (!input) {
    output.textContent = 'Please enter a word or sentence.';
    return;
  }

  const phonemeMap = await fetchPhonemeMap();
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const words = input.split(/\s+/);

  for (const word of words) {
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
    const phonemes = phonemeMap[cleaned]?.split(' ').map(p => p.replace(/\d/g, ''));

    const container = document.createElement('div');
    container.className = 'word-container';

    const title = document.createElement('div');
    title.className = 'word-text';
    title.textContent = word;
    container.appendChild(title);

    const imgRow = document.createElement('div');
    imgRow.className = 'phonemes-container';

    if (!phonemes) {
      const failIcon = document.createElement('span');
      failIcon.textContent = '❌';
      failIcon.title = 'Phonemes not found';
      container.appendChild(failIcon);
    } else {
      const selected = mode === 'initial' ? [phonemes[0]] : phonemes;
      for (const phoneme of selected) {
        const img = document.createElement('img');
        img.src = `phonemes/${phoneme}.png`;
        img.alt = phoneme;
        img.className = 'phoneme-image';

        if (['AW', 'OY'].includes(phoneme.toUpperCase())) {
          img.style.width = '250px';
          img.style.height = '125px';
        }

        imgRow.appendChild(img);
      }
    }

    container.appendChild(imgRow);
    output.appendChild(container);
  }
}

// download output into a pdf format
async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const output = document.getElementById('output-container');
  const blocks = output.querySelectorAll('.word-container');

  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 5;
  const blockPadding = 8;
  const imgHeight = 36;
  const imgSpacing = 5;
  const wordTextHeight = 5;

  let y = margin;

  for (const block of blocks) {
    const word = block.querySelector('.word-text')?.textContent || '';
    const images = block.querySelectorAll('img');

    // Arrange images into lines that fit within block width
    const blockWidth = pageWidth - margin * 2;
    const maxContentWidth = blockWidth - blockPadding * 2;

    let lines = [];
    let currentLine = [];
    let currentLineWidth = 0;

    for (const img of images) {
      // calculate image width based on aspect ratio for fixed height
      const aspectRatio = img.naturalWidth / img.naturalHeight || 1;
      const imgWidth = imgHeight * aspectRatio;

      // check if current image fits in current line
      if (currentLineWidth + imgWidth > maxContentWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [];
        currentLineWidth = 0;
      }

      currentLine.push({ img, imgWidth });
      currentLineWidth += imgWidth + imgSpacing;
    }
    if (currentLine.length) lines.push(currentLine);

    // Calculate block height
    const blockHeight = wordTextHeight + lines.length * (imgHeight + 5) + blockPadding * 2;

    // Page break if needed
    if (y + blockHeight > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }

    // Draw background rectangle (light gray)
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(margin, y, blockWidth, blockHeight, 3, 3, 'F');

    // Draw word centered
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.text(word, margin + blockWidth / 2, y + blockPadding + wordTextHeight, { align: 'center' });

    // Draw images centered in lines
    let imageYOffset = y + blockPadding + wordTextHeight + 5;
    pdf.setFont('helvetica', 'normal');

    for (const line of lines) {
      // total width of line images + spacing for centering
      const totalLineWidth = line.reduce((sum, { imgWidth }) => sum + imgWidth, 0) + imgSpacing * (line.length - 1);
      let xOffset = margin + (blockWidth - totalLineWidth) / 2;

      for (const { img, imgWidth } of line) {
        try {
          const imgData = await toBase64(img.src);
          pdf.addImage(imgData, 'PNG', xOffset, imageYOffset, imgWidth, imgHeight);
          xOffset += imgWidth + imgSpacing;
        } catch (e) {
          console.error('Error loading image for PDF:', img.src, e);
        }
      }

      imageYOffset += imgHeight + 5;
    }

    y += blockHeight + 10; // space between blocks
  }

  pdf.save('phoneme_images.pdf');
}

// ZIP Download
async function downloadZIP() {
  const zip = new JSZip();
  const blocks = document.querySelectorAll('.word-container');

  if (blocks.length === 0) {
    alert('No words to export.');
    return;
  }

  for (const block of blocks) {
    const word = block.querySelector('.word-text')?.textContent.trim() || 'word';

    // Render the block as a canvas
    const canvas = await html2canvas(block, { backgroundColor: '#ffffff' });

    // Convert canvas to blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

    // Use sanitized filename (remove spaces, special chars)
    const safeWord = word.replace(/[^\w\-]/g, '_');

    zip.file(`${safeWord}.png`, blob);
  }

  // Generate zip blob and trigger download
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'phoneme_images.zip');
}


// UI Behavior and event listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('convert-btn').addEventListener('click', convertText);
  document.getElementById('input-word').addEventListener('keypress', e => {
    if (e.key === 'Enter') convertText();
  });

  document.getElementById('download-pdf-btn').addEventListener('click', downloadPDF);
  document.getElementById('download-png-btn').addEventListener('click', downloadZIP);

  document.getElementById('download-btn').addEventListener('click', () => {
    const menu = document.getElementById('download-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', (e) => {
    const btn = document.getElementById('download-btn');
    const menu = document.getElementById('download-menu');
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = 'none';
    }
  });
});