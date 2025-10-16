// ===== Global Variables and Utilities =====
let currentCipher = 'caesar';

// ===== Utility Functions =====
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.add('show');
    setTimeout(() => errorElement.classList.remove('show'), 5000);
}

function clearError() {
    document.getElementById('errorMessage').classList.remove('show');
}

function preprocessText(text, preserveSpaces = false) {
    if (preserveSpaces) {
        return text.toUpperCase().replace(/[^A-Z\s]/g, '');
    }
    return text.toUpperCase().replace(/[^A-Z]/g, '');
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function modInverse(a, m) {
    for (let i = 1; i < m; i++) {
        if ((a * i) % m === 1) return i;
    }
    return -1;
}

function matrixDeterminant(matrix) {
    return (matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]) % 26;
}

// ===== Caesar Cipher =====
function caesarEncrypt(text, shift) {
    return text.split('').map(char => {
        if (char.match(/[A-Z]/)) {
            return String.fromCharCode((char.charCodeAt(0) - 65 + shift) % 26 + 65);
        }
        return char;
    }).join('');
}

function caesarDecrypt(text, shift) {
    return caesarEncrypt(text, (26 - shift) % 26);
}

// ===== Affine Cipher =====
function affineEncrypt(text, a, b) {
    return text.split('').map(char => {
        if (char.match(/[A-Z]/)) {
            const x = char.charCodeAt(0) - 65;
            return String.fromCharCode((a * x + b) % 26 + 65);
        }
        return char;
    }).join('');
}

function affineDecrypt(text, a, b) {
    const aInv = modInverse(a, 26);
    if (aInv === -1) {
        throw new Error('Invalid key: a must be coprime with 26');
    }
    
    return text.split('').map(char => {
        if (char.match(/[A-Z]/)) {
            const y = char.charCodeAt(0) - 65;
            const x = (aInv * (y - b + 26)) % 26;
            return String.fromCharCode(x + 65);
        }
        return char;
    }).join('');
}

// ===== Vigenère Cipher =====
function vigenereEncrypt(text, keyword) {
    const key = keyword.toUpperCase();
    let keyIndex = 0;
    
    return text.split('').map(char => {
        if (char.match(/[A-Z]/)) {
            const shift = key[keyIndex % key.length].charCodeAt(0) - 65;
            keyIndex++;
            return String.fromCharCode((char.charCodeAt(0) - 65 + shift) % 26 + 65);
        }
        return char;
    }).join('');
}

function vigenereDecrypt(text, keyword) {
    const key = keyword.toUpperCase();
    let keyIndex = 0;
    
    return text.split('').map(char => {
        if (char.match(/[A-Z]/)) {
            const shift = key[keyIndex % key.length].charCodeAt(0) - 65;
            keyIndex++;
            return String.fromCharCode((char.charCodeAt(0) - 65 - shift + 26) % 26 + 65);
        }
        return char;
    }).join('');
}

// ===== Playfair Cipher =====
function generatePlayfairGrid(keyword) {
    const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // I and J are combined
    const key = keyword.toUpperCase().replace(/J/g, 'I');
    const used = new Set();
    const grid = [];
    
    let keyStr = '';
    for (let char of key) {
        if (char.match(/[A-Z]/) && !used.has(char)) {
            keyStr += char;
            used.add(char);
        }
    }
    
    for (let char of alphabet) {
        if (!used.has(char)) {
            keyStr += char;
        }
    }
    
    for (let i = 0; i < 5; i++) {
        grid[i] = keyStr.slice(i * 5, (i + 1) * 5).split('');
    }
    
    return grid;
}

function findPosition(grid, char) {
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (grid[i][j] === char) {
                return [i, j];
            }
        }
    }
    return null;
}

