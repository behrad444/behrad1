const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 800;
        canvas.height = 500;
        
        // بازیگران
        const paddleWidth = 15, paddleHeight = 100;
        let playerPaddle = {
            x: 10,
            y: canvas.height / 2 - paddleHeight / 2,
            width: paddleWidth,
            height: paddleHeight,
            speed: 8,
            score: 0
        };
        
        let computerPaddle = {
            x: canvas.width - 10 - paddleWidth,
            y: canvas.height / 2 - paddleHeight / 2,
            width: paddleWidth,
            height: paddleHeight,
            speed: 5,
            score: 0
        };
        
        let ball = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 10,
            speedX: 5,
            speedY: 5
        };
        
        // کنترل‌ها
        let upPressed = false;
        let downPressed = false;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') upPressed = true;
            if (e.key === 'ArrowDown') downPressed = true;
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowUp') upPressed = false;
            if (e.key === 'ArrowDown') downPressed = false;
        });
        
        // توابع بازی
        function drawRect(x, y, width, height, color) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width, height);
        }
        
        function drawCircle(x, y, radius, color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        function resetBall() {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.speedX = -ball.speedX;
            ball.speedY = Math.random() * 8 - 4;
        }
        
        function update() {
            // حرکت بازیکن
            if (upPressed && playerPaddle.y > 0) {
                playerPaddle.y -= playerPaddle.speed;
            }
            if (downPressed && playerPaddle.y < canvas.height - playerPaddle.height) {
                playerPaddle.y += playerPaddle.speed;
            }
            
            // حرکت کامپیوتر (AI ساده)
            if (computerPaddle.y + computerPaddle.height / 2 < ball.y) {
                computerPaddle.y += computerPaddle.speed;
            }
            if (computerPaddle.y + computerPaddle.height / 2 > ball.y) {
                computerPaddle.y -= computerPaddle.speed;
            }
            
            // حرکت توپ
            ball.x += ball.speedX;
            ball.y += ball.speedY;
            
            // برخورد با دیوارها
            if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
                ball.speedY = -ball.speedY;
            }
            
            // برخورد با پدل‌ها
            if (
                ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
                ball.y > playerPaddle.y &&
                ball.y < playerPaddle.y + playerPaddle.height
            ) {
                ball.speedX = -ball.speedX * 1.05;
                ball.speedY = (ball.y - (playerPaddle.y + playerPaddle.height / 2)) * 0.2;
            }
            
            if (
                ball.x + ball.radius > computerPaddle.x &&
                ball.y > computerPaddle.y &&
                ball.y < computerPaddle.y + computerPaddle.height
            ) {
                ball.speedX = -ball.speedX * 1.05;
                ball.speedY = (ball.y - (computerPaddle.y + computerPaddle.height / 2)) * 0.2;
            }
            
            // امتیاز
            if (ball.x - ball.radius < 0) {
                computerPaddle.score++;
                document.getElementById('computerScore').textContent = computerPaddle.score;
                resetBall();
            }
            
            if (ball.x + ball.radius > canvas.width) {
                playerPaddle.score++;
                document.getElementById('playerScore').textContent = playerPaddle.score;
                resetBall();
            }
        }
        
        function draw() {
            // پاک کردن صفحه
            drawRect(0, 0, canvas.width, canvas.height, '#000');
            
            // خط وسط
            for (let i = 0; i < canvas.height; i += 20) {
                drawRect(canvas.width / 2 - 2, i, 4, 10, '#fff');
            }
            
            // پدل‌ها
            drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, '#fff');
            drawRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, '#fff');
            
            // توپ
            drawCircle(ball.x, ball.y, ball.radius, '#fff');
        }
        
        function gameLoop() {
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }
        
        gameLoop();