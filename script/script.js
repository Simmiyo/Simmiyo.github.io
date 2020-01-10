class AudioController {  //the class that decides the way sounds are handled
    constructor(gameMode) {
        console.log(gameMode); //gameMode is the js parameter emitted by each index page 
        if(gameMode == "mode1") {   //(according to the design type chosen by the player through the settings                                 //menu) which speciffies the background music that should be played
            this.bgMusic = new Audio('audio/harryPotter.mp3');
        } else {
            this.bgMusic = new Audio('audio/Lilium.mp3');
        }
        this.flipSound = new Audio('audio/flip.wav'); //the sound effects disposed when flipping the cards,
        this.matchSound = new Audio('audio/match.wav'); //finding a pair,
        this.victorySound = new Audio('audio/win.mp3'); //completing the game (finding all the pairs)
        this.gameOverSound = new Audio('audio/gameOver.mp3'); //and losing the game (because of going beyond                                      //the time limit) are universal (the same despite the selected mode)
        this.bgMusic.volume = 0.5;
        this.bgMusic.loop = true; //the background music keeps playing while in a game
    }
    startMusic() {
        this.bgMusic.play();
    }
    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0; //after a game ends, beginning a new one causes the background music to
    }                                 //start over instead of playing the song from where it was interrupted 
    flip() {
        this.flipSound.play();
    }
    match() {
        this.matchSound.play();
    }
    victory() {
        this.stopMusic();
        this.victorySound.play();
    }
    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
    }
}

class matchCards { //the class that controls the game itself
    constructor(totalTime, cards, gameMode) {
        this.cardsArray = cards; //the array which memorises all the cards in the game
        this.totalTime = totalTime; //the number of seconds the player has to complete the game
        this.timeRemaining = totalTime; //the number of seconds left for the player to complete tha game
        this.timer = document.getElementById('time-remaining'); //time displayed, real-life updated
        this.ticker = document.getElementById('flips'); //display number of flips executed, real-time updated
        this.audioController = new AudioController(gameMode); //play a certain background music
    }

    startGame() {
        this.totalClicks = 0;
        this.timeRemaining = this.totalTime;
        this.cardToCheck = null;
        this.matchedCards = [];
        this.busy = true;
        setTimeout(() => {
            this.audioController.startMusic();
            this.shuffleCards(this.cardsArray);
            this.countdown = this.startCountdown();
            this.busy = false;
        }, 500)
        this.hideCards();
        this.timer.innerText = this.timeRemaining;
        this.ticker.innerText = this.totalClicks;
    }
    startCountdown() { //counts each second that passes, decreasing the remained time on the screen
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if(this.timeRemaining === 0) //ends the game if time limit is reached
                this.gameOver();
        }, 1000); //1000 means one second
    }
    gameOver() {
        clearInterval(this.countdown); //resets the countdown
        this.audioController.gameOver(); //game failed sound effect
        document.getElementById('game-over-text').classList.add('visible'); //displays the game over text
    }
    victory() {
        clearInterval(this.countdown); //resets the countdown
        this.audioController.victory(); //game completed sound effect
        document.getElementById('victory-text').classList.add('visible'); //displays the game won text
    } 
    hideCards() { //especially for new games, turns every card with the face down
        this.cardsArray.forEach(card => {
            card.classList.remove('visible'); //ignores the fact that some cards are marked as visible
            card.classList.remove('matched'); //or matched in order to hide all
        });
    }
    flipCard(card) {
        if(this.canFlipCard(card)) { //checks if a card is able to be flipped
            this.audioController.flip(); //plays flip sound effect
            this.totalClicks++; //increases the number of flips 
            this.ticker.innerText = this.totalClicks; //and displays it on the screen in real-time
            card.classList.add('visible'); //the card is added to the array, being marked as visible
                                            //since it is turned with the face up
            //checks if, during one attempt of discovering a possible pair, the card just flipped by the user
            if(this.cardToCheck) { //is either the second one turned with the face up of the round
                this.checkForCardMatch(card); //case in which, both these cards are compared 
            } else { //or the first one
                this.cardToCheck = card; //case in which, it will be memorised for the further comparison
            }
        }
    }
    checkForCardMatch(card) { //compares two cards
        if(this.getCardType(card) === this.getCardType(this.cardToCheck))
            this.cardMatch(card, this.cardToCheck);
        else 
            this.cardMismatch(card, this.cardToCheck);

        this.cardToCheck = null; //end of a round (attempt to find a pair)
    }
    cardMatch(card1, card2) { //called when a pair is found
        this.matchedCards.push(card1); //adds each member of the pair to the array of already matched cards
        this.matchedCards.push(card2);
        card1.classList.add('matched'); //marks each member of the pair as matched, not to be checked again
        card2.classList.add('matched');
        this.audioController.match(); //plays pair made sound effect
        if(this.matchedCards.length === this.cardsArray.length)
            this.victory(); //decides the game is won when the found pairs coincide with the total pairs
    }
    cardMismatch(card1, card2) { //called when two cards are simultanously turned with the face up,
        this.busy = true;           //as they are supposed to form a pair, but in fact they don't
        setTimeout(() => {
            card1.classList.remove('visible'); //the "visible" label on those two is removed
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }
    shuffleCards(cardsArray) { //uses Fisher-Yates Shuffle Algorithm to randomly place the cards
        for (let i = cardsArray.length - 1; i > 0; i--) {
            let randIndex = Math.floor(Math.random() * (i + 1));
            cardsArray[randIndex].style.order = i;
            cardsArray[i].style.order = randIndex; //a random order value is assigned to each element of the 
        }                                                   //cards array
    }
    getCardType(card) { //searches inside the div containing the current card for the element being in the 
        return card.getElementsByClassName('card-value')[0].src; //card-vaue class and returns
    }                                                     //the address of the image appearing on the card
    canFlipCard(card) { //specifies if a certain card is allowed to flip
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
    } //a card is allowed to flip at an user's click if there is no other action taking place at that time, //if it isn't part of one of the already found pairs and if it isn't already with the face up
}

function ready(gameMode) {
    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    let cards = Array.from(document.getElementsByClassName('card'));
    console.log(gameMode)
    let game = new matchCards(100, cards, gameMode);

    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
            game.startGame();
        });
    });

    cards.forEach(card => {
        card.addEventListener('click', () => {
            game.flipCard(card);
        });
    });
}