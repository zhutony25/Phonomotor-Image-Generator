// Utility: Fetch pronunciation data
async function fetchPhonemeMap() {
  const response = await fetch('phonemes.json');
  return await response.json();
}

// wide phonemes
const WIDE_IMAGE_NAMES = new Set(['ow', 'oy']);

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

const VOWEL_IPAS = new Set(['ɑ', 'æ', 'ʌ', 'ə', 'ɔ', 'aʊ', 'aɪ', 'ɛ', 'ɝ', 'ɚ', 'e', 'eɪ', 'ɪ', 'i', 'oʊ', 'ɔɪ', 'ʊ', 'u', 'ɔɹ']);
const ARPABET_BASES = new Set(Object.keys(ARPABET_TO_IPA));
const ARPABET_VOWEL_BASES = new Set(['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW']);
const CHECKED_VOWEL_BASES = new Set(['AE', 'AH', 'EH', 'IH', 'UH']);
const CHECKED_VOWEL_IPAS = new Set(['æ', 'ʌ', 'ɛ', 'ɪ', 'ʊ']);
const SINGLE_ONSET_BASES = new Set(['B', 'CH', 'D', 'DH', 'F', 'G', 'HH', 'JH', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'SH', 'T', 'TH', 'V', 'W', 'Y', 'Z', 'ZH']);
const COMPLEX_ONSET_BASES = new Set([
  'B L', 'B R', 'B W', 'B Y',
  'D R', 'D W', 'D Y',
  'F L', 'F R', 'F Y',
  'G L', 'G R', 'G W', 'G Y',
  'HH Y',
  'K L', 'K R', 'K W', 'K Y',
  'L Y',
  'M Y',
  'N Y',
  'P L', 'P R', 'P W', 'P Y',
  'S F', 'S K', 'S K L', 'S K R', 'S K W', 'S K Y',
  'S L', 'S M', 'S N', 'S P', 'S P L', 'S P R', 'S P Y',
  'S T', 'S T R', 'S T Y', 'S W',
  'SH R',
  'T R', 'T W', 'T Y',
  'TH R', 'TH W', 'TH Y',
  'V R', 'V Y'
]);
const IPA_TO_SYLLABLE_PHONE = {
  b: ['B'],
  'tʃ': ['CH'],
  d: ['D'],
  'ð': ['DH'],
  f: ['F'],
  'ɡ': ['G'],
  h: ['HH'],
  'dʒ': ['JH'],
  k: ['K'],
  l: ['L'],
  m: ['M'],
  n: ['N'],
  'ŋ': ['NG'],
  p: ['P'],
  'ɹ': ['R'],
  'ɚ': ['R'],
  s: ['S'],
  'ʃ': ['SH'],
  t: ['T'],
  'θ': ['TH'],
  v: ['V'],
  w: ['W'],
  j: ['Y'],
  z: ['Z'],
  'ʒ': ['ZH']
};
const OVERRIDE_STORAGE_KEY = 'customWordOverrides';
const IPA_PICKER_SYMBOLS = ['ɑ', 'æ', 'ʌ', 'ə', 'ɔ', 'ɔɹ', 'aʊ', 'aɪ', 'ɛ', 'ɝ', 'ɚ', 'e', 'ɪ', 'i', 'oʊ', 'ɔɪ', 'ʊ', 'u', 'b', 'tʃ', 'd', 'ð', 'f', 'ɡ', 'h', 'dʒ', 'k', 'l', 'm', 'n', 'ŋ', 'p', 'ɹ', 's', 'ʃ', 't', 'θ', 'v', 'w', 'j', 'z', 'ʒ'];

const WORD_IPA_OVERRIDES = {
  are: ['ɑ', 'ɹ'],
  for: ['f', 'ɔɹ'],
  or: ['ɔɹ'],
  will: ['w', 'ɪ', 'l']
};

let customWordOverrides = {};
let latestPhonemeMap = null;

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

function createIpaEntry(ipa, sourceTokens, options = {}) {
  return {
    ipa,
    imageName: IPA_TO_IMAGE[ipa] || '_default',
    sourceTokens,
    stress: options.stress || '',
    isVowel: options.isVowel ?? VOWEL_IPAS.has(ipa)
  };
}

function ipaSymbolsToEntries(ipaSymbols, sourceLabel) {
  return ipaSymbols.map(ipa => createIpaEntry(ipa, [sourceLabel]));
}

