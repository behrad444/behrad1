const output = document.getElementById('output');
        const input = document.getElementById('input');
        
        let inventory = [];
        let currentRoom = 'start';
        let health = 100;
        
        const rooms = {
            start: {
                description: '<span class="system">شما در یک اتاق تاریک بیدار می‌شوید. در شمال یک در چوبی می‌بینید. در شرق یک پنجره شکسته است.</span>',
                exits: {north: 'hallway', east: 'garden'},
                items: ['چوب']
            },
            hallway: {
                description: '<span class="system">راهرویی طولانی با دیوارهای سنگی. در جنوب اتاقی که از آن آمده‌اید و در شمال یک در آهنی قرار دارد.</span>',
                exits: {south: 'start', north: 'treasure'},
                items: []
            },
            garden: {
                description: '<span class="system">باغی پر از گیاهان عجیب. یک <span class="item">کلید</span> روی زمین افتاده است. در غرب اتاق شروع قرار دارد.</span>',
                exits: {west: 'start'},
                items: ['کلید']
            },
            treasure: {
                description: '<span class="system">اتاق گنج! یک صندوقچه در مرکز اتاق قرار دارد. اما یک <span class="enemy">غول</span> از آن محافظت می‌کند!</span>',
                exits: {south: 'hallway'},
                items: [],
                enemy: {name: 'غول', health: 50, damage: 10}
            }
        };
        
        function print(text) {
            output.innerHTML += text + '<br>';
            output.scrollTop = output.scrollHeight;
        }
        
        function processCommand() {
            const command = input.value.trim().toLowerCase();
            input.value = '';
            
            print('<span class="command">> ' + command + '</span>');
            
            if (command === 'help') {
                print('<span class="system">دستورات موجود: برو [جهت]، بگیر [شیء]، استفاده کن [شیء]، موجودی، مبارزه [دشمن]، وضعیت</span>');
            }
            else if (command.startsWith('برو ')) {
                const direction = command.split(' ')[1];
                move(direction);
            }
            else if (command.startsWith('بگیر ')) {
                const item = command.split(' ')[1];
                takeItem(item);
            }
            else if (command === 'موجودی') {
                showInventory();
            }
            else if (command === 'وضعیت') {
                print(`<span class="system">سلامت: ${health}%</span>`);
            }
            else if (command.startsWith('مبارزه ')) {
                const enemy = command.split(' ')[1];
                fight(enemy);
            }
            else {
                print('<span class="system">دستور نامعتبر. برای کمک "help" را تایپ کنید.</span>');
            }
        }
        
        function move(direction) {
            if (rooms[currentRoom].exits[direction]) {
                currentRoom = rooms[currentRoom].exits[direction];
                print(rooms[currentRoom].description);
                
                if (currentRoom === 'treasure' && rooms[currentRoom].enemy.health > 0) {
                    print(`<span class="enemy">${rooms[currentRoom].enemy.name} به شما حمله می‌کند!</span>`);
                }
            } else {
                print('<span class="system">شما نمی‌توانید به آن جهت بروید.</span>');
            }
        }
        
        function takeItem(item) {
            const index = rooms[currentRoom].items.indexOf(item);
            if (index !== -1) {
                inventory.push(item);
                rooms[currentRoom].items.splice(index, 1);
                print(`<span class="system">شما ${item} را برداشتید.</span>`);
            } else {
                print('<span class="system">این شیء اینجا وجود ندارد.</span>');
            }
        }
        
        function showInventory() {
            if (inventory.length === 0) {
                print('<span class="system">موجودی شما خالی است.</span>');
            } else {
                print('<span class="system">موجودی شما:</span>');
                inventory.forEach(item => {
                    print(`<span class="item">- ${item}</span>`);
                });
            }
        }
        
        function fight(enemy) {
            if (currentRoom === 'treasure' && enemy === 'غول') {
                if (rooms[currentRoom].enemy.health <= 0) {
                    print('<span class="system">غول قبلاً شکست خورده است!</span>');
                    return;
                }
                
                if (inventory.includes('شمشیر')) {
                    const damage = Math.floor(Math.random() * 20) + 10;
                    rooms[currentRoom].enemy.health -= damage;
                    print(`<span class="system">شما با شمشیر به غول ${damage} آسیب زدید!</span>`);
                    
                    if (rooms[currentRoom].enemy.health <= 0) {
                        print('<span class="system">شما غول را شکست دادید! صندوقچه گنج باز است!</span>');
                        return;
                    }
                } else {
                    print('<span class="system">شما سلاحی برای مبارزه ندارید!</span>');
                }
                
                // حمله دشمن
                health -= rooms[currentRoom].enemy.damage;
                print(`<span class="enemy">غول به شما ${rooms[currentRoom].enemy.damage} آسیب زد! سلامت شما: ${health}%</span>`);
                
                if (health <= 0) {
                    print('<span class="enemy">شما مردید! بازی تمام شد.</span>');
                    resetGame();
                }
            } else {
                print('<span class="system">دشمنی برای مبارزه اینجا نیست.</span>');
            }
        }
        
        function resetGame() {
            print('<span class="system">بازی از نو شروع می‌شود...</span>');
            inventory = [];
            currentRoom = 'start';
            health = 100;
            rooms.treasure.enemy.health = 50;
            print(rooms[currentRoom].description);
        }
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                processCommand();
            }
        });
        
        // شروع بازی
        print('<span class="system">ماجراجویی متنی - برای شروع "help" را تایپ کنید</span>');
        print(rooms[currentRoom].description);