// Add animation and interaction tracking
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Optional: Track category clicks or add analytics
            console.log('Category explored:', this.dataset.category);
        });
    });

    // Smooth scroll for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });