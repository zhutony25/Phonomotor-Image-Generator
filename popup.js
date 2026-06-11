// Utility: Fetch pronunciation data
async function fetchPhonemeMap() {
  const response = await fetch('phonemes.json');
  return await response.json();
}

// American English IPA symbols for the CMU/ARPAbet pronunciations in phonemes.json.
const ARPABET_TO_IPA = {
  AA: 'ɑ',
  AE: 'æ',
  AO: 'ɑ',
  AW: 'aʊ',
  AY: 'aɪ',
  B: 'b',
  CH: 'tʃ',
  D: 'd',
  DH: 'ð',
  EH: 'ɛ',
  ER: 'ɝ',
  EY: 'e',
  F: 'f',
  G: 'ɡ',
  HH: 'h',
  IH: 'ɪ',
  IY: 'i',
  JH: 'dʒ',
  K: 'k',
  L: 'l',
  M: 'm',
  N: 'n',
  NG: 'ŋ',
  OW: 'oʊ',
  OY: 'ɔɪ',
  P: 'p',
  R: 'ɹ',
  S: 's',
  SH: 'ʃ',
  T: 't',
  TH: 'θ',
  UH: 'ʊ',
  UW: 'u',
  V: 'v',
  W: 'w',
  Y: 'j',
  Z: 'z',
  ZH: 'ʒ'
};

// Current PNG filenames are readable asset names rather than literal IPA characters.
const IPA_TO_IMAGE = {
  'ɑ': 'o_short',
  'æ': 'a_short',
  'ʌ': 'u_short',
  'ə': 'u_short',
  'ɔ': 'o_short',
  'aʊ': 'ow',
  'aɪ': 'i_long',
  'b': 'b',
  'tʃ': 'ch',
  'd': 'd',
  'ð': 'th_voiced',
  'ɛ': 'e_short',
  'ɝ': 'er',
  'ɚ': 'er',
  'e': 'a_long',
  'eɪ': 'a_long',
  'f': 'f',
  'ɡ': 'g',
  'h': 'h',
  'ɪ': 'i_short',
  'i': 'e_long',
  'dʒ': 'j',
  'k': 'k',
  'l': 'l',
  'm': 'm',
  'n': 'n',
  'ŋ': 'ng',
  'oʊ': 'o_long',
  'ɔɪ': 'oy',
  'p': 'p',
  'ɹ': 'r',
  's': 's',
  'ʃ': 'sh',
  't': 't',
  'θ': 'th',
  'ʊ': 'omega',
  'u': 'oo',
  'v': 'v',
  'w': 'w',
  'j': 'y',
  'z': 'z',
  'ʒ': 'zh',
  'ɔɹ': 'or'
};

const WIDE_IMAGE_NAMES = new Set(['ow', 'oy', 'or']);

const WORD_IPA_OVERRIDES = {
  are: ['ɑ', 'ɹ'],
  for: ['f', 'ɔɹ'],
  or: ['ɔɹ'],
  will: ['w', 'ɪ', 'l']
};

function parseArpabetToken(token) {
  const stressMatch = token.match(/\d/);
  return {
    raw: token,
    base: token.replace(/\d/g, ''),
    stress: stressMatch ? stressMatch[0] : ''
  };
}

function arpabetTokenToIpa(token) {
  if (token.base === 'AH') {
    return token.stress === '0' ? 'ə' : 'ʌ';
  }

  if (token.base === 'ER') {
    return token.stress === '0' ? 'ɚ' : 'ɝ';
  }

  return ARPABET_TO_IPA[token.base] || token.base.toLowerCase();
}

function createIpaEntry(ipa, sourceTokens) {
  return {
    ipa,
    imageName: IPA_TO_IMAGE[ipa] || '_default',
    sourceTokens
  };
}

function ipaSymbolsToEntries(ipaSymbols, sourceLabel) {
  return ipaSymbols.map(ipa => createIpaEntry(ipa, [sourceLabel]));
}

function wordToIpaEntries(word, pronunciation) {
  if (Object.prototype.hasOwnProperty.call(WORD_IPA_OVERRIDES, word)) {
    return ipaSymbolsToEntries(WORD_IPA_OVERRIDES[word], 'override');
  }

  return pronunciationToIpaEntries(pronunciation);
}

