document.getElementById('login').addEventListener('input', function (e) {
    const input = e.target;
    const value = input.value.replace(/\D/g, ''); // Удаляем всё, кроме цифр

    // Форматируем как телефон, если начинается с +7 или 8
    if (/^(\+7|8)/.test(value)) {
        let formatted = '+7';
        if (value.length > 1) {
            formatted += ' (' + value.substring(1, 4);
        }
        if (value.length > 4) {
            formatted += ') ' + value.substring(4, 7);
        }
        if (value.length > 7) {
            formatted += '-' + value.substring(7, 9);
        }
        if (value.length > 9) {
            formatted += '-' + value.substring(9, 11);
        }
        input.value = formatted;
    }
});