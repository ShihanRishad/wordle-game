document.addEventListener('DOMContentLoaded', () => {
    salertThing = document.querySelector(".salert");
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
    var box = document.querySelectorAll(".input-box");

    function animate(row) {
        var aniBox = row.querySelectorAll(".input-box");

        aniBox.forEach(box => {
            let position = box.getAttribute('data-index');
            box.style.animation = "pulse 0.4s";
            box.style.animationDelay = `${position * 0.5}s`
        })
    }

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
        if (!secretWord) {
            console.log("Something went wrong to load a secret word. Try reloading the page")
        }
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
            if (currentIndex < boxes.length) {
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
            } else {
                salert("Not enough letters!", 1500)
            }
        }
    }

    function updateKeyboardClass(letter, newClass) {
        const keyElement = document.querySelector(`.key[data-key="${letter}"]`);
        if (keyElement) {
            const currentClass = keyElement.getAttribute('data-class');
            if (currentClass !== 'correct') {
                if (currentClass === 'present' && newClass === 'correct') { // Change from yellow to green
                    keyElement.classList.remove('present');
                    keyElement.classList.add('correct');
                    keyElement.setAttribute('data-class', 'correct');
                } else if (currentClass === 'absent' && (newClass === 'present' || newClass === 'correct')) {  // Hehe it's not possible
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
            salert('Invalid word!', 2900);
            return;
        }

        animate(currentRow);
        const guessArray = guess.split('');
        const secretArray = secretWord.split('');
        const matched = new Array(secretArray.length).fill(false);

        // Find exact matches first
        boxes.forEach((box, index) => {
            let position = box.getAttribute('data-index');
            setTimeout(function() {
            if (guessArray[index] === secretArray[index]) {
                box.classList.add('correct'); // Correct letter in the correct position
                matched[index] = true;
                guessArray[index] = null; // Mark this letter as matched
                updateKeyboardClass(secretArray[index], 'correct');
            }

            // Find other matches after
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
        }, (position*0.5)*1000);
        });

        // Second pass: find partial matches
        boxes.forEach((box, index) => {
        });

        // Check if the guess is correct

        if (guess === secretWord) {
            if (currentRowIndex == 0) {
                salert("Genius!", 2900);
            } else if (currentRowIndex == 1) {
                salert("Magnificent!", 2900);
            } else if (currentRowIndex == 2) {
                salert("impressive", 2900);
            } else if (currentRowIndex == 3) {
                salert("splendid", 2900);
            } else if (currentRowIndex == 4) {
                salert("great", 2900);
            } else if (currentRowIndex == 5) {
                salert("Phew!", 2900);
            }
          //  salert("Congratulations! You've guessed the word!", 2900);
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
             } else if (key.classList.contains('backspace-key')) {
                    handleInput('Backspace');
                } else {
                handleInput(keyText);
            }
        });
    });

    function adjustSize() {
        box.forEach((box) => {
            if (window.innerHeight <= 590) {
                box.style.height = "40px";
                box.style.width = "40px";
            } else if (window.innerHeight >= 590) {
                box.style.height = "50px";
                box.style.width = "50px";
            }
        })
    }


    loadWordList();
    updateFocus();
    adjustSize();
     window.addEventListener('load', adjustSize);
     window.addEventListener('resize', adjustSize);
});


