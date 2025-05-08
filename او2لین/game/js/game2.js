const secretNumber = Math.floor(Math.random() * 100) + 1;
        let attempts = 0;
        
        function checkGuess() {
            const guess = parseInt(document.getElementById('guess').value);
            attempts++;
            
            if (guess === secretNumber) {
                document.getElementById('message').textContent = 
                    `تبریک! عدد ${secretNumber} را در ${attempts} تلاش حدس زدید!`;
            } else if (guess < secretNumber) {
                document.getElementById('message').textContent = 'عدد بزرگ‌تر است!';
            } else {
                document.getElementById('message').textContent = 'عدد کوچک‌تر است!';
            }
        }