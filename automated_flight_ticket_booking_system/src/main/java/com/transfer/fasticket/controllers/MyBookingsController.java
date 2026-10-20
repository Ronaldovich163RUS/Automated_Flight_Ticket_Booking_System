package com.transfer.fasticket.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.transfer.fasticket.dto.AdminTicketDTO;
import com.transfer.fasticket.dto.BookingDTO;
import com.transfer.fasticket.dto.Role;
import com.transfer.fasticket.dto.UserDTO;
import com.transfer.fasticket.services.MyBookingService;
import com.transfer.fasticket.services.EmailService;
import com.transfer.fasticket.services.ClientService;
import com.transfer.fasticket.services.TicketService;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ContentDisposition;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/mybookings")
public class MyBookingsController {
    private static final Logger logger = LoggerFactory.getLogger(MyBookingsController.class);
    private static final DeviceRgb HEADER_COLOR = new DeviceRgb(0, 0, 0);
    private static final DeviceRgb INFO_BLOCK_COLOR = new DeviceRgb(240, 240, 240);
    private static final DeviceRgb TOTAL_PRICE_COLOR = new DeviceRgb(220, 220, 220);
    private static final Border STANDARD_BORDER = new SolidBorder(ColorConstants.BLACK, 1);

    @Autowired
    private MyBookingService myBookingService;
    
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ClientService clientService;

    @Autowired
    private TicketService ticketService;

    @GetMapping
    public String getView(HttpSession session, Model model) throws JsonProcessingException {
        Optional<UserDTO> userDto = Optional.ofNullable((UserDTO) session.getAttribute("user"));
        
        if (userDto.isEmpty() || userDto.get().getRole() != Role.CLIENT) {
            return "redirect:/login";
        }

        List<BookingDTO> bookings = myBookingService.getBookingsByClientId(userDto.get().getClientId().get());
        model.addAttribute("bookingsJson", objectMapper.writeValueAsString(bookings));
        return "mybookings";
    }

    @GetMapping("/download/{bookingId}")
    public ResponseEntity<byte[]> downloadTicket(@PathVariable Integer bookingId, HttpSession session) throws IOException {
        Optional<UserDTO> userDto = Optional.ofNullable((UserDTO) session.getAttribute("user"));
        System.out.println(bookingId);
        if (userDto.isEmpty() || userDto.get().getRole() != Role.CLIENT) {
            return ResponseEntity.badRequest().build();
        }

        Optional<BookingDTO> bookingOpt = myBookingService.getBookingById(bookingId);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        System.out.println(bookingOpt.get());

        BookingDTO booking = bookingOpt.get();
        byte[] pdfBytes = generateTicketPdf(booking);

        String fileName = "Ticket_" + booking.getFlightNumber() + ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", fileName);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    // Метод для транслитерации русских букв в латиницу
    private String transliterateToLatin(String message) {
        if (message == null) return "";
        
        char[] abcCyr = {' ', 'а','б','в','г','д','е','ё', 'ж','з','и','й','к','л','м','н','о','п','р','с','т','у','ф','х', 'ц','ч', 'ш','щ','ъ','ы','ь','э','ю','я','А','Б','В','Г','Д','Е','Ё', 'Ж','З','И','Й','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х', 'Ц', 'Ч','Ш', 'Щ','Ъ','Ы','Ь','Э','Ю','Я'};
        String[] abcLat = {" ", "a","b","v","g","d","e","e","zh","z","i","y","k","l","m","n","o","p","r","s","t","u","f","h","ts","ch","sh","sch", "","i", "","e","yu","ya","A","B","V","G","D","E","E","Zh","Z","I","Y","K","L","M","N","O","P","R","S","T","U","F","H","Ts","Ch","Sh","Sch", "","I", "","E","Yu","Ya"};
        
        StringBuilder builder = new StringBuilder();
        
        for (int i = 0; i < message.length(); i++) {
            char ch = message.charAt(i);
            boolean found = false;
            
            for (int j = 0; j < abcCyr.length; j++) {
                if (ch == abcCyr[j]) {
                    builder.append(abcLat[j]);
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                builder.append(ch);
            }
        }
        
        return builder.toString();
    }

    private byte[] generateTicketPdf(BookingDTO booking) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument pdf = new PdfDocument(new PdfWriter(baos));
        Document document = new Document(pdf, PageSize.A4);
        document.setMargins(20, 20, 20, 20);

        try {
            String fontPath = "static/fonts/freesans.ttf";
            ClassPathResource fontResource = new ClassPathResource(fontPath);
            PdfFont font;
            try {
                byte[] fontBytes = fontResource.getInputStream().readAllBytes();
                font = PdfFontFactory.createFont(fontBytes, PdfEncodings.IDENTITY_H);
                logger.info("Font loaded successfully from: {}", fontPath);
            } catch (IOException e) {
                logger.error("Failed to load font from {}: {}", fontPath, e.getMessage());
                font = PdfFontFactory.createFont(PdfEncodings.IDENTITY_H);
                logger.info("Using fallback font with IDENTITY_H encoding");
            }
            document.setFont(font);

            // Основная таблица брони
            Table mainTable = new Table(UnitValue.createPercentArray(new float[]{100}));
            mainTable.setWidth(UnitValue.createPercentValue(100));
            mainTable.setBorder(Border.NO_BORDER);

            // Заголовок с логотипом
            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}));
            headerTable.setWidth(UnitValue.createPercentValue(100));
            headerTable.setBorder(STANDARD_BORDER);