function hasCustomWordOverride(word) {
  return Object.prototype.hasOwnProperty.call(customWordOverrides, word);
}

function hasBuiltInWordOverride(word) {
  return Object.prototype.hasOwnProperty.call(WORD_IPA_OVERRIDES, word);
}

function hasWordMapping(word, pronunciation) {
  return Boolean(pronunciation) || hasCustomWordOverride(word) || hasBuiltInWordOverride(word);
}

function wordToIpaEntries(word, pronunciation) {
  if (hasCustomWordOverride(word)) {
    return ipaSymbolsToEntries(customWordOverrides[word], 'custom override');
  }

  if (hasBuiltInWordOverride(word)) {
    return ipaSymbolsToEntries(WORD_IPA_OVERRIDES[word], 'override');
  }

  if (!pronunciation) {
    return [];
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
      entries.push(createIpaEntry('ɔɹ', [current.raw, next.raw], { stress: current.stress }));
      i += 1;
      continue;
    }

    if (current.base === 'AA' && next?.base === 'R') {
      entries.push(createIpaEntry('ɑ', [current.raw], { stress: current.stress }));
      entries.push(createIpaEntry('ɚ', [next.raw], { isVowel: false }));
      i += 1;
      continue;
    }

    entries.push(createIpaEntry(arpabetTokenToIpa(current), [current.raw], { stress: current.stress }));
  }

  return entries;
}

function getChromeStorage() {
  return typeof chrome !== 'undefined' && chrome.storage?.local ? chrome.storage.local : null;
}

async function loadCustomOverrides() {
  const storage = getChromeStorage();
  if (storage) {
    const stored = await storage.get(OVERRIDE_STORAGE_KEY);
    customWordOverrides = stored[OVERRIDE_STORAGE_KEY] || {};
    return;
  }

  try {
    customWordOverrides = JSON.parse(localStorage.getItem(OVERRIDE_STORAGE_KEY) || '{}');
  } catch {
    customWordOverrides = {};
  }
}

async function saveCustomOverrides() {
  const storage = getChromeStorage();
  if (storage) {
    await storage.set({ [OVERRIDE_STORAGE_KEY]: customWordOverrides });
    return;
  }

  localStorage.setItem(OVERRIDE_STORAGE_KEY, JSON.stringify(customWordOverrides));
}

function normalizeIpaSequence(value) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function getDisplaySettings() {
  return {
    showSyllables: document.getElementById('syllables-toggle')?.checked || false,
    showStress: document.getElementById('stress-toggle')?.checked || false
  };
}

function getStressClass(stress) {
  if (stress === '1') return 'stress-primary';
  if (stress === '2') return 'stress-secondary';
  if (stress === '0') return 'stress-unstressed';
  return '';
}

function getSourceBases(entry) {
  return (entry.sourceTokens || [])
    .map(token => parseArpabetToken(token).base)
    .filter(base => ARPABET_BASES.has(base));
}

function getSyllablePhoneBases(entry) {
  const sourceConsonants = getSourceBases(entry).filter(base => !ARPABET_VOWEL_BASES.has(base));
  if (sourceConsonants.length > 0) {
    return sourceConsonants;
  }

  return IPA_TO_SYLLABLE_PHONE[entry.ipa] || [];
}

function isStressedCheckedNucleus(entry) {
  if (entry.stress !== '1' && entry.stress !== '2') {
    return false;
  }

  const sourceVowels = getSourceBases(entry).filter(base => ARPABET_VOWEL_BASES.has(base));
  if (sourceVowels.length > 0) {
    return sourceVowels.some(base => CHECKED_VOWEL_BASES.has(base));
  }

  return CHECKED_VOWEL_IPAS.has(entry.ipa);
}

function isLegalEnglishOnset(onsetEntries) {
  const phoneBases = [];

  for (const entry of onsetEntries) {
    const entryPhones = getSyllablePhoneBases(entry);
    if (entryPhones.length === 0) {
      return false;
    }

    phoneBases.push(...entryPhones);
  }

  const onsetKey = phoneBases.join(' ');
  return SINGLE_ONSET_BASES.has(onsetKey) || COMPLEX_ONSET_BASES.has(onsetKey);
}

function findMaximalOnsetStart(entries, clusterStart, clusterEnd, leftNucleus) {
  if (clusterStart >= clusterEnd) {
    return clusterEnd;
  }

  const needsCoda = isStressedCheckedNucleus(leftNucleus);

  for (let onsetStart = clusterStart; onsetStart < clusterEnd; onsetStart += 1) {
    if (needsCoda && onsetStart === clusterStart) {
      continue;
    }

    if (isLegalEnglishOnset(entries.slice(onsetStart, clusterEnd))) {
      return onsetStart;
    }
  }

  return clusterEnd;
}

function syllabifyEntries(entries) {
  const nuclei = entries.reduce((indices, entry, index) => {
    if (entry.isVowel) {
      indices.push(index);
    }
    return indices;
  }, []);

  if (nuclei.length <= 1) {
    return entries.length ? [entries] : [];
  }

  const syllables = [];
  let syllableStart = 0;

  for (let i = 0; i < nuclei.length - 1; i += 1) {
    const leftNucleusIndex = nuclei[i];
    const rightNucleusIndex = nuclei[i + 1];
    const clusterStart = leftNucleusIndex + 1;
    const clusterEnd = rightNucleusIndex;
    const boundary = findMaximalOnsetStart(entries, clusterStart, clusterEnd, entries[leftNucleusIndex]);

    if (boundary > syllableStart) {
      syllables.push(entries.slice(syllableStart, boundary));
    }

    syllableStart = boundary;
  }

  if (syllableStart < entries.length) {
    syllables.push(entries.slice(syllableStart));
  }

  return syllables.length ? syllables : [entries];
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

function addMissingWordMessage(container, word, cleanedWord) {
  const header = document.createElement('div');
  header.className = 'word-header';

  const title = document.createElement('div');
  title.className = 'word-text';
  title.textContent = word;
  header.appendChild(title);

  const failIcon = document.createElement('span');
  failIcon.textContent = '!';
  failIcon.title = 'Phonemes not found';
  failIcon.className = 'error-span';

  if (cleanedWord) {
    const actions = document.createElement('div');
    actions.className = 'word-actions';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'icon-button';
    editButton.textContent = '✎';
    editButton.title = 'Create custom mapping';
    editButton.setAttribute('aria-label', `Create custom mapping for ${cleanedWord}`);
    editButton.addEventListener('click', () => openOverrideDialog(cleanedWord, []));
    actions.appendChild(editButton);
    header.appendChild(actions);
  }

  container.appendChild(header);
  container.appendChild(failIcon);
}

// function addPhonemeImage(row, phoneme, stressOverride = '') {
//   const img = document.createElement('img');
//   img.src = `phonemes/${phoneme.imageName}.png`;
//   img.alt = `/${phoneme.ipa}/`;
//   img.title = `/${phoneme.ipa}/`;
//   img.className = 'phoneme-image';
//   img.dataset.ipa = phoneme.ipa;
//   img.dataset.sourcePhonemes = phoneme.sourceTokens.join(' ');

//   const stressClass = getStressClass(stressOverride || phoneme.stress);
//   if (stressClass && getDisplaySettings().showStress) {
//     img.classList.add(stressClass);
//   }

//   img.onerror = () => {
//     img.onerror = null;
//     img.src = 'phonemes/_default.png';
//   };

//   row.appendChild(img);
// }

function addPhonemeImage(row, phoneme, stressOverride = '') {
  const img = document.createElement('img');
  img.src = `phonemes/${phoneme.imageName}.png`;
  img.alt = `/${phoneme.ipa}/`;
  img.title = `/${phoneme.ipa}/`;
  img.className = 'phoneme-image';
  img.dataset.ipa = phoneme.ipa;
  img.dataset.sourcePhonemes = phoneme.sourceTokens.join(' ');

  if (WIDE_IMAGE_NAMES.has(phoneme.imageName)) {
    img.classList.add('phoneme-image-wide');
  }

  const stressClass = getStressClass(stressOverride || phoneme.stress);
  if (stressClass && getDisplaySettings().showStress) {
    img.classList.add(stressClass);
  }

  img.onerror = () => {
    img.onerror = null;
    img.src = 'phonemes/_default.png';
  };

  row.appendChild(img);
}

function renderPhonemeEntries(row, entries) {
  const { showSyllables } = getDisplaySettings();

  if (showSyllables && entries.length > 1) {
    syllabifyEntries(entries).forEach((syllable, index) => {
      const group = document.createElement('div');
      group.className = 'syllable-group';
      group.dataset.label = `S${index + 1}`;

      const header = document.createElement('div');
      header.className = 'syllable-header';

      const syllableText = document.createElement('div');
      syllableText.className = 'syllable-text';
      syllableText.textContent = `/${syllable.map(entry => entry.ipa).join('')}/`;

      const focusButton = document.createElement('button');
      focusButton.type = 'button';
      focusButton.className = 'icon-button syllable-focus-button';
      focusButton.textContent = '⛶';
      focusButton.title = 'Focus on syllable';
      focusButton.setAttribute('aria-label', `Focus on syllable ${index + 1}`);
      focusButton.addEventListener('click', event => {
        event.stopPropagation();
        openSyllableFocusMode(group, syllableText.textContent);
      });

      header.append(syllableText, focusButton);
      group.appendChild(header);

      for (const phoneme of syllable) {
        addPhonemeImage(group, phoneme);
      }

      row.appendChild(group);
    });
    return;
  }

  for (const phoneme of entries) {
    addPhonemeImage(row, phoneme);
  }
}

function setFocusTitle(targetText = '') {
  const focusTitle = document.getElementById('focus-title');
  if (!focusTitle) return;

  focusTitle.textContent = 'Focus Mode';
  if (!targetText) return;

  const target = document.createElement('span');
  target.className = 'focus-target';
  target.textContent = targetText;
  focusTitle.appendChild(target);
}

function addWordActions(container, word, entries) {
  const actions = document.createElement('div');
  actions.className = 'word-actions';

  const focusButton = document.createElement('button');
  focusButton.type = 'button';
  focusButton.className = 'icon-button';
  focusButton.textContent = '⛶';
  focusButton.title = 'Focus mode';
  focusButton.setAttribute('aria-label', `Focus on ${word}`);

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'icon-button';
  editButton.textContent = '✎';
  editButton.title = 'Override mapping';
  editButton.setAttribute('aria-label', `Override mapping for ${word}`);

  actions.append(focusButton, editButton);
  container.dataset.word = word;
  container.dataset.entries = JSON.stringify(entries);
  focusButton.addEventListener('click', () => openFocusMode(container));
  editButton.addEventListener('click', () => openOverrideDialog(word, entries));

  return actions;
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
    const phonemeMap = latestPhonemeMap || await fetchPhonemeMap();
    latestPhonemeMap = phonemeMap;
    await loadCustomOverrides();
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const words = input.split(/\s+/);

    for (const word of words) {
      const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
      const pronunciation = phonemeMap[cleaned];

      const container = document.createElement('div');
      container.className = 'word-container';

      if (!hasWordMapping(cleaned, pronunciation)) {
        addMissingWordMessage(container, word, cleaned);
        output.appendChild(container);
        continue;
      }

      const ipaEntries = wordToIpaEntries(cleaned, pronunciation);
      const selected = mode === 'initial' ? [ipaEntries[0]] : ipaEntries;

      const header = document.createElement('div');
      header.className = 'word-header';

      const title = document.createElement('div');
      title.className = 'word-text';
      title.textContent = word;
      header.appendChild(title);
      header.appendChild(addWordActions(container, cleaned, ipaEntries));
      container.appendChild(header);

      const imgRow = document.createElement('div');
      imgRow.className = 'phonemes-container';

      renderPhonemeEntries(imgRow, selected);

      container.appendChild(imgRow);
      output.appendChild(container);
    }
  } catch (error) {
    console.error('Error processing text:', error);
    output.textContent = 'Error processing request.';
  }
}

function closeOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;

  if (overlay.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
}

function openOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
}

function openFocusMode(sourceCard) {
  const focusContent = document.getElementById('focus-content');
  if (!focusContent) return;

  const word = sourceCard.querySelector('.word-text')?.textContent;
  setFocusTitle(word);

  focusContent.innerHTML = '';
  const clone = sourceCard.cloneNode(true);
  clone.classList.add('focus-card');
  focusContent.appendChild(clone);
  openOverlay('focus-overlay');
}

function openSyllableFocusMode(sourceGroup, label) {
  const focusContent = document.getElementById('focus-content');
  if (!focusContent) return;

  setFocusTitle(label);

  focusContent.innerHTML = '';
  const clone = sourceGroup.cloneNode(true);
  clone.querySelectorAll('button').forEach(button => button.remove());
  focusContent.appendChild(clone);
  openOverlay('focus-overlay');
}

function openOverrideDialog(word, entries) {
  const wordInput = document.getElementById('override-word');
  const sequenceInput = document.getElementById('override-sequence');
  if (!wordInput || !sequenceInput) return;

  wordInput.value = word;
  sequenceInput.value = (customWordOverrides[word] || entries.map(entry => entry.ipa)).join(' ');
  openOverlay('override-overlay');
  sequenceInput.focus();
}

