        // تنظیمات بازی
        const COLS = 10;
        const ROWS = 20;
        const BLOCK_SIZE = 30;
        const COLORS = [
            null,
            '#FF0D72', // I
            '#0DC2FF', // J
            '#0DFF72', // L
            '#F538FF', // O
            '#FF8E0D', // S
            '#FFE138', // T
            '#3877FF'  // Z
        ];
        
        // اشکال تتریس
        const SHAPES = [
            null,
            [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
            [[2, 0, 0], [2, 2, 2], [0, 0, 0]],                         // J
            [[0, 0, 3], [3, 3, 3], [0, 0, 0]],                         // L
            [[0, 4, 4], [0, 4, 4], [0, 0, 0]],                         // O
            [[0, 5, 5], [5, 5, 0], [0, 0, 0]],                          // S
            [[0, 6, 0], [6, 6, 6], [0, 0, 0]],                          // T
            [[7, 7, 0], [0, 7, 7], [0, 0, 0]]                           // Z
        ];
        
        // عناصر DOM
        const canvas = document.getElementById('game-board');
        const ctx = canvas.getContext('2d');
        const nextCanvas = document.getElementById('next-piece');
        const nextCtx = nextCanvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        const linesElement = document.getElementById('lines');
        const startButton = document.getElementById('start-btn');
        const pauseButton = document.getElementById('pause-btn');
        
        // مقیاس بندی اندازه بلاک ها برای صفحه نمایش
        ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
        nextCtx.scale(BLOCK_SIZE / 2, BLOCK_SIZE / 2);
        
        // متغیرهای بازی
        let board = createMatrix(COLS, ROWS);
        let piece = null;
        let nextPiece = null;
        let score = 0;
        let level = 1;
        let lines = 0;
        let gameOver = false;
        let paused = false;
        let dropCounter = 0;
        let dropInterval = 1000;
        let lastTime = 0;
        let animationId = null;
        
        // ایجاد ماتریس بازی
        function createMatrix(w, h) {
            const matrix = [];
            while (h--) {
                matrix.push(new Array(w).fill(0));
            }
            return matrix;
        }
        
        // ایجاد قطعه تصادفی
        function createPiece() {
            const rand = Math.floor(Math.random() * 7) + 1;
            const shape = SHAPES[rand];
            return {
                pos: {x: Math.floor(COLS / 2) - 2, y: 0},
                matrix: shape,
                color: COLORS[rand]
            };
        }
        
        // رسم صفحه بازی
        function draw() {
            // پاک کردن صفحه
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // رسم قطعات ثابت
            drawMatrix(board, {x: 0, y: 0});
            
            // رسم قطعه فعال
            if (piece) {
                drawMatrix(piece.matrix, piece.pos);
            }
            
            // رسم کادر شبکه
            drawGrid();
        }
        
        // رسم قطعه بعدی
        function drawNextPiece() {
            nextCtx.fillStyle = '#111';
            nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
            
            if (nextPiece) {
                const offsetX = (nextCanvas.width / (BLOCK_SIZE / 2) - nextPiece.matrix[0].length) / 2;
                const offsetY = (nextCanvas.height / (BLOCK_SIZE / 2) - nextPiece.matrix.length) / 2;
                
                drawMatrix(nextPiece.matrix, {x: offsetX, y: offsetY}, nextCtx, BLOCK_SIZE / 2);
            }
        }
        
        // رسم ماتریس
        function drawMatrix(matrix, offset, context = ctx, blockSize = BLOCK_SIZE) {
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        context.fillStyle = COLORS[value] || piece.color;
                        context.fillRect(x + offset.x, y + offset.y, 1, 1);
                        
                        // اضافه کردن سایه برای جلوه پیکسلی
                        context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                        context.strokeRect(x + offset.x, y + offset.y, 1, 1);
                    }
                });
            });
        }
        
        // رسم شبکه بازی
        function drawGrid() {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 0.05;
            
            // خطوط عمودی
            for (let i = 0; i <= COLS; i++) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, ROWS);
                ctx.stroke();
            }
            
            // خطوط افقی
            for (let i = 0; i <= ROWS; i++) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(COLS, i);
                ctx.stroke();
            }
        }
        
        // ادغام قطعه با صفحه
        function merge() {
            piece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        board[y + piece.pos.y][x + piece.pos.x] = value;
                    }
                });
            });
        }
        
        // بررسی برخورد
        function collide() {
            const [m, o] = [piece.matrix, piece.pos];
            for (let y = 0; y < m.length; ++y) {
                for (let x = 0; x < m[y].length; ++x) {
                    if (m[y][x] !== 0 &&
                        (board[y + o.y] === undefined ||
                         board[y + o.y][x + o.x] === undefined ||
                         board[y + o.y][x + o.x] !== 0)) {
                        return true;
                    }
                }
            }
            return false;
        }
        
        // چرخش قطعه
        function rotate() {
            const matrix = piece.matrix;
            const N = matrix.length;
            
            // ترانهاده ماتریس
            for (let y = 0; y < N; ++y) {
                for (let x = 0; x < y; ++x) {
                    [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
                }
            }
            
            // معکوس کردن سطرها
            for (let y = 0; y < N; ++y) {
                matrix[y].reverse();
            }
            
            // اگر چرخش باعث برخورد شد، به حالت قبل برگرد
            if (collide()) {
                // چرخش معکوس
                for (let y = 0; y < N; ++y) {
                    matrix[y].reverse();
                }
                for (let y = 0; y < N; ++y) {
                    for (let x = 0; x < y; ++x) {
                        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
                    }
                }
            }
        }
        
        // حرکت به چپ
        function moveLeft() {
            piece.pos.x--;
            if (collide()) {
                piece.pos.x++;
            }
        }
        
        // حرکت به راست
        function moveRight() {
            piece.pos.x++;
            if (collide()) {
                piece.pos.x--;
            }
        }
        
        // حرکت به پایین
        function moveDown() {
            piece.pos.y++;
            if (collide()) {
                piece.pos.y--;
                merge();
                resetPiece();
                clearLines();
                updateScore();
            }
            dropCounter = 0;
        }
        
        // سقوط فوری
        function hardDrop() {
            while (!collide()) {
                piece.pos.y++;
            }
            piece.pos.y--;
            moveDown();
        }
        
        // ریست قطعه بعدی
        function resetPiece() {
            piece = nextPiece;
            nextPiece = createPiece();
            drawNextPiece();
            
            if (collide()) {
                gameOver = true;
                cancelAnimationFrame(animationId);
                alert(`بازی تمام شد! امتیاز شما: ${score}`);
                resetGame();
            }
        }
        
        // پاک کردن خطوط کامل
        function clearLines() {
            let linesCleared = 0;
            
            outer: for (let y = ROWS - 1; y >= 0; --y) {
                for (let x = 0; x < COLS; ++x) {
                    if (board[y][x] === 0) {
                        continue outer;
                    }
                }
                
                // حذف خط کامل
                const row = board.splice(y, 1)[0].fill(0);
                board.unshift(row);
                ++y; // بررسی دوباره همان سطر
                linesCleared++;
            }
            
            if (linesCleared > 0) {
                lines += linesCleared;
                
                // افزایش سطح بر اساس خطوط کامل شده
                level = Math.floor(lines / 10) + 1;
                
                // کاهش فاصله سقوط با افزایش سطح
                dropInterval = Math.max(100, 1000 - (level - 1) * 100);
            }
        }
        
        // به روز رسانی امتیاز
        function updateScore() {
            let points = 0;
            
            // محاسبه امتیاز بر اساس خطوط کامل شده
            switch (lines) {
                case 1: points = 100 * level; break;
                case 2: points = 300 * level; break;
                case 3: points = 500 * level; break;
                case 4: points = 800 * level; break;
            }
            
            score += points;
            scoreElement.textContent = score;
            levelElement.textContent = level;
            linesElement.textContent = lines;
        }
        
        // ریست بازی
        function resetGame() {
            board = createMatrix(COLS, ROWS);
            score = 0;
            level = 1;
            lines = 0;
            gameOver = false;
            dropInterval = 1000;
            
            scoreElement.textContent = score;
            levelElement.textContent = level;
            linesElement.textContent = lines;
            
            piece = createPiece();
            nextPiece = createPiece();
            drawNextPiece();
        }
        
        // حلقه بازی
        function update(time = 0) {
            if (gameOver || paused) {
                return;
            }
            
            const deltaTime = time - lastTime;
            lastTime = time;
            
            dropCounter += deltaTime;
            if (dropCounter > dropInterval) {
                moveDown();
            }
            
            draw();
            animationId = requestAnimationFrame(update);
        }
        
        // کنترل‌های صفحه کلید
        document.addEventListener('keydown', event => {
            if (gameOver || !piece || paused) return;
            
            switch (event.keyCode) {
                case 37: // چپ
                    moveLeft();
                    break;
                case 39: // راست
                    moveRight();
                    break;
                case 40: // پایین
                    moveDown();
                    break;
                case 38: // بالا (چرخش)
                    rotate();
                    break;
                case 32: // Space (سقوط فوری)
                    hardDrop();
                    break;
                case 80: // P (توقف)
                    togglePause();
                    break;
            }
        });
        
        // توقف/ادامه بازی
        function togglePause() {
            paused = !paused;
            if (paused) {
                cancelAnimationFrame(animationId);
                pauseButton.textContent = 'ادامه';
            } else {
                lastTime = 0;
                update();
                pauseButton.textContent = 'توقف';
            }
        }
        
        // شروع بازی
        startButton.addEventListener('click', () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            resetGame();
            paused = false;
            pauseButton.textContent = 'توقف';
            update();
        });
        
        pauseButton.addEventListener('click', togglePause);
        
        // مقداردهی اولیه
        resetGame();
        draw();
        drawNextPiece();