function playfairPreprocess(text) {
    text = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    let processed = '';
    
    for (let i = 0; i < text.length; i += 2) {
        let first = text[i];
        let second = i + 1 < text.length ? text[i + 1] : 'X';
        
        if (first === second) {
            processed += first + 'X';
            i--; // Process the repeated character in next iteration
        } else {
            processed += first + second;
        }
    }
    
    if (processed.length % 2 !== 0) {
        processed += 'X';
    }
    
    return processed;
}

function playfairEncrypt(text, keyword) {
    const grid = generatePlayfairGrid(keyword);
    const processedText = playfairPreprocess(text);
    let result = '';
    
    for (let i = 0; i < processedText.length; i += 2) {
        const pos1 = findPosition(grid, processedText[i]);
        const pos2 = findPosition(grid, processedText[i + 1]);
        
        if (pos1[0] === pos2[0]) { // Same row
            result += grid[pos1[0]][(pos1[1] + 1) % 5];
            result += grid[pos2[0]][(pos2[1] + 1) % 5];
        } else if (pos1[1] === pos2[1]) { // Same column
            result += grid[(pos1[0] + 1) % 5][pos1[1]];
            result += grid[(pos2[0] + 1) % 5][pos2[1]];
        } else { // Rectangle
            result += grid[pos1[0]][pos2[1]];
            result += grid[pos2[0]][pos1[1]];
        }
    }
    
    return result;
}

function playfairDecrypt(text, keyword) {
    const grid = generatePlayfairGrid(keyword);
    let result = '';
    
    for (let i = 0; i < text.length; i += 2) {
        const pos1 = findPosition(grid, text[i]);
        const pos2 = findPosition(grid, text[i + 1]);
        
        if (pos1[0] === pos2[0]) { // Same row
            result += grid[pos1[0]][(pos1[1] - 1 + 5) % 5];
            result += grid[pos2[0]][(pos2[1] - 1 + 5) % 5];
        } else if (pos1[1] === pos2[1]) { // Same column
            result += grid[(pos1[0] - 1 + 5) % 5][pos1[1]];
            result += grid[(pos2[0] - 1 + 5) % 5][pos2[1]];
        } else { // Rectangle
            result += grid[pos1[0]][pos2[1]];
            result += grid[pos2[0]][pos1[1]];
        }
    }
    
    return result;
}

// ===== Hill Cipher =====
function hillEncrypt(text, matrix) {
    const processedText = preprocessText(text);
    if (processedText.length % 2 !== 0) {
        text += 'X'; // Pad with X if odd length
    }
    
    let result = '';
    
    for (let i = 0; i < processedText.length; i += 2) {
        const p1 = processedText[i].charCodeAt(0) - 65;
        const p2 = processedText[i + 1].charCodeAt(0) - 65;
        
        const c1 = (matrix[0][0] * p1 + matrix[0][1] * p2) % 26;
        const c2 = (matrix[1][0] * p1 + matrix[1][1] * p2) % 26;
        
        result += String.fromCharCode(c1 + 65);
        result += String.fromCharCode(c2 + 65);
    }
    
    return result;
}

function hillDecrypt(text, matrix) {
    const det = matrixDeterminant(matrix);
    const detInv = modInverse(((det % 26) + 26) % 26, 26);
    
    if (detInv === -1) {
        throw new Error('Matrix is not invertible');
    }
    
    // Calculate inverse matrix
    const invMatrix = [
        [(matrix[1][1] * detInv) % 26, (-matrix[0][1] * detInv + 26 * 26) % 26],
        [(-matrix[1][0] * detInv + 26 * 26) % 26, (matrix[0][0] * detInv) % 26]
    ];
    
    return hillEncrypt(text, invMatrix);
}

// ===== Rail Fence Cipher =====
function railFenceEncrypt(text, rails) {
    if (rails === 1) return text;
    
    const fence = Array(rails).fill().map(() => []);
    let rail = 0;
    let direction = 1;
    
    for (let char of text) {
        fence[rail].push(char);
        rail += direction;
        
        if (rail === rails - 1 || rail === 0) {
            direction = -direction;
        }
    }
    
    return fence.flat().join('');
}