            // Логотип
            Cell logoCell = new Cell();
            logoCell.add(new Paragraph("fasticket")
                    .setFontSize(14)
                    .setBold()
                    .setFontColor(ColorConstants.WHITE));
            logoCell.setBorder(Border.NO_BORDER);
            headerTable.addCell(logoCell);

            // Название документа
            Cell titleCell = new Cell();
            titleCell.add(new Paragraph("ЭЛЕКТРОННАЯ БРОНЬ / ELECTRONIC BOOKING")
                    .setFontSize(12)
                    .setBold()
                    .setFontColor(ColorConstants.WHITE)
                    .setTextAlignment(TextAlignment.RIGHT));
            titleCell.setBorder(Border.NO_BORDER);
            headerTable.addCell(titleCell);

            Cell headerContainer = new Cell().add(headerTable);
            headerContainer.setBackgroundColor(HEADER_COLOR);
            headerContainer.setPadding(5);
            headerContainer.setBorder(Border.NO_BORDER);
            mainTable.addCell(headerContainer);

            // Получаем все билеты для данной брони
            List<AdminTicketDTO> tickets = ticketService.getTicketsByBooking(booking.getBookingId());

            // Добавляем информацию о каждом пассажире и его билете
            for (AdminTicketDTO ticket : tickets) {
                Table passengerTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}));
                passengerTable.setWidth(UnitValue.createPercentValue(100));
                passengerTable.setBorder(STANDARD_BORDER);

                // Определяем тип пассажира (взрослый/ребенок)
                String passengerType = "ВЗРОСЛЫЙ / ADULT";
                if (ticket.getPassengerAge() != null && ticket.getPassengerAge() < 12) {
                    passengerType = "РЕБЕНОК / CHILD";
                }

                addInfoCell(passengerTable, "ИМЯ ПАССАЖИРА / PASSENGER NAME", ticket.getPassengerName());
                addInfoCell(passengerTable, "ТИП ПАССАЖИРА / PASSENGER TYPE", passengerType);
                addInfoCell(passengerTable, "МЕСТО / SEAT", ticket.getSeatNumber());
                addInfoCell(passengerTable, "КЛАСС ОБСЛУЖИВАНИЯ / SERVICE CLASS",
                        getServiceClassInBothLanguages(ticket.getServiceClass()));
                addInfoCell(passengerTable, "СТОИМОСТЬ / PRICE",
                        ticket.getPrice() != null ? String.format("%,.2f руб.", ticket.getPrice()) : "0.00 руб.");

                mainTable.addCell(new Cell().add(passengerTable));
            }

            // Разделительная линия
            Cell dividerCell = new Cell();
            dividerCell.setBorder(STANDARD_BORDER);
            dividerCell.setHeight(2);
            mainTable.addCell(dividerCell);

            // Информация о рейсе
            Table flightTable = new Table(UnitValue.createPercentArray(new float[]{33, 34, 33}));
            flightTable.setWidth(UnitValue.createPercentValue(100));
            flightTable.setBackgroundColor(INFO_BLOCK_COLOR);
            flightTable.setBorder(STANDARD_BORDER);

            addInfoCell(flightTable, "ОТ / FROM", booking.getDepartureCity());
            addInfoCell(flightTable, "РЕЙС / FLIGHT", booking.getAirlineName() + "\n" + booking.getFlightNumber());
            addInfoCell(flightTable, "ДО / TO", booking.getDestinationCity());

            mainTable.addCell(new Cell().add(flightTable));

            // Информация о времени
            Table timeTable = new Table(UnitValue.createPercentArray(new float[]{33, 34, 33}));
            timeTable.setWidth(UnitValue.createPercentValue(100));
            timeTable.setBackgroundColor(INFO_BLOCK_COLOR);
            timeTable.setBorder(STANDARD_BORDER);

            addDateTimeCell(timeTable, "ДАТА И ВРЕМЯ ВЫЛЕТА / DEPARTURE",
                    booking.getFormattedDepartureDate() + " " + booking.getFormattedDepartureTime());
            addDateTimeCell(timeTable, "ДЛИТЕЛЬНОСТЬ / DURATION", booking.getFormattedDuration());
            addDateTimeCell(timeTable, "ВРЕМЯ ПРИБЫТИЯ / ARRIVAL", booking.getFormattedArrivalTime());

            mainTable.addCell(new Cell().add(timeTable));

            // Информация о багаже
            Table luggageTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}));
            luggageTable.setWidth(UnitValue.createPercentValue(100));
            luggageTable.setBackgroundColor(INFO_BLOCK_COLOR);
            luggageTable.setBorder(STANDARD_BORDER);

            addInfoCell(luggageTable, "РУЧНАЯ КЛАДЬ / HAND LUGGAGE", "1x10 кг");
            addInfoCell(luggageTable, "ДОПОЛНИТЕЛЬНЫЙ БАГАЖ / EXTRA LUGGAGE",
                    booking.getLuggage() != null ? booking.getLuggage() : "0");

            mainTable.addCell(new Cell().add(luggageTable));

            // Общая стоимость
            Table totalPriceTable = new Table(UnitValue.createPercentArray(new float[]{100}));
            totalPriceTable.setWidth(UnitValue.createPercentValue(100));
            totalPriceTable.setBackgroundColor(TOTAL_PRICE_COLOR);
            totalPriceTable.setBorder(STANDARD_BORDER);

            Table priceContentTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}));
            priceContentTable.setWidth(UnitValue.createPercentValue(100));
            priceContentTable.setBorder(Border.NO_BORDER);

            Cell priceLabelCell = new Cell();
            priceLabelCell.add(new Paragraph("ОБЩАЯ СТОИМОСТЬ / TOTAL PRICE")
                    .setFontSize(12)
                    .setBold()
                    .setTextAlignment(TextAlignment.LEFT));
            priceLabelCell.setBorder(Border.NO_BORDER);
            priceContentTable.addCell(priceLabelCell);

            Cell priceValueCell = new Cell();
            String formattedPrice = booking.getPrice() != null ?
                    String.format("%,.2f руб.", booking.getPrice().doubleValue()) : "0.00 руб.";
            priceValueCell.add(new Paragraph(formattedPrice)
                    .setFontSize(14)
                    .setBold()
                    .setTextAlignment(TextAlignment.RIGHT));
            priceValueCell.setBorder(Border.NO_BORDER);
            priceContentTable.addCell(priceValueCell);

            Cell totalPriceCell = new Cell().add(priceContentTable);
            totalPriceCell.setPadding(10);
            totalPriceCell.setBorder(Border.NO_BORDER);
            totalPriceTable.addCell(totalPriceCell);

            mainTable.addCell(new Cell().add(totalPriceTable));

            document.add(mainTable);
            document.close();

            return baos.toByteArray();
        } catch (Exception e) {
            logger.error("Error generating PDF: {}", e.getMessage(), e);
            throw new IOException("Error generating PDF: " + e.getMessage(), e);
        }
    }

    private String getServiceClassInBothLanguages(String serviceClass) {
        if (serviceClass == null) return "";

        switch (serviceClass.toUpperCase()) {
            case "ECONOMY":
                return "ЭКОНОМ / ECONOMY";
            case "BUSINESS":
                return "БИЗНЕС / BUSINESS";
            case "FIRST":
                return "ПЕРВЫЙ / FIRST";
            case "PREMIUM_ECONOMY":
                return "ПРЕМИУМ ЭКОНОМ / PREMIUM ECONOMY";
            default:
                return serviceClass;
        }
    }

    private void addInfoCell(Table table, String label, String value) {
        Cell cell = new Cell();
        cell.setBorder(Border.NO_BORDER);
        cell.setPaddingLeft(5);
        cell.setPaddingRight(5);
        
        // Добавляем метку
        cell.add(new Paragraph(label)
                .setFontSize(8)
                .setTextAlignment(TextAlignment.LEFT));
        
        // Добавляем значение
        cell.add(new Paragraph(value)
                .setFontSize(12)
                .setBold()
                .setTextAlignment(TextAlignment.LEFT)
                .setMarginTop(2));
        
        table.addCell(cell);
    }

    private void addDateTimeCell(Table table, String label, String value) {
        addInfoCell(table, label, value);
    }

    @PostMapping("/email/{bookingId}")
    public ResponseEntity<?> sendEmail(@PathVariable Integer bookingId, HttpSession session) {
        try {
            Optional<UserDTO> userDto = Optional.ofNullable((UserDTO) session.getAttribute("user"));
            if (userDto.isEmpty() || userDto.get().getRole() != Role.CLIENT) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Необходима авторизация"));
            }

            Integer clientId = userDto.get().getClientId().get();
            Optional<String> emailOpt = clientService.getEmailById(clientId);
            
            if (emailOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email не найден"));
            }

            Optional<BookingDTO> bookingOpt = myBookingService.getBookingById(bookingId);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Бронирование не найдено"));
            }

            BookingDTO booking = bookingOpt.get();
            byte[] pdfBooking = generateTicketPdf(booking);

            String fileName = "Booking_" + booking.getFlightNumber() + ".pdf";
            String subject = String.format("Бронь на рейс %s", booking.getFlightNumber());

            emailService.sendTicketEmail(emailOpt.get(), pdfBooking, fileName, subject);

            return ResponseEntity.ok()
                    .body(Map.of("message", "Бронь успешно отправлена на email"));
        } catch (Exception e) {
            logger.error("Error sending email for booking {}: {}", bookingId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Произошла ошибка при отправке брони"));
        }
    }

    @DeleteMapping("/cancel/{bookingId}")
    public ResponseEntity<?> cancelBooking(@PathVariable Integer bookingId) {
        myBookingService.cancelBooking(bookingId);
        return ResponseEntity.ok().body(Map.of("message", "Booking cancelled successfully"));
    }
}