function pronunciationToIpaEntries(pronunciation) {
  const tokens = pronunciation.split(/\s+/).filter(Boolean).map(parseArpabetToken);
  const entries = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const current = tokens[i];
    const next = tokens[i + 1];

    if (current.base === 'AO' && next?.base === 'R') {
      entries.push(createIpaEntry('ɔɹ', [current.raw, next.raw]));
      i += 1;
      continue;
    }

    if (current.base === 'AA' && next?.base === 'R') {
      entries.push(createIpaEntry('ɑ', [current.raw]));
      entries.push(createIpaEntry('ɚ', [next.raw]));
      i += 1;
      continue;
    }

    entries.push(createIpaEntry(arpabetTokenToIpa(current), [current.raw]));
  }

  return entries;
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

function addMissingWordMessage(container, word) {
  const title = document.createElement('div');
  title.className = 'word-text';
  title.textContent = word;
  container.appendChild(title);

  const failIcon = document.createElement('span');
  failIcon.textContent = '❌';
  failIcon.title = 'Phonemes not found';
  failIcon.className = 'error-span';
  container.appendChild(failIcon);
}

function addPhonemeImage(row, phoneme) {
  const img = document.createElement('img');
  img.src = `phonemes/${phoneme.imageName}.png`;
  img.alt = `/${phoneme.ipa}/`;
  img.title = `/${phoneme.ipa}/`;
  img.className = 'phoneme-image';
  img.dataset.ipa = phoneme.ipa;
  img.dataset.sourcePhonemes = phoneme.sourceTokens.join(' ');

  if (WIDE_IMAGE_NAMES.has(phoneme.imageName)) {
    img.style.width = '250px';
    img.style.height = '125px';
  }

  img.onerror = () => {
    img.onerror = null;
    img.src = 'phonemes/_default.png';
  };

  row.appendChild(img);
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

  try {
    const phonemeMap = await fetchPhonemeMap();
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const words = input.split(/\s+/);

    for (const word of words) {
      const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
      const pronunciation = phonemeMap[cleaned];

      const container = document.createElement('div');
      container.className = 'word-container';

      if (!pronunciation) {
        addMissingWordMessage(container, word);
        output.appendChild(container);
        continue;
      }

      const title = document.createElement('div');
      title.className = 'word-text';
      title.textContent = word;
      container.appendChild(title);

      const imgRow = document.createElement('div');
      imgRow.className = 'phonemes-container';

      const ipaEntries = wordToIpaEntries(cleaned, pronunciation);
      const selected = mode === 'initial' ? [ipaEntries[0]] : ipaEntries;

      for (const phoneme of selected) {
        addPhonemeImage(imgRow, phoneme);
      }

      container.appendChild(imgRow);
      output.appendChild(container);
    }
  } catch (error) {
    console.error('Error processing text:', error);
    output.textContent = 'Error processing request.';
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

    const blockWidth = pageWidth - margin * 2;
    const maxContentWidth = blockWidth - blockPadding * 2;

    let lines = [];
    let currentLine = [];
    let currentLineWidth = 0;

    for (const img of images) {
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

    const blockHeight = wordTextHeight + lines.length * (imgHeight + 5) + blockPadding * 2;

    if (y + blockHeight > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }

    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(margin, y, blockWidth, blockHeight, 3, 3, 'F');

    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.text(word, margin + blockWidth / 2, y + blockPadding + wordTextHeight, { align: 'center' });

    let imageYOffset = y + blockPadding + wordTextHeight + 5;
    pdf.setFont('helvetica', 'normal');

    for (const line of lines) {
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

    y += blockHeight + 10;
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
    const canvas = await html2canvas(block, { backgroundColor: '#ffffff' });
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const safeWord = word.replace(/[^\w-]/g, '_');

    zip.file(`${safeWord}.png`, blob);
  }

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
    const isOpen = menu.style.display === 'block';
    menu.style.display = isOpen ? 'none' : 'block';
    document.getElementById('download-btn').setAttribute('aria-expanded', String(!isOpen));
  });

  document.addEventListener('click', e => {
    const btn = document.getElementById('download-btn');
    const menu = document.getElementById('download-menu');
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = 'none';
      btn.setAttribute('aria-expanded', 'false');
    }
  });
});