function railFenceDecrypt(text, rails) {
    if (rails === 1) return text;
    
    // Create the rail pattern to know positions
    const pattern = [];
    let rail = 0;
    let direction = 1;
    
    for (let i = 0; i < text.length; i++) {
        pattern.push(rail);
        rail += direction;
        
        if (rail === rails - 1 || rail === 0) {
            direction = -direction;
        }
    }
    
    // Count characters per rail
    const railCounts = Array(rails).fill(0);
    pattern.forEach(r => railCounts[r]++);
    
    // Fill the rails with encrypted text
    const fence = Array(rails).fill().map(() => []);
    let textIndex = 0;
    
    for (let r = 0; r < rails; r++) {
        for (let i = 0; i < railCounts[r]; i++) {
            fence[r].push(text[textIndex++]);
        }
    }
    
    // Reconstruct original text
    const railIndexes = Array(rails).fill(0);
    let result = '';
    
    for (let pos of pattern) {
        result += fence[pos][railIndexes[pos]++];
    }
    
    return result;
}

// ===== Row Transposition Cipher =====
function rowTranspositionEncrypt(text, keyword) {
    const key = keyword.toUpperCase();
    const keyOrder = key.split('').map((char, index) => ({ char, index }))
        .sort((a, b) => a.char.localeCompare(b.char))
        .map((item, sortedIndex) => ({ originalIndex: item.index, order: sortedIndex }))
        .sort((a, b) => a.originalIndex - b.originalIndex)
        .map(item => item.order);
    
    const cols = key.length;
    const rows = Math.ceil(text.length / cols);
    
    // Create grid
    const grid = Array(rows).fill().map(() => Array(cols).fill(''));
    
    // Fill grid row by row
    let textIndex = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols && textIndex < text.length; c++) {
            grid[r][c] = text[textIndex++];
        }
    }
    
    // Read columns in key order
    let result = '';
    for (let order = 0; order < cols; order++) {
        const colIndex = keyOrder.indexOf(order);
        for (let r = 0; r < rows; r++) {
            if (grid[r][colIndex]) {
                result += grid[r][colIndex];
            }
        }
    }
    
    return result;
}

function rowTranspositionDecrypt(text, keyword) {
    const key = keyword.toUpperCase();
    const keyOrder = key.split('').map((char, index) => ({ char, index }))
        .sort((a, b) => a.char.localeCompare(b.char))
        .map((item, sortedIndex) => ({ originalIndex: item.index, order: sortedIndex }))
        .sort((a, b) => a.originalIndex - b.originalIndex)
        .map(item => item.order);
    
    const cols = key.length;
    const rows = Math.ceil(text.length / cols);
    const fullRows = Math.floor(text.length / cols);
    const partialCols = text.length % cols;
    
    // Calculate column lengths
    const colLengths = Array(cols).fill(fullRows);
    for (let i = 0; i < partialCols; i++) {
        const colIndex = keyOrder.indexOf(i);
        colLengths[colIndex]++;
    }
    
    // Create grid and fill column by column in key order
    const grid = Array(rows).fill().map(() => Array(cols).fill(''));
    let textIndex = 0;
    
    for (let order = 0; order < cols; order++) {
        const colIndex = keyOrder.indexOf(order);
        for (let r = 0; r < colLengths[colIndex]; r++) {
            grid[r][colIndex] = text[textIndex++];
        }
    }
    
    // Read row by row
    let result = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c]) {
                result += grid[r][c];
            }
        }
    }
    
    return result;
}

// ===== UI Functions =====
function changeCipher() {
    currentCipher = document.getElementById('cipherType').value;
    generateKeyInputs();
    clearError();
}