function buildSymbolPicker() {
  const picker = document.getElementById('symbol-picker');
  const sequenceInput = document.getElementById('override-sequence');
  if (!picker || !sequenceInput) return;

  picker.innerHTML = '';
  for (const symbol of IPA_PICKER_SYMBOLS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = symbol;
    button.addEventListener('click', () => {
      insertSymbolAtCursor(sequenceInput, symbol);
    });
    picker.appendChild(button);
  }
}

function insertSymbolAtCursor(input, symbol) {
  const value = input.value;
  const start = input.selectionStart ?? value.length;
  const end = input.selectionEnd ?? value.length;
  const before = value.slice(0, start);
  const after = value.slice(end);
  const needsSpaceBefore = before.length > 0 && !/\s$/.test(before);
  const needsSpaceAfter = after.length > 0 && !/^\s/.test(after);
  const insertion = `${needsSpaceBefore ? ' ' : ''}${symbol}${needsSpaceAfter ? ' ' : ''}`;
  const nextCursor = before.length + insertion.length;

  input.value = `${before}${insertion}${after}`;
  input.focus();
  input.setSelectionRange(nextCursor, nextCursor);
}

async function saveOverrideFromForm(event) {
  event.preventDefault();
  const word = document.getElementById('override-word')?.value.trim().toLowerCase();
  const sequence = normalizeIpaSequence(document.getElementById('override-sequence')?.value || '');

  if (!word || sequence.length === 0) return;

  customWordOverrides[word] = sequence;
  await saveCustomOverrides();
  closeOverlay('override-overlay');
  await convertText();
}

async function deleteCurrentOverride() {
  const word = document.getElementById('override-word')?.value.trim().toLowerCase();
  if (!word) return;

  delete customWordOverrides[word];
  await saveCustomOverrides();
  closeOverlay('override-overlay');
  await convertText();
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

  document.body.classList.add('exporting');

  try {
    for (const block of blocks) {
      const word = block.querySelector('.word-text')?.textContent.trim() || 'word';
      const canvas = await html2canvas(block, { backgroundColor: '#ffffff' });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const safeWord = word.replace(/[^\w-]/g, '_');

      zip.file(`${safeWord}.png`, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'phoneme_images.zip');
  } finally {
    document.body.classList.remove('exporting');
  }
}

// UI Behavior and event listeners
document.addEventListener('DOMContentLoaded', async () => {
  await loadCustomOverrides();
  buildSymbolPicker();

  document.getElementById('convert-btn').addEventListener('click', convertText);
  document.getElementById('input-word').addEventListener('keypress', e => {
    if (e.key === 'Enter') convertText();
  });

  document.getElementById('syllables-toggle').addEventListener('change', () => {
    if (document.getElementById('output-container').children.length) convertText();
  });

  document.getElementById('stress-toggle').addEventListener('change', () => {
    if (document.getElementById('output-container').children.length) convertText();
  });

  document.getElementById('download-pdf-btn').addEventListener('click', downloadPDF);
  document.getElementById('download-png-btn').addEventListener('click', downloadZIP);
  document.getElementById('close-focus-btn').addEventListener('click', () => closeOverlay('focus-overlay'));
  document.getElementById('close-override-btn').addEventListener('click', () => closeOverlay('override-overlay'));
  document.getElementById('cancel-override-btn').addEventListener('click', () => closeOverlay('override-overlay'));
  document.getElementById('override-form').addEventListener('submit', saveOverrideFromForm);
  document.getElementById('delete-override-btn').addEventListener('click', deleteCurrentOverride);

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

  document.querySelectorAll('.overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        closeOverlay(overlay.id);
      }
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeOverlay('focus-overlay');
      closeOverlay('override-overlay');
    }
  });
});
