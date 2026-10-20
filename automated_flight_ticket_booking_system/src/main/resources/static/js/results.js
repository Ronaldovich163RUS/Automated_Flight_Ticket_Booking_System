document.addEventListener('DOMContentLoaded', function () {
    // Global variables for selected flights
    let selectedOutboundFlight = null;
    let selectedReturnFlight = null;
    let isRoundTrip = document.getElementById('round-trip')?.checked || false; // Initialize based on actual radio button state

    // Function to update the display of selected flights
    function updateSelectedFlightsDisplay() {
        const outboundDisplay = document.getElementById('selectedOutboundFlight');
        const returnDisplay = document.getElementById('selectedReturnFlight');

        if (outboundDisplay) {
            outboundDisplay.textContent = selectedOutboundFlight ? `Рейс ${selectedOutboundFlight.flightNumber}` : 'Не выбран';
        }

        if (returnDisplay) {
            returnDisplay.textContent = selectedReturnFlight ? `Рейс ${selectedReturnFlight.flightNumber}` : 'Не выбран';
        }
    }

    // Function to update the main book button for round-trip flights
    function updateBookButtonState() {
        const bookButton = document.getElementById('round-trip-book-btn');
        if (!bookButton) return; // Ensure button exists

        if (selectedOutboundFlight && selectedReturnFlight) {
            bookButton.disabled = false;
            bookButton.classList.remove('disabled');
            const totalPrice = selectedOutboundFlight.minPrice + selectedReturnFlight.minPrice; // Assuming minPrice is the price for the selected flight
            bookButton.textContent = `ЗАБРОНИРОВАТЬ - ${formatPrice(totalPrice)} ₽`;
        } else {
            bookButton.disabled = true;
            bookButton.classList.add('disabled');
            bookButton.textContent = 'ЗАБРОНИРОВАТЬ';

            if (isRoundTrip && selectedOutboundFlight && !selectedReturnFlight) {
                showNotification('Выберите обратный рейс', 'info');
            } else if (isRoundTrip && !selectedOutboundFlight && selectedReturnFlight) {
                showNotification('Выберите рейс туда', 'info');
            } else if (isRoundTrip && !selectedOutboundFlight && !selectedReturnFlight) {
                // No flights selected yet, don't show notification immediately to avoid spam
            }
        }
    }

    // Main handler for checkbox changes (used for round-trip flight selection)
    function handleFlightSelection(e) {
        const currentCheckbox = e.target;
        const direction = currentCheckbox.name.includes('outbound') ? 'outbound' : 'return';
        const flightId = currentCheckbox.value;

        // Find the full flight object from initialFlightData
        const allFlights = (window.initialFlightData.flightsOneWay || []).concat(window.initialFlightData.flightsReturn || []);
        const clickedFlight = allFlights.find(f => f.flightID == flightId);

        // Remove 'selected' class from all other cards in the same direction
        document.querySelectorAll(`input[name="flight-${direction}"]`).forEach(checkbox => {
            const card = checkbox.closest('.ticket-card');
            if (checkbox !== currentCheckbox) {
                checkbox.checked = false; // Ensure only one is checked
                if (card) card.classList.remove('selected');
            }
        });

        // Update global selected flights and card UI
        if (currentCheckbox.checked) {
            if (direction === 'outbound') {
                selectedOutboundFlight = clickedFlight;
            } else {
                selectedReturnFlight = clickedFlight;
            }
            if (clickedFlight) currentCheckbox.closest('.ticket-card')?.classList.add('selected');
        } else {
            // If unchecked, clear the selection
            if (direction === 'outbound') {
                selectedOutboundFlight = null;
            } else {
                selectedReturnFlight = null;
            }
            currentCheckbox.closest('.ticket-card')?.classList.remove('selected');
        }

        updateBookButtonState(); // Update the main book button state and notifications
        updateSelectedFlightsDisplay(); // Update display for selected flights
    }

    // Initialize form functionality
    initFormFunctionality();

    // Convert date from dd.MM.yyyy to yyyy-MM-dd format
    function convertDateFormat(dateStr) {
        if (!dateStr) return '';
        const [day, month, year] = dateStr.split('.');
        return `${year}-${month}-${day}`;
    }

    // Set initial dates from server data
    const departureDate = document.getElementById('departure-date');
    const returnDate = document.getElementById('return-date');
    
    /*
    if (departureDate && departureDate.value) {
        departureDate.value = convertDateFormat(departureDate.value);
    }
    if (returnDate && returnDate.value) {
        returnDate.value = convertDateFormat(returnDate.value);
    }*/

    // Initialize form functionality
    function initFormFunctionality() {
        // Set min date for departure date
        const today = new Date().toISOString().split('T')[0];
        const departureDateInput = document.getElementById('departure-date');
        if (departureDateInput) {
            departureDateInput.min = today;
            // Clear any pre-existing error classes
            departureDateInput.closest('.form-group')?.classList.remove('error');
        }

        // Initialize return date field
        const returnDateGroup = document.getElementById('return-date-group');
        const returnDateInput = document.getElementById('return-date');
        const oneWayRadio = document.getElementById('one-way');
        const roundTripRadio = document.getElementById('round-trip');

        if (oneWayRadio && roundTripRadio && returnDateGroup && returnDateInput) {
            // Set initial visibility
            if (oneWayRadio.checked) {
                returnDateGroup.style.visibility = 'hidden';
                returnDateInput.removeAttribute('required');
                isRoundTrip = false; // Update global variable on init
            }

            // Handle radio button changes
            oneWayRadio.addEventListener('change', function() {
                if (this.checked) {
                    returnDateGroup.style.visibility = 'hidden';
                    returnDateInput.removeAttribute('required');
                    clearError('return-date');
                    isRoundTrip = false; // Update global variable
                    selectedOutboundFlight = null; // Clear selections if trip type changes
                    selectedReturnFlight = null;
                    updateBookButtonState(); // Update the main book button state
                }
            });

            roundTripRadio.addEventListener('change', function() {
                if (this.checked) {
                    returnDateGroup.style.visibility = 'visible';
                    returnDateInput.setAttribute('required', '');
                    setMinReturnDate();
                    isRoundTrip = true; // Update global variable
                    selectedOutboundFlight = null; // Clear selections if trip type changes
                    selectedReturnFlight = null;
                    updateBookButtonState(); // Update the main book button state
                }
            });

            // Set up date validation
            departureDateInput.addEventListener('change', function() {
                if (returnDateInput.value && returnDateInput.value < this.value) {
                    returnDateInput.value = '';
                }
                setMinReturnDate();
                if (this.value) {
                    clearError('departure-date');
                }
            });

            returnDateInput.addEventListener('focus', function() {
                setMinReturnDate();
            });

            returnDateInput.addEventListener('change', function() {
                if (this.value) {
                    clearError('return-date');
                }
            });
        }

        // Initialize destination field
        const toInput = document.getElementById('to');
        if (toInput) {
            toInput.addEventListener('change', function() {
                if (this.value) {
                    clearError('to');
                }
            });
            // Clear any pre-existing error classes
            toInput.closest('.form-group')?.classList.remove('error');
        }

        // Initialize passenger management
        setupPassengerControls();
    }

    // Set minimum return date based on departure date
    function setMinReturnDate() {
        const departureDate = document.getElementById('departure-date').value;
        const returnDateInput = document.getElementById('return-date');
        if (departureDate && returnDateInput) {
            returnDateInput.min = departureDate;
            }
    }

    // Setup passenger controls
    function setupPassengerControls() {
        const decreaseAdults = document.getElementById('decrease-adults');
        const increaseAdults = document.getElementById('increase-adults');
        const adultsCount = document.getElementById('adults-count');
        const decreaseChildren = document.getElementById('decrease-children');
        const increaseChildren = document.getElementById('increase-children');
        const childrenCount = document.getElementById('children-count');
        const decreaseInfants = document.getElementById('decrease-infants');
        const increaseInfants = document.getElementById('increase-infants');
        const infantsCount = document.getElementById('infants-count');
        const totalPassengers = document.getElementById('total-passengers');

        function updatePassengerCount() {
            const adults = parseInt(adultsCount.textContent);
            const children = parseInt(childrenCount.textContent);
            const infants = parseInt(infantsCount.textContent);
            const totalMainPassengers = adults + children;
            const total = adults + children + infants;

            totalPassengers.textContent = total;

/*
            // Update hidden fields
            document.querySelector('input[name="adults"]').value = adults;
            document.querySelector('input[name="children"]').value = children;
            document.querySelector('input[name="infants"]').value = infants;
*/
            // Update button states
            decreaseAdults.disabled = adults <= 1;
            increaseAdults.disabled = totalMainPassengers >= 3;
            decreaseChildren.disabled = children <= 0;
            increaseChildren.disabled = totalMainPassengers >= 3;
            decreaseInfants.disabled = infants <= 0;
            increaseInfants.disabled = infants >= adults;

            // Clear any passenger-related errors when counts are valid
            if (totalMainPassengers <= 3 && infants <= adults) {
                clearError('adults-count');
            }
        }

        function changePassengerCount(element, increment) {
            let count = parseInt(element.textContent);
            const adults = parseInt(adultsCount.textContent);
            const children = parseInt(childrenCount.textContent);
            const infants = parseInt(infantsCount.textContent);
            const totalMainPassengers = adults + children;

            if (element === adultsCount) {
                if (increment > 0 && totalMainPassengers >= 3) return;
                if (increment < 0 && count <= 1) return;
                count += increment;
                // Adjust infants if reducing adults
                if (increment < 0 && infants > count) {
                    infantsCount.textContent = count;
                }
            } else if (element === childrenCount) {
                if (increment > 0 && totalMainPassengers >= 3) return;
                if (increment < 0 && count <= 0) return;
                count += increment;
            } else if (element === infantsCount) {
                if (increment > 0 && infants >= adults) return;
                if (increment < 0 && count <= 0) return;
                count += increment;
            }

            element.textContent = count;
            updatePassengerCount();
        }

        // Bind event listeners
        if (decreaseAdults) decreaseAdults.addEventListener('click', () => changePassengerCount(adultsCount, -1));
        if (increaseAdults) increaseAdults.addEventListener('click', () => changePassengerCount(adultsCount, 1));
        if (decreaseChildren) decreaseChildren.addEventListener('click', () => changePassengerCount(childrenCount, -1));
        if (increaseChildren) increaseChildren.addEventListener('click', () => changePassengerCount(childrenCount, 1));
        if (decreaseInfants) decreaseInfants.addEventListener('click', () => changePassengerCount(infantsCount, -1));
        if (increaseInfants) increaseInfants.addEventListener('click', () => changePassengerCount(infantsCount, 1));

        // Initialize passenger counts
        updatePassengerCount();
    }

    // Form validation
    function validateForm() {
        let isValid = true;
        const errors = [];

        // Clear all previous errors first
        clearAllErrors();

        // Validate destination
        const toInput = document.getElementById('to');
        if (!toInput.value.trim()) {
            showFieldError(toInput, 'Пожалуйста, выберите город назначения');
            isValid = false;
        }

        // Validate departure date
        const departureDate = document.getElementById('departure-date');
        if (!departureDate.value) {
            showFieldError(departureDate, 'Пожалуйста, укажите дату вылета');
            isValid = false;
        } else {
            const depDate = new Date(departureDate.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (depDate < today) {
                showFieldError(departureDate, 'Дата вылета не может быть в прошлом');
                isValid = false;
            }
        }

        // Validate return date for round trips
        const roundTripRadio = document.getElementById('round-trip');
        if (roundTripRadio && roundTripRadio.checked) {
            const returnDate = document.getElementById('return-date');
            if (!returnDate.value) {
                showFieldError(returnDate, 'Пожалуйста, укажите дату возвращения');
                isValid = false;
            } else {
                const depDate = new Date(departureDate.value);
                const retDate = new Date(returnDate.value);
                if (retDate < depDate) {
                    showFieldError(returnDate, 'Дата возвращения должна быть не раньше даты вылета');
                    isValid = false;
                }
            }
        }

        // Validate passenger counts
        const adults = parseInt(document.getElementById('adults-count').textContent);
        const children = parseInt(document.getElementById('children-count').textContent);
        const infants = parseInt(document.getElementById('infants-count').textContent);

        if (adults + children > 3) {
            showError('Общее количество взрослых и детей не может превышать 3');
            const adultsGroup = document.getElementById('adults-count').closest('.form-group');
            if (adultsGroup) {
                adultsGroup.classList.add('error');
            }
            isValid = false;
        }

        if (infants > adults) {
            showError('Количество младенцев не может превышать количество взрослых');
            const adultsGroup = document.getElementById('adults-count').closest('.form-group');
            if (adultsGroup) {
                adultsGroup.classList.add('error');
            }
            isValid = false;
        }

        if (!isValid) {
            // Scroll to first error
            const firstError = document.querySelector('.form-group.error');
            if (firstError) {
                firstError.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }

        return isValid;
    }

    function showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.add('error');
        let errorDiv = formGroup.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            formGroup.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    function clearError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('error');
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }
    }

    function clearAllErrors() {
        // Clear field errors
        document.querySelectorAll('.form-group.error').forEach(group => {
            group.classList.remove('error');
            const errorDiv = group.querySelector('.error-message');
            if (errorDiv) {
                errorDiv.textContent = '';
                errorDiv.style.display = 'none';
            }
        });

        // Clear general errors
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.innerHTML = '';
        }
    }

    function showError(message) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }

    // Handle search button click
    document.getElementById('search-btn').addEventListener('click', async function(e) {
        e.preventDefault();
        if (validateForm()) {
            await performSearch();
        }
    });

    // Perform search using REST API
    async function performSearch() {
        const formData = {
            destinationCity: document.getElementById('to').value,
            departureDate: document.getElementById('departure-date').value,
            tripType: document.getElementById('one-way').checked,
            returnDate: document.getElementById('return-date')?.value || null,
            adults: parseInt(document.getElementById('adults-count').textContent),
            children: parseInt(document.getElementById('children-count').textContent),
            infants: parseInt(document.getElementById('infants-count').textContent)
        };

        try {
            const response = await fetch('/results/search', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Failed to process search');
            }

            // Reload the page to show new results
            window.location.reload();
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'Произошла ошибка при поиске рейсов. Пожалуйста, попробуйте позже.');
        }
    }

    // Initialize any existing flight data
    const flightData = window.initialFlightData;
    if (flightData) {
        renderFlights(flightData);
    }

    // Render flight results
    function renderFlights(data) {
        const resultsContainer = document.querySelector('.search-results');
        const { flightsOneWay, flightsReturn } = data;
        // Use the global isRoundTrip variable that gets updated by radio buttons
        const isRoundTripCurrentSearch = isRoundTrip; 
        
        // Clear previous results
        resultsContainer.innerHTML = '';

        // Check if we have any flights
        const hasOneWayFlights = flightsOneWay && flightsOneWay.length > 0;
        const hasReturnFlights = flightsReturn && flightsReturn.length > 0;
        const totalFlights = (hasOneWayFlights ? flightsOneWay.length : 0) + (hasReturnFlights ? flightsReturn.length : 0);
        
        // Create results header
        const resultsHeader = document.createElement('div');
        resultsHeader.className = 'results-header';

        if (totalFlights === 0 || (isRoundTripCurrentSearch && (!hasOneWayFlights || !hasReturnFlights))) {
            // No flights found
            resultsHeader.innerHTML = `
                <h2 class="section-title">Рейсы не найдены</h2>
                <p>К сожалению, по вашему запросу не найдено подходящих рейсов. Попробуйте изменить параметры поиска.</p>
            `;
            resultsContainer.appendChild(resultsHeader);
            return;
        }

        // Flights found - show normal header
        resultsHeader.innerHTML = `
            <h2 class="section-title">Найдено ${totalFlights} билет(ов)</h2>
            <div class="sort-options">
                <label for="sort-by">Сортировать по:</label>
                <select id="sort-by">
                    <option value="price-asc">Цена (по возрастанию)</option>
                    <option value="price-desc">Цена (по убыванию)</option>
                    <option value="duration">Время в пути</option>
                </select>
            </div>
        `;
        resultsContainer.appendChild(resultsHeader);

        // Create flights container
        const flightsContainer = document.createElement('div');
        flightsContainer.className = 'tickets-list';

        // Render one-way flights
        if (hasOneWayFlights) {
            const oneWaySection = document.createElement('div');
            oneWaySection.className = 'flights-section';
            oneWaySection.innerHTML = '<h3>Рейсы туда</h3>';
            oneWaySection.appendChild(renderFlightsList(flightsOneWay, 'outbound', isRoundTripCurrentSearch));
            flightsContainer.appendChild(oneWaySection);
        }

        // Render return flights if available
        if (hasReturnFlights) {
            const returnSection = document.createElement('div');
            returnSection.className = 'flights-section';
            returnSection.innerHTML = '<h3>Рейсы обратно</h3>';
            returnSection.appendChild(renderFlightsList(flightsReturn, 'return', isRoundTripCurrentSearch));
            flightsContainer.appendChild(returnSection);
        }

        // Add flights container to results
        resultsContainer.appendChild(flightsContainer);

        // Add book button for round-trip
        if (isRoundTripCurrentSearch && hasOneWayFlights && hasReturnFlights) {
            const bookingSection = document.createElement('div');
            bookingSection.className = 'booking-section';
            const bookButton = document.createElement('button');
            bookButton.className = 'book-btn book-btn-large disabled';
            bookButton.id = 'round-trip-book-btn';
            bookButton.textContent = 'ЗАБРОНИРОВАТЬ';
            bookButton.disabled = true; // Initially disabled
            bookingSection.appendChild(bookButton);
            resultsContainer.appendChild(bookingSection);
        }

        // Add sort functionality
        document.getElementById('sort-by')?.addEventListener('change', function() {
            const sortedOneWay = flightsOneWay ? [...flightsOneWay] : [];
            const sortedReturn = flightsReturn ? [...flightsReturn] : null;
            
            sortFlights(sortedOneWay, this.value);
            if (sortedReturn) {
                sortFlights(sortedReturn, this.value);
            }
            
            // Re-render with sorted flights
            renderFlights({
                flightsOneWay: sortedOneWay,
                flightsReturn: sortedReturn
            });
        });

        // Add event listeners for round-trip selection
        if (isRoundTripCurrentSearch) {
            setupRoundTripSelection();
        }
    }

    // Render list of flights
    function renderFlightsList(flights, direction, isRoundTrip) {
        const list = document.createElement('div');
        list.className = 'flights-list';

        flights.forEach(flight => {
            const ticketCard = document.createElement('div');
            ticketCard.className = 'ticket-card card';

            ticketCard.dataset.flightId = flight.flightID;
            
            let footerContent;
            if (isRoundTrip) {
                // For round-trip, use a checkbox for selection
                const isChecked = (direction === 'outbound' && selectedOutboundFlight?.flightID === flight.flightID) ||
                                  (direction === 'return' && selectedReturnFlight?.flightID === flight.flightID);

                if (isChecked) {
                    ticketCard.classList.add('selected');
                }

                footerContent = `
                    <div class="ticket-price">${formatPrice(flight.minPrice)} ₽</div>
                    <div class="flight-select">
                        <input type="checkbox" class="flight-checkbox" name="flight-${direction}" value="${flight.flightID}" data-price="${flight.minPrice}" ${isChecked ? 'checked' : ''}>
                        <span>Выбрать рейс</span>
                    </div>
                `;
            } else {
                // For one-way, use a direct book button
                footerContent = `
                    <div class="ticket-price">${formatPrice(flight.minPrice)} ₽</div>
                    <button class="book-btn" data-flight-id="${flight.flightID}">ЗАБРОНИРОВАТЬ</button>
                `;
            }
            
            ticketCard.innerHTML = `
                <div class="ticket-header">
                    <input type="hidden" class="flight-id" th:value="${flight.flightID}"></input>
                    <div class="flight-point">
                        <div class="ticket-time">${formatTime(flight.departureTime)}</div>
                        <div class="ticket-city">${flight.departureCity}</div>
                        <div class="ticket-date">${formatDate(flight.departureDate)}</div>
                    </div>
                    <div class="flight-duration">
                        <div class="duration-line"></div>
                        <div class="duration-time">${formatDuration(flight.flightDuration)}</div>
                    </div>
                    <div class="flight-point">
                        <div class="ticket-time">${formatTime(flight.arrivalTime)}</div>
                        <div class="ticket-city">${flight.destinationCity}</div>
                        <div class="ticket-date">${formatDate(flight.arrivalDate)}</div>
                    </div>
                </div>
                <div class="ticket-info">
                    <div class="ticket-airline">
                        <i class="fas fa-plane"></i>
                        ${flight.airlineName} · Рейс ${flight.flightNumber}
                    </div>
                    <div class="ticket-luggage">
                        <div class="luggage-item">
                            <i class="fas fa-briefcase"></i> Ручная кладь
                        </div>
                    </div>
                </div>
                <div class="ticket-footer">
                    ${footerContent}
                </div>
            `;
            
            list.appendChild(ticketCard);

            // Attach event listeners based on trip type
            if (isRoundTrip) {
                // For round-trip, attach to checkbox
                const checkbox = ticketCard.querySelector('.flight-checkbox');
                if (checkbox) {
                    checkbox.addEventListener('change', handleFlightSelection);
                }
            } else {
                // For one-way, attach to book button
                const bookBtn = ticketCard.querySelector('.book-btn');
                if (bookBtn) {
                    bookBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const flightId = e.target.dataset.flightId;

                        if (!flightId || isNaN(flightId)) {
                            console.error('Invalid flight ID:', flightId);
                            showNotification('Ошибка: неверный ID рейса', 'error');
                            return;
                        }

                        console.log('Book button clicked for one-way flight:', flightId);

                        // For one-way booking, directly set selectedOutboundFlight and submit
                        const allFlights = (window.initialFlightData.flightsOneWay || []).concat(window.initialFlightData.flightsReturn || []);
                        const clickedFlight = allFlights.find(f => f.flightID == flightId);

                        if (clickedFlight) {
                            selectedOutboundFlight = clickedFlight;
                            updateSelectedFlightsDisplay();
                            submitBooking();
                        } else {
                            showNotification('Ошибка: данные о рейсе не найдены', 'error');
                        }
                    });
                }
            }
        });

        return list;
    }

    // Function to submit booking data to the server
    async function submitBooking() {
        if (!selectedOutboundFlight) {
            showNotification('Пожалуйста, выберите рейс туда', 'error');
            return;
        }

        if (isRoundTrip && !selectedReturnFlight) {
            showNotification('Пожалуйста, выберите обратный рейс', 'error');
            return;
        }

        // Prepare booking data
        const bookingData = {
            outboundFlightId: selectedOutboundFlight.flightID,
            returnFlightId: selectedReturnFlight ? selectedReturnFlight.flightID : null,
            isRoundTrip: isRoundTrip
        };

        console.log('Selected outbound flight:', selectedOutboundFlight);
        console.log('Selected return flight:', selectedReturnFlight);
        console.log('Booking data:', bookingData);

        try {
            const response = await fetch('/results/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });

            console.log('Booking response status:', response.status);
            console.log('Booking response ok:', response.ok);

            if (!response.ok) {
                const errorData = await response.json();
                showNotification(errorData.message || 'Ошибка при бронировании', 'error');
                return;
            }

            window.location.href = "/booking";
        } catch (error) {
            showNotification('Ошибка при отправке запроса', 'error');
            console.error('Booking error:', error);
        }
    }

    // Setup round-trip selection functionality (called if isRoundTripCurrentSearch is true in renderFlights)
    function setupRoundTripSelection() {
        const bookButton = document.getElementById('round-trip-book-btn');

        if (bookButton) {
            // Attach click listener to the main book button for round-trip submission
            bookButton.addEventListener('click', () => {
                submitBooking();
            });
        }

        // Initial update of book button state when page loads (or results render)
        // This is crucial to correctly set its disabled state and text based on initial selections
        updateBookButtonState();
    }

    // Sort flights based on selected option
    function sortFlights(flights, sortBy) {
        switch (sortBy) {
            case 'price-asc':
                flights.sort((a, b) => a.minPrice - b.minPrice);
                break;
            case 'price-desc':
                flights.sort((a, b) => b.minPrice - a.minPrice);
                break;
            case 'duration':
                flights.sort((a, b) => a.flightDuration - b.flightDuration);
                break;
        }
    }

    // Utility functions for formatting
    function formatTime(time) {
        return time.substring(0, 5); // HH:mm
    }

    function formatDate(date) {
        return new Date(date).toLocaleDateString('ru-RU');
    }

    function formatDuration(duration) {
        if (!duration) return "н/д";
        
        // Если duration в формате HH:mm:ss (LocalTime)
        if (typeof duration === 'string') {
            const [hours, minutes] = duration.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
                return `${hours} ч ${minutes} мин`;
            }
        }
        
        // Если duration в минутах (число)
        if (typeof duration === 'number') {
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            return `${hours} ч ${minutes} мин`;
        }
        
        return "н/д";
    }

    function formatPrice(price) {
        return price.toLocaleString('ru-RU');
    }

    function showNotification(message, type) {
        // Удаляем предыдущие уведомления
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}); 