function generateKeyInputs() {
    const keyInputsDiv = document.getElementById('keyInputs');
    
    switch (currentCipher) {
        case 'caesar':
            keyInputsDiv.innerHTML = `
                <div class="key-row">
                    <div class="key-input">
                        <label for="shift">Shift Value (0-25):</label>
                        <input type="number" id="shift" min="0" max="25" value="3" placeholder="Enter shift value">
                    </div>
                </div>
            `;
            break;
            
        case 'affine':
            keyInputsDiv.innerHTML = `
                <div class="key-row">
                    <div class="key-input">
                        <label for="affineA">a value (1,3,5,7,9,11,15,17,19,21,23,25):</label>
                        <input type="number" id="affineA" value="5" placeholder="Enter a value">
                    </div>
                    <div class="key-input">
                        <label for="affineB">b value (0-25):</label>
                        <input type="number" id="affineB" min="0" max="25" value="8" placeholder="Enter b value">
                    </div>
                </div>
            `;
            break;
            
        case 'vigenere':
            keyInputsDiv.innerHTML = `
                <div class="key-row">
                    <div class="key-input">
                        <label for="vigenereKey">Keyword:</label>
                        <input type="text" id="vigenereKey" value="KEY" placeholder="Enter keyword (letters only)">
                    </div>
                </div>
            `;
            break;
            
        case 'playfair':
            keyInputsDiv.innerHTML = `
                <div class="key-row">
                    <div class="key-input">
                        <label for="playfairKey">Keyword:</label>
                        <input type="text" id="playfairKey" value="MONARCHY" placeholder="Enter keyword (letters only)">
                    </div>
                </div>
            `;
            break;
            
        case 'hill':
            keyInputsDiv.innerHTML = `
                <div class="key-row">
                    <div class="key-input">
                        <label for="matrixSize">Matrix Size:</label>
                        <select id="matrixSize" onchange="generateHillMatrix()">
                            <option value="2">2×2 Matrix</option>
                            <option value="3">3×3 Matrix</option>
                            <option value="4">4×4 Matrix</option>
                            <option value="custom">Custom Size (n×n)</option>
                        </select>
                    </div>
                    <div class="key-input" id="customSizeInput" style="display: none;">
                        <label for="customSize">Custom Size (n):</label>
                        <input type="number" id="customSize" min="2" max="10" value="2" onchange="generateHillMatrix()" placeholder="Enter matrix size">
                    </div>
                </div>
                <div id="matrixInputs" class="matrix-inputs">
                    <!-- Matrix inputs will be generated here -->
                </div>
            `;
            generateHillMatrix();
            break;
            
        case 'railfence':
            keyInputsDiv.innerHTML = `
                <div class="key-row">
                    <div class="key-input">
                        <label for="rails">Number of Rails (2 or more):</label>
                        <input type="number" id="rails" min="2" value="3" placeholder="Enter number of rails">
                    </div>
                </div>
            `;
            break;
            
        case 'rowtransposition':
            keyInputsDiv.innerHTML = `
                <div class="key-row">
                    <div class="key-input">
                        <label for="transKey">Keyword:</label>
                        <input type="text" id="transKey" value="ZEBRAS" placeholder="Enter keyword (letters only)">
                    </div>
                </div>
            `;
            break;
    }
}



