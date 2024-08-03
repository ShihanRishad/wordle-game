document.addEventListener('DOMContentLoaded', () => {
    function salert(Thing, waittime) {
        salertThing.style.opacity = "1";
        salertThing.textContent = Thing;

        setTimeout(function() {
            salertThing.style.opacity = "0";

        }, waittime)
    }

    const rows = document.querySelectorAll('.input-row');
    let currentRowIndex = 0;
    let currentIndex = 0;
    const maxGuesses = 6;
    let wordList = [];
    let secretWord = '';

    function loadWordList() {
        fetch('https://shihanrishad.github.io/wordle-game/wordlist.txt')
            .then(response => response.text())
            .then(data => {
                wordList = data.split('\n').map(word => word.trim().toUpperCase());
                selectSecretWord();
            })
            .catch(error => console.error('Error loading word list:', error));
    }

    function selectSecretWord() {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        secretWord = wordList[randomIndex];
    }

    function isValidWord(word) {
        return wordList.includes(word.toUpperCase());
    }

    function updateFocus() {
        rows.forEach((row, rowIndex) => {
            const boxes = row.querySelectorAll('.input-box');
            boxes.forEach((box, boxIndex) => {
                if (rowIndex === currentRowIndex && boxIndex === currentIndex) {
                    box.classList.add('focused');
                } else {
                    box.classList.remove('focused');
                }
            });
        });
    }

    function handleInput(key) {
        const isLetter = /^[a-zA-Z]$/.test(key);
        const currentRow = rows[currentRowIndex];
        const boxes = currentRow.querySelectorAll('.input-box');

        if (isLetter) {
            if (currentIndex < boxes.length - 1) {
                boxes[currentIndex].textContent = key.toUpperCase();
                currentIndex++;
                updateFocus();
            }
        } else if (key === 'Backspace') {
            if (currentIndex > 0) {
                currentIndex--;
                boxes[currentIndex].textContent = '';
                updateFocus();
            } else if (currentIndex === 0 && boxes[currentIndex].textContent !== '') {
                boxes[currentIndex].textContent = '';
            }
        } else if (key === 'Enter') {
            if (currentIndex === boxes.length - 1) {
                checkGuess();
            }
        }
    }

    function updateKeyboardClass(letter, newClass) {
        const keyElement = document.querySelector(`.key[data-key="${letter}"]`);
        if (keyElement) {
            const currentClass = keyElement.getAttribute('data-class');
            if (currentClass !== 'correct') {
                if (currentClass === 'present' && newClass === 'correct') {
                    keyElement.classList.remove('present');
                    keyElement.classList.add('correct');
                    keyElement.setAttribute('data-class', 'correct');
                } else if (currentClass === 'absent' && (newClass === 'present' || newClass === 'correct')) {
                    keyElement.classList.remove('absent');
                    keyElement.classList.add(newClass);
                    keyElement.setAttribute('data-class', newClass);
                } else if (!currentClass) {
                    keyElement.classList.add(newClass);
                    keyElement.setAttribute('data-class', newClass);
                }
            }
        }
    }

    function checkGuess() {
        const currentRow = rows[currentRowIndex];
        const boxes = currentRow.querySelectorAll('.input-box');
        let guess = "";
        boxes.forEach(box => guess += box.textContent);

        if (guess.length < secretWord.length) return;

        if (!isValidWord(guess)) {
            salert('Invalid word! Please try again.', 2900);
            return;
        }

        const guessArray = guess.split('');
        const secretArray = secretWord.split('');
        const matched = new Array(secretArray.length).fill(false);

        // First pass: find exact matches
        boxes.forEach((box, index) => {
            if (guessArray[index] === secretArray[index]) {
                box.classList.add('correct'); // Correct letter in the correct position
                matched[index] = true;
                guessArray[index] = null; // Mark this letter as matched
                updateKeyboardClass(secretArray[index], 'correct');
            }
        });

        // Second pass: find partial matches
        boxes.forEach((box, index) => {
            if (!box.classList.contains('correct') && guessArray[index] !== null) {
                const letterIndex = secretArray.indexOf(guessArray[index]);
                if (letterIndex !== -1 && !matched[letterIndex]) {
                    box.classList.add('present'); // Correct letter in the wrong position
                    matched[letterIndex] = true;
                    updateKeyboardClass(guessArray[index], 'present');
                } else {
                    box.classList.add('absent'); // Incorrect letter
                    updateKeyboardClass(guessArray[index], 'absent');
                }
            } else if (!box.classList.contains('correct')) {
                box.classList.add('absent'); // Incorrect letter
                updateKeyboardClass(guessArray[index], 'absent');
            }
        });

        // Check if the guess is correct
        if (guess === secretWord) {
            salert("Congratulations! You've guessed the word!", 2900);
            // Reset or end game logic
        } else if (currentRowIndex < maxGuesses - 1) {
            currentRowIndex++;
            currentIndex = 0;
            updateFocus();
        } else {
            salert("Game over! The word was " + secretWord, 2900);
            // Reset or end game logic
        }
    }

    rows.forEach((row, rowIndex) => {
        const boxes = row.querySelectorAll('.input-box');
        boxes.forEach(box => {
            box.addEventListener('click', () => {
                // Only set focus if it's within the current row and the next expected input box
                if (rowIndex === currentRowIndex && parseInt(box.getAttribute('data-index')) === currentIndex) {
                    currentIndex = parseInt(box.getAttribute('data-index'));
                    updateFocus();
                }
            });
        });
    });

    document.addEventListener('keydown', (event) => {
        handleInput(event.key);
    });

    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', () => {
            const keyText = key.textContent.trim();
            if (key.classList.contains('enter-key')) {
                handleInput('Enter');
            } else {
                handleInput(keyText);
            }
        });
    });

    loadWordList();
    updateFocus();
});
