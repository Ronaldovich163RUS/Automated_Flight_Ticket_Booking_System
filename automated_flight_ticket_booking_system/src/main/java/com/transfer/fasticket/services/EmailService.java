package com.transfer.fasticket.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ByteArrayResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendTicketEmail(String to, byte[] pdfTicket, String fileName, String subject) throws MessagingException {
        logger.info("Отправка билета на email: {}", to);
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText("Ваш билет находится во вложении. Спасибо за выбор компании Fasticket!");
            helper.addAttachment(fileName, new ByteArrayResource(pdfTicket));
            
            mailSender.send(message);
            logger.info("Билет успешно отправлен на email: {}", to);
        } catch (Exception e) {
            logger.error("Ошибка при отправке билета: {}", e.getMessage());
            throw new MessagingException("Ошибка при отправке билета: " + e.getMessage(), e);
        }
    }
} 