function validateInputs() {
    const inputText = document.getElementById('inputText').value.trim();
    if (!inputText) {
        throw new Error('Please enter some text to encrypt/decrypt');
    }
    
    switch (currentCipher) {
        case 'caesar':
            const shift = parseInt(document.getElementById('shift').value);
            if (isNaN(shift) || shift < 0 || shift > 25) {
                throw new Error('Shift value must be between 0 and 25');
            }
            return { text: inputText, shift };
            
        case 'affine':
            const a = parseInt(document.getElementById('affineA').value);
            const b = parseInt(document.getElementById('affineB').value);
            const validA = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
            
            if (!validA.includes(a)) {
                throw new Error('a value must be one of: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25');
            }
            if (isNaN(b) || b < 0 || b > 25) {
                throw new Error('b value must be between 0 and 25');
            }
            return { text: inputText, a, b };
            
        case 'vigenere':
            const vKey = document.getElementById('vigenereKey').value.trim();
            if (!vKey || !vKey.match(/^[A-Za-z]+$/)) {
                throw new Error('Keyword must contain only letters');
            }
            return { text: inputText, keyword: vKey };
            
        case 'playfair':
            const pKey = document.getElementById('playfairKey').value.trim();
            if (!pKey || !pKey.match(/^[A-Za-z]+$/)) {
                throw new Error('Keyword must contain only letters');
            }
            return { text: inputText, keyword: pKey };
            
        case 'hill':
            const hillA = parseInt(document.getElementById('hillA').value);
            const hillB = parseInt(document.getElementById('hillB').value);
            const hillC = parseInt(document.getElementById('hillC').value);
            const hillD = parseInt(document.getElementById('hillD').value);
            
            if (isNaN(hillA) || isNaN(hillB) || isNaN(hillC) || isNaN(hillD)) {
                throw new Error('All matrix elements must be valid numbers');
            }
            
            const matrix = [[hillA, hillB], [hillC, hillD]];
            const det = matrixDeterminant(matrix);
            if (gcd(((det % 26) + 26) % 26, 26) !== 1) {
                throw new Error('Matrix is not invertible. Choose different values.');
            }
            
            return { text: inputText, matrix };
            
        case 'railfence':
            const rails = parseInt(document.getElementById('rails').value);
            if (isNaN(rails) || rails < 2) {
                throw new Error('Number of rails must be 2 or more');
            }
            return { text: inputText, rails };
            
        case 'rowtransposition':
            const tKey = document.getElementById('transKey').value.trim();
            if (!tKey || !tKey.match(/^[A-Za-z]+$/)) {
                throw new Error('Keyword must contain only letters');
            }
            return { text: inputText, keyword: tKey };
    }
}

function encryptText() {
    try {
        clearError();
        const inputs = validateInputs();
        let result = '';
        
        switch (currentCipher) {
            case 'caesar':
                result = caesarEncrypt(preprocessText(inputs.text), inputs.shift);
                break;
            case 'affine':
                result = affineEncrypt(preprocessText(inputs.text), inputs.a, inputs.b);
                break;
            case 'vigenere':
                result = vigenereEncrypt(preprocessText(inputs.text), inputs.keyword);
                break;
            case 'playfair':
                result = playfairEncrypt(inputs.text, inputs.keyword);
                break;
            case 'hill':
                result = hillEncrypt(inputs.text, inputs.matrix);
                break;
            case 'railfence':
                result = railFenceEncrypt(preprocessText(inputs.text, true), inputs.rails);
                break;
            case 'rowtransposition':
                result = rowTranspositionEncrypt(preprocessText(inputs.text, true), inputs.keyword);
                break;
        }
        
        document.getElementById('outputText').value = result;
    } catch (error) {
        showError(error.message);
    }
}

function decryptText() {
    try {
        clearError();
        const inputs = validateInputs();
        let result = '';
        
        switch (currentCipher) {
            case 'caesar':
                result = caesarDecrypt(preprocessText(inputs.text), inputs.shift);
                break;
            case 'affine':
                result = affineDecrypt(preprocessText(inputs.text), inputs.a, inputs.b);
                break;
            case 'vigenere':
                result = vigenereDecrypt(preprocessText(inputs.text), inputs.keyword);
                break;
            case 'playfair':
                result = playfairDecrypt(preprocessText(inputs.text), inputs.keyword);
                break;
            case 'hill':
                result = hillDecrypt(preprocessText(inputs.text), inputs.matrix);
                break;
            case 'railfence':
                result = railFenceDecrypt(preprocessText(inputs.text, true), inputs.rails);
                break;
            case 'rowtransposition':
                result = rowTranspositionDecrypt(preprocessText(inputs.text, true), inputs.keyword);
                break;
        }
        
        document.getElementById('outputText').value = result;
    } catch (error) {
        showError(error.message);
    }
}

function clearAll() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').value = '';
    clearError();
}

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', function() {
    changeCipher(); // Initialize with default cipher
});