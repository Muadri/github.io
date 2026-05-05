// script.js - Countdown Timer for Innovation Competition 2026
// Target: 3rd August 2026, 08:00 AM (user's local timezone)

(function() {
    // Target date: August 3, 2026 at 8:00:00 AM local time
    // Note: month parameter is 0-indexed (7 = August)
    const TARGET_DATE = new Date(2026, 7, 3, 8, 0, 0);
    
    // DOM Elements
    const daysSpan = document.getElementById('days');
    const hoursSpan = document.getElementById('hours');
    const minutesSpan = document.getElementById('minutes');
    const secondsSpan = document.getElementById('seconds');
    const messageBox = document.getElementById('messageBox');
    const refreshBtn = document.getElementById('refreshBtn');
    
    let timerInterval = null;
    
    /**
     * Format number with leading zero (e.g., 5 -> "05")
     * @param {number} value - The number to format
     * @returns {string} Formatted string with at least 2 digits
     */
    function formatTimeUnit(value) {
        return value < 10 ? '0' + value : value.toString();
    }
    
    /**
     * Update the countdown display and message based on remaining time
     * This function calculates the difference between target date and current time,
     * updates all timer elements, and changes the motivational message.
     */
    function updateCountdown() {
        const now = new Date();
        const timeDiff = TARGET_DATE - now;
        
        // Check if countdown has finished
        if (timeDiff <= 0) {
            // Stop the timer interval
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            
            // Display zeros
            daysSpan.innerHTML = '00';
            hoursSpan.innerHTML = '00';
            minutesSpan.innerHTML = '00';
            secondsSpan.innerHTML = '00';
            
            // Celebration message
            messageBox.innerHTML = '🎉🎊 HARI INOVASI TELAH TIBA! SELAMAT BERSAING! 🎊🎉';
            messageBox.style.background = "#ffecb3";
            messageBox.style.borderLeft = "5px solid #ff9f4a";
            messageBox.style.borderRight = "5px solid #ff9f4a";
            messageBox.style.fontWeight = "bold";
            return;
        }
        
        // Calculate remaining time components
        const totalSeconds = Math.floor(timeDiff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        // Update the display
        daysSpan.innerHTML = formatTimeUnit(days);
        hoursSpan.innerHTML = formatTimeUnit(hours);
        minutesSpan.innerHTML = formatTimeUnit(minutes);
        secondsSpan.innerHTML = formatTimeUnit(seconds);
        
        // Dynamic motivational messages based on remaining time
        // Reset message style to default each time
        messageBox.style.background = "#fff5e6";
        messageBox.style.borderLeft = "5px solid #f4ac5d";
        messageBox.style.borderRight = "5px solid #f4ac5d";
        messageBox.style.fontWeight = "600";
        
        if (days === 0 && hours < 2 && hours >= 0) {
            messageBox.innerHTML = '🔥 KURANG DARI 2 JAM! BERSEDIA DENGAN PENUH SEMANGAT! 🔥';
            messageBox.style.background = "#ffe0b3";
        } else if (days === 0 && hours < 6) {
            messageBox.innerHTML = '🌅 SUBUH INOVASI: Tidak lama lagi! Pastikan persiapan terakhir 🌅';
            messageBox.style.background = "#fff0d4";
        } else if (days < 3 && days > 0) {
            messageBox.innerHTML = '⚡ Hanya beberapa hari lagi! Rehat yang cukup & semangat juang! ⚡';
        } else if (days < 7 && days >= 3) {
            messageBox.innerHTML = '📢 Kurang seminggu! Setiap detik membawa inspirasi baru! 📢';
        } else if (days >= 7 && days < 30) {
            messageBox.innerHTML = '⏳ Persiapan sedang giat dijalankan — teruskan inovasi anda! ⏳';
        } else {
            messageBox.innerHTML = '✨ Momen berharga menuju Pertandingan Inovasi UPSI 2026! ✨';
        }
        
        // Bonus: Add subtle animation to message when less than 1 day
        if (days === 0 && hours < 24) {
            messageBox.style.transition = "all 0.3s ease";
        }
    }
    
    /**
     * Manually sync/refresh the countdown
     * This function forces an immediate update and ensures the timer is running.
     * Provides visual feedback on the button.
     */
    function syncCountdown() {
        // Force immediate update
        updateCountdown();
        
        // Restart interval to avoid any desync
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        timerInterval = setInterval(updateCountdown, 1000);
        
        // Visual feedback on button click
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '✓ Disegerakkan!';
        refreshBtn.style.opacity = '0.9';
        
        // Reset button text after 1 second
        setTimeout(() => {
            if (refreshBtn) {
                refreshBtn.innerHTML = originalText;
                refreshBtn.style.opacity = '1';
            }
        }, 1000);
    }
    
    /**
     * Initialize the countdown timer
     * Validates target date, starts the interval, and attaches event listeners
     */
    function init() {
        // Validate target date
        if (isNaN(TARGET_DATE.getTime())) {
            console.error("Invalid target date");
            if (messageBox) {
                messageBox.innerHTML = "⚠️ Tarikh sasaran tidak sah. Sila semak semula kod.";
                messageBox.style.background = "#ffe0e0";
                messageBox.style.borderLeft = "5px solid #ff6b6b";
            }
            return;
        }
        
        // Initial update
        updateCountdown();
        
        // Start interval (update every second)
        timerInterval = setInterval(updateCountdown, 1000);
        
        // Add refresh button event listener
        if (refreshBtn) {
            refreshBtn.addEventListener('click', syncCountdown);
        }
    }
    
    // Clean up interval on page unload (good practice)
    window.addEventListener('beforeunload', function() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
    });
    
    // Start the application when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();