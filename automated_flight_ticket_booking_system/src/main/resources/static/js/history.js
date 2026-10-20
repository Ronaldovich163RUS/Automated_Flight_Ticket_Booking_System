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
            bookingsList.innerHTML = '<div class="no-bookings">У вас нет завершенных бронирований</div>';
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
            `;
            bookingsList.appendChild(bookingElement);
        });
    }
});