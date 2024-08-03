document.addEventListener('DOMContentLoaded', () => {
    const rows = document.querySelectorAll('.input-row');
    let currentRowIndex = 0;
    let currentIndex = 0;
    const maxGuesses = 6;
    let wordList = [];
    let secretWord = '';
    var salertThing = document.querySelector(".salert");

    function salert(Thing, waittime) {
        salertThing.style.opacity = "1";
        salertThing.textContent = Thing;

        setTimeout(function() {
            salertThing.style.opacity = "0";

        }, waittime)
    }

    function loadWordList() {
        fetch('wordlist.txt')
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

    function checkGuess() {
        const currentRow = rows[currentRowIndex];
        const boxes = currentRow.querySelectorAll('.input-box');
        let guess = "";
        boxes.forEach(box => guess += box.textContent);

        if (guess.length < secretWord.length) return;

        if (!isValidWord(guess)) {
            salert('Invalid word! Please try again.', 1300);
            return;
        }

        const guessArray = guess.split('');
        const secretArray = secretWord.split('');
        const matched = new Array(secretArray.length).fill(false);

        // Feadback giving: find the exact matches

        boxes.forEach((box, index) => {
            if (guessArray[index] === secretArray[index]) {
                box.style.backgroundColor = "green"; // Correct letter in the correct position
             //   box.classList.add("green");
                matched[index] = true;
                guessArray[index] = null; // Mark this letter as matched
            }
        });

        // Then find others
        boxes.forEach((box, index) => {
            if (box.style.backgroundColor !== "green" && guessArray[index] !== null) {
                const letterIndex = secretArray.indexOf(guessArray[index]);
                if (letterIndex !== -1 && !matched[letterIndex]) {
                    box.style.backgroundColor = "yellow"; // Correct letter in the wrong position
                //   box.classList.add("yellow");
                    matched[letterIndex] = true;
                } else {
                    box.style.backgroundColor = "gray"; // Incorrect letter
                   // box.classList.add("grey");
                }
            } else if (box.style.backgroundColor !== "green") {
                box.style.backgroundColor = "gray"; // Incorrect letter
            }
        });

        // Check if the guess is correct
        if (guess === secretWord) {
            salert("Congratulations! You've guessed the word!", 3000);
            // Reset
        } else if (currentRowIndex < maxGuesses - 1) {
            currentRowIndex++;
            currentIndex = 0;
            updateFocus();
        } else {
            salert("You lost! The answer was " + secretWord, 2000);
            // Reset or do nothing
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
