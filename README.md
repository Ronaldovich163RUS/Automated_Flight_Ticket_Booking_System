# Automated_Flight_Ticket_Booking_System
Автоматизированная система бронирования авиабилетов «Fasticket» позволяет пользователям просматривать расписание рейсов, выполняемых на территории Российской Федерации, и бронировать билеты на них.
Просмотр расписания с возможностью фильтрации рейсов по определенным параметрам доступен всем пользователям.
Бронирование билетов может осуществляться только клиентами системы (зарегистрированными пользователями). Администратор обладает правами на редактирование данных о рейсах и самолётах.
Также он может получать информацию о всех клиентах и бронированиях. Система разработана в виде веб-приложения и не требует предварительной установки.


1. Установка и настройка MySQL
Установите MySQL Server, MySQL Workbench и MySQL Shell с официального сайта MySQL. В процессе установки задайте пароль для пользователя root и запомните его.

2. Создание базы данных
Откройте MySQL Workbench и подключитесь к локальному серверу (Local instance MySQL80), введя пароль root.
В MySQL Workbench создайте новую базу данных:
Нажмите на значок создания новой схемы в панели инструментов
Введите имя базы данных: airline1
Нажмите Apply и подтвердите создание
Проверьте создание базы данных airline1 в левой панели Navigator:
Обновите список схем, нажав кнопку обновления
Разверните раздел Schemas
Найдите базу данных airline1

3. Настройка Spring-приложения Fasticket
Получите исходный код Spring-приложения Fasticket и распакуйте или склонируйте проект в рабочую директорию.

4. Настройка файла application.properties
Настройте файл application.properties со следующими параметрами:

properties
# Основные настройки приложения
spring.application.name=fasticket
spring.devtools.restart.poll-interval=2s

# Настройки подключения к базе данных
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/airline1?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=ВАШ_ПАРОЛЬ_ОТ_MYSQL
spring.datasource.initialization-mode=always

# Настройки логирования
logging.level.org.springframework.jdbc.core=INFO
logging.level.com.transfer.fasticket=INFO

# Настройки JPA и Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Настройки Thymeleaf
spring.thymeleaf.cache=false
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html
spring.thymeleaf.mode=HTML

# Настройки почты (если требуется)
spring.mail.host=smtp.yandex.ru
spring.mail.port=465
spring.mail.username=ВАША_ЭЛЕКТРОННАЯ_ПОЧТА
spring.mail.password=ВАШ_ПАРОЛЬ_ОТ_ПОЧТЫ
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.ssl.enable=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.socketFactory.class=javax.net.ssl.SSLSocketFactory
spring.mail.properties.mail.smtp.socketFactory.port=465
spring.mail.properties.mail.smtp.socketFactory.fallback=false
spring.mail.properties.mail.smtp.ssl.trust=smtp.yandex.ru
spring.mail.properties.mail.debug=true
Примечания:

Замените ВАШ_ПАРОЛЬ_ОТ_MYSQL на пароль, который вы задали для пользователя root при установке MySQL

Если вы используете другого пользователя базы данных, укажите его имя и пароль

Настройки почты: если вам не требуется отправка email, вы можете закомментировать эти строки

Если вы используете другой почтовый сервис, настройки будут отличаться

5. Запуск Spring-приложения
Запуск через главный класс в IDE
Откройте проект в вашей IDE (IntelliJ IDEA, Eclipse, VS Code и т.д.)
Найдите главный класс с аннотацией @SpringBootApplication
Запустите этот класс
