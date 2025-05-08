// فیلتر کردن بازی‌ها بر اساس دسته‌بندی
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // حذف کلاس active از همه دکمه‌ها
        document.querySelectorAll('.category-btn').forEach(b => {
            b.classList.remove('active');
        });
        
        // اضافه کردن کلاس active به دکمه انتخاب شده
        btn.classList.add('active');
        
        const category = btn.textContent;
        const gameCards = document.querySelectorAll('.game-card');
        
        gameCards.forEach(card => {
            if (category === 'همه') {
                card.style.display = 'block';
            } else {
                if (card.dataset.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });
});

// انیمیشن اسکرول نرم
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
