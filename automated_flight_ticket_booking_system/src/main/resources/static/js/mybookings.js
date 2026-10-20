document.addEventListener('DOMContentLoaded', function () {
    // Ensure bookings is an array
    if (!Array.isArray(bookings)) {
        console.error('Bookings is not an array:', bookings);
        bookings = [];
    }
    
    renderBookings(bookings);

    function renderBookings(bookings) {
        const bookingsList = document.getElementById('bookings-list');
        bookingsList.innerHTML = '';

        if (!bookings || bookings.length === 0) {
            bookingsList.innerHTML = '<div class="no-bookings">У вас нет активных бронирований</div>';
            return;
        }

        bookings.forEach(booking => {
            const departureDate = new Date(booking.departureDate);
            const formattedDate = departureDate.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const bookingElement = document.createElement('div');
            bookingElement.className = 'ticket-card card';
            bookingElement.innerHTML = `
                <div class="ticket-content">
                    <div class="ticket-header">
                        <div>
                            <div class="ticket-time">${booking.formattedDepartureTime}</div>
                            <div class="ticket-city">${booking.departureCity}</div>
                            <div class="flight-date">${formattedDate}</div>
                        </div>
                        <div>
                            <div class="ticket-time">${booking.formattedArrivalTime}</div>
                            <div class="ticket-city">${booking.destinationCity}</div>
                        </div>
                    </div>
                    <div class="ticket-duration">
                        В пути <span>${booking.formattedDuration}</span>
                    </div>
                    <div class="ticket-info">
                        <div class="ticket-airline">${booking.airlineName} · ${booking.flightNumber}</div>
                        <div class="passenger-info">${booking.firstName} ${booking.middleName} ${booking.lastName}</div>
                    </div>
                    <div class="ticket-luggage">
                        <div class="ticket-luggage-item">
                            <i class="fas fa-briefcase"></i> Ручная кладь
                        </div>
                        <div class="ticket-luggage-item">
                            <i class="fas fa-suitcase"></i> Багаж: ${booking.luggage}
                        </div>
                    </div>
                    <div class="ticket-footer">
                        <div class="ticket-price">${booking.price.toLocaleString()} ₽</div>
                    </div>
                </div>
                <div class="ticket-actions">
                    <button class="action-btn" data-action="email" data-booking-id="${booking.bookingId}">
                        <i class="fas fa-envelope"></i>Отправить на e-mail
                    </button>
                    <button class="action-btn" data-action="download" data-booking-id="${booking.bookingId}">
                        <i class="fas fa-download"></i>Скачать бронь
                    </button>
                    <button class="action-btn cancel" data-action="cancel" data-booking-id="${booking.bookingId}">
                        <i class="fas fa-times"></i>Отменить бронь
                    </button>
                </div>
            `;
            bookingsList.appendChild(bookingElement);
        });

        // Обработчики кнопок
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const bookingId = this.dataset.bookingId;
                const action = this.dataset.action;
                
                try {
                    let response;
                    if (action === 'cancel') {
                        if (!confirm('Вы уверены, что хотите отменить бронирование?')) {
                            return;
                        }
                        response = await fetch(`/mybookings/cancel/${bookingId}`, {
                            method: 'DELETE'
                        });
                    } else if (action === 'email') {
                        response = await fetch(`/mybookings/email/${bookingId}`, {
                            method: 'POST'
                        });
                    } else if (action === 'download') {
                        response = await fetch(`/mybookings/download/${bookingId}`);
                        if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `ticket-${bookingId}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            a.remove();
                            return;
                        }
                    }

                    if (response.ok) {
                        const result = await response.json();
                        alert(result.message);
                        if (action === 'cancel') {
                            location.reload();
                        }
                    } else {
                        const result = await response.json();
                        alert(result.message || 'Произошла ошибка. Пожалуйста, попробуйте позже.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Произошла ошибка. Пожалуйста, попробуйте позже.');
                }
            });
        });
    }
});