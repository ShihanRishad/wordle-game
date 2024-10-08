document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/Stopwatch/service-worker.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          }, error => {
            console.log('ServiceWorker registration failed: ', error);
          });
        });
      }
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
    var themeBtn = document.querySelector(".themeBtn");
    var headline = document.querySelector(".headline");
    let devicetheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-theme' : 'light-theme';
    let nowTheme;
  //  let type = typeof(localStorage);

  function setClass(element, name, position) {
    setTimeout(function() {    
        element.classList.add(name);
    }, (position * 0.3) * 1000);
  }
  
  function popupHide() {
    var pop = document.querySelector(".popup");
    pop.style.animation = "goOut 0.3s";
    pop.addEventListener('animationend', function() {
        pop.style.display = "none";
        document.querySelector(".back").style.display = "none";
    })
  }
  document.querySelector(".start").addEventListener("click", popupHide);
  
  function isLocalStorageAvailable() {
    try {
        var test = "__storage_test__";
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
          return false;
      }
  }
  
  
  // Apply the stored theme or default to the device theme
  
  function decideTheme() {
      if (isLocalStorageAvailable()) {
          var storedTheme = localStorage.getItem("wordleTheme");
          if (storedTheme) {
              applyTheme(storedTheme);
          } else {
              applyTheme(devicetheme);
          }
          console.log("Your browser supports localStorage. Applying your prefered theme...")
  } else {
      applyTheme(devicetheme);
     // console.log("Sorry, your browser doesn't support localStorage. Let's try changing another way. 😀")
  }
}

decideTheme()
    
    function applyTheme(theme) {
        if (theme == "dark-theme") { // Dark theme
            document.querySelectorAll('html *').forEach(function(element) {
                element.classList.add('dark');
                document.querySelector(".enter_icon").src = "check_icon-white.svg";
                document.querySelector(".bsicon").src = "backspace-white.svg";
            });
            headline.fill = "white";
            nowTheme = "dark-theme";
            document.querySelector(".enter_icon-t").src = "check_icon-white.svg";
        } else { //Light theme
            document.querySelectorAll('.dark').forEach(function(element) {
                element.classList.remove('dark');
            });
            document.querySelector(".enter_icon").src = "check_icon.svg";
            document.querySelector(".bsicon").src = "backspace.svg";
            headline.fill = "black";
            nowTheme = "light-theme";
            document.querySelector(".enter_icon-t").src = "check_icon.svg";
        }
    }
    
    themeBtn.addEventListener("click", function() {
        if (isLocalStorageAvailable()) {
        let newTheme;
      //  let currentTheme = localStorage.getItem("wordleTheme");

         newTheme = nowTheme === "dark-theme" ? "light-theme" : "dark-theme";
         // Update the theme preference in localStorage
         localStorage.setItem("wordleTheme", newTheme); 
         // Apply the new theme
         applyTheme(newTheme);
        } else {
            let newTheme;
            newTheme = nowTheme === "dark-theme" ? "light-theme" : "dark-theme";
            applyTheme(newTheme);
        }

        });

    function animate(row, extrani) {
        var aniBox = row.querySelectorAll(".input-box");
    
        // Function to remove animation property
        function removeAnimation(event) {
            event.target.style.animation = '';
            event.target.removeEventListener('animationend', removeAnimation);
        }
    
        if (extrani == "shake") {
            row.style.animation = "shake 0.5s";
            row.addEventListener('animationend', removeAnimation);
        } else if (extrani == "win") {
            aniBox.forEach(box => {
                let position = box.getAttribute('data-index');
                box.style.animation = "win 0.2s";
                box.style.animationDelay = `${position * 0.1}s`;
                box.addEventListener('animationend', removeAnimation);
            });
        } else if (extrani == "defult") {
            aniBox.forEach(box => {
                let position = box.getAttribute('data-index');
                box.style.animation = "flip 0.5s";
                box.style.animationDelay = `${position * 0.3}s`;
                box.addEventListener('animationend', removeAnimation);
            });
        }
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
            } else if (currentIndex <= boxes.length - 1) {
                salert("Not enough letters!", 1500);
                animate(currentRow, "shake");
            } else {
                salert("Too much letter...? If you get it, then it means it's a bug, you can let me know about this bug!", 3500)
                return;
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

    let boxClass;
    function checkGuess() {
      
        const currentRow = rows[currentRowIndex];
        
        const boxes = currentRow.querySelectorAll('.input-box');
        let guess = "";
        boxes.forEach(box => guess += box.textContent);
        

        if (guess.length < secretWord.length) {
            return;
        };

        if (!isValidWord(guess)) {
            salert('Invalid word!', 2900);
            animate(currentRow, "shake");
            return;
        }

        animate(currentRow, "defult");
        const guessArray = guess.split('');
        const secretArray = secretWord.split('');
        const matched = new Array(secretArray.length).fill(false);
        const guessMatches = new Array(guessArray.length).fill(false);


                    // First pass: find exact matches
                    boxes.forEach((box, index) => {
                        let position = box.getAttribute('data-index');
                        if (guessArray[index] === secretArray[index]) {
                            setClass(box, "correct", position);
                            boxClass = "correct";
                            matched[index] = true;
                            guessMatches[index] = true;
                            updateKeyboardClass(secretArray[index], 'correct');
                        }
                    });
                    
                    // Second pass: find partial matches
                    boxes.forEach((box, index) => {
                        let position = box.getAttribute('data-index');
                        if (!guessMatches[index] && guessArray[index] !== null) {
                            // Find the first unmatched occurrence in secretArray
                            for (let i = 0; i < secretArray.length; i++) {
                                if (guessArray[index] === secretArray[i] && !matched[i]) {
                                    setClass(box, "present", position);
                                    boxClass = "present";
                                    matched[i] = true;
                                    guessMatches[index] = true;
                                    updateKeyboardClass(guessArray[index], 'present');
                                    break;
                                }
                            }
                            // If no match found, mark as absent
                            if (!guessMatches[index]) { 
                                    setClass(box, "absent", position);
                                    boxClass = "absent";   

                                updateKeyboardClass(guessArray[index], 'absent');
                            }
                        } else if (!boxClass == 'correct') {
                            setClass(box, "absent", position);
                            boxClass = "absent";                  
                            updateKeyboardClass(guessArray[index], 'absent');
                        }
                    });


        // Check if the guess is correct
        if (guess === secretWord) {
            setTimeout(function() {
                if (currentRowIndex == 0) {
                    salert("Genius!", 2900);
                } else if (currentRowIndex == 1) {
                    salert("Magnificent!", 2900);
                } else if (currentRowIndex == 2) {
                    salert("Impressive!", 2900);
                } else if (currentRowIndex == 3) {
                    salert("Splendid!", 2900);
                } else if (currentRowIndex == 4) {
                    salert("Great!", 2900);
                } else if (currentRowIndex == 5) {
                    salert("Phew!", 2900);
                }
                animate(currentRow, "win");
            }, 2000);
        } else if (currentRowIndex < maxGuesses - 1) {
            currentRowIndex++;
            currentIndex = 0;
            updateFocus();
        } else {
            salert("Game over! The word was " + secretWord, 2900);
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


