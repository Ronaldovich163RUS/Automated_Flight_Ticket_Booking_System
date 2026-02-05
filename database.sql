-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema airline1
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema airline1
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `airline1` DEFAULT CHARACTER SET utf8mb3 ;
USE `airline1` ;

-- -----------------------------------------------------
-- Table `airline1`.`airline`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `airline1`.`airline` (
  `airline_ID` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(20) NOT NULL,
  `price_per_km` DECIMAL(3,2) NOT NULL,
  PRIMARY KEY (`airline_ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `airline1`.`brand`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `airline1`.`brand` (
  `brand_ID` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(20) NOT NULL,
  `airline_ID` INT NOT NULL,
  PRIMARY KEY (`brand_ID`),
  INDEX `fk_brand_airlines1_idx` (`airline_ID` ASC) VISIBLE,
  CONSTRAINT `fk_brand_airlines1`
    FOREIGN KEY (`airline_ID`)
    REFERENCES `airline1`.`airline` (`airline_ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `airline1`.`airplane`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `airline1`.`airplane` (
  `airplane_ID` INT NOT NULL AUTO_INCREMENT,
  `brand_ID` INT NOT NULL,
  `model` INT NOT NULL,
  `range` INT NOT NULL,
  `number_of_passages` INT NOT NULL,
  PRIMARY KEY (`airplane_ID`),
  INDEX `fk_Aircraft_Brand1_idx` (`brand_ID` ASC) VISIBLE,
  CONSTRAINT `fk_Aircraft_Brand1`
    FOREIGN KEY (`brand_ID`)
    REFERENCES `airline1`.`brand` (`brand_ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 17
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `airline1`.`personal_information`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `airline1`.`personal_information` (
  `personal_information_ID` INT NOT NULL AUTO_INCREMENT,
  `last_name` VARCHAR(15) NOT NULL,
  `first_name` VARCHAR(15) NOT NULL,
  `middle_name` VARCHAR(20) NULL DEFAULT NULL,
  `gender` ENUM('male', 'female') NULL DEFAULT NULL,
  `date_of_birth` DATE NOT NULL,
  `document` ENUM('passport', 'birth_certificate', 'international_passport') NULL DEFAULT NULL,
  `document_series` VARCHAR(10) NULL DEFAULT NULL,
  `document_number` INT NULL DEFAULT NULL,
  `citizenship` ENUM('russia', 'other') NULL DEFAULT NULL,
  PRIMARY KEY (`personal_information_ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 16
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `airline1`.`client`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `airline1`.`client` (
  `client_ID` INT NOT NULL AUTO_INCREMENT,
  `personal_information_ID` INT NOT NULL,
  `email` VARCHAR(50) NOT NULL,
  `phone_number` VARCHAR(12) NOT NULL,
  `password` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`client_ID`),
  UNIQUE INDEX `phone_number_UNIQUE` (`phone_number` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  INDEX `fk_client_personal_information1_idx` (`personal_information_ID` ASC) VISIBLE,
  CONSTRAINT `fk_client_personal_information1`
    FOREIGN KEY (`personal_information_ID`)
    REFERENCES `airline1`.`personal_information` (`personal_information_ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `airline1`.`city`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `airline1`.`city` (
  `city_ID` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(25) NOT NULL,
  `distance` INT NOT NULL,
  `longitude` DECIMAL(9,6) NOT NULL,
  `latitude` DECIMAL(9,6) NOT NULL,
  PRIMARY KEY (`city_ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 17
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `airline1`.`flight`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `airline1`.`flight` (
  `flight_ID` INT NOT NULL AUTO_INCREMENT,
  `departure_city_ID` INT NOT NULL,
  `destination_city_ID` INT NOT NULL,
  `departure_date` DATE NOT NULL,
  `departure_time` TIME NOT NULL,
  `airplane_ID` INT NOT NULL,
  `flight_duration` TIME NOT NULL,
  `flight_number` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`flight_ID`),
  UNIQUE INDEX `flight_ID_UNIQUE` (`flight_ID` ASC) VISIBLE,
  INDEX `fk_flight_airplane1_idx` (`airplane_ID` ASC) VISIBLE,
  INDEX `fk_flight_city1_idx` (`departure_city_ID` ASC) VISIBLE,
  INDEX `fk_flight_city2_idx` (`destination_city_ID` ASC) VISIBLE,
  CONSTRAINT `fk_flight_airplane1`
    FOREIGN KEY (`airplane_ID`)
    REFERENCES `airline1`.`airplane` (`airplane_ID`),
  CONSTRAINT `fk_flight_city1`
    FOREIGN KEY (`departure_city_ID`)
    REFERENCES `airline1`.`city` (`city_ID`),
  CONSTRAINT `fk_flight_city2`
    FOREIGN KEY (`destination_city_ID`)
    REFERENCES `airline1`.`city` (`city_ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 43
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `airline1`.`booking`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `airline1`.`booking` (
  `booking_ID` INT NOT NULL AUTO_INCREMENT,
  `client_ID` INT NOT NULL,
  `flight_ID` INT NOT NULL,
  `baggage_count` INT NOT NULL,
  `total_cost` DECIMAL(7,2) NOT NULL,
  PRIMARY KEY (`booking_ID`),
  INDEX `fk_booking_client1_idx` (`client_ID` ASC) VISIBLE,
  INDEX `fk_booking_flight1_idx` (`flight_ID` ASC) VISIBLE,
  CONSTRAINT `fk_booking_client1`
    FOREIGN KEY (`client_ID`)
    REFERENCES `airline1`.`client` (`client_ID`),
  CONSTRAINT `fk_booking_flight1`
    FOREIGN KEY (`flight_ID`)
    REFERENCES `airline1`.`flight` (`flight_ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 10
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `airline1`.`service_class`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `airline1`.`service_class` (
  `service_class_ID` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(10) NOT NULL,
  `markup_coefficient` DOUBLE NOT NULL,
  PRIMARY KEY (`service_class_ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `airline1`.`cabin_structure`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `airline1`.`cabin_structure` (
  `cabin_structure_ID` INT NOT NULL AUTO_INCREMENT,
  `airplane_ID` INT NOT NULL,
  `service_class_ID` INT NOT NULL,
  `number_of_rows` INT NOT NULL,
  `number_of_seats_per_row` INT NOT NULL,
  PRIMARY KEY (`cabin_structure_ID`),
  INDEX `fk_cabin_structure_service_class1_idx` (`service_class_ID` ASC) VISIBLE,
  INDEX `fk_cabin_structure_airplane1_idx` (`airplane_ID` ASC) VISIBLE,
  CONSTRAINT `fk_cabin_structure_airplane1`
    FOREIGN KEY (`airplane_ID`)
    REFERENCES `airline1`.`airplane` (`airplane_ID`),
  CONSTRAINT `fk_cabin_structure_service_class1`
    FOREIGN KEY (`service_class_ID`)
    REFERENCES `airline1`.`service_class` (`service_class_ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 30
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `airline1`.`seat_structure`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `airline1`.`seat_structure` (
  `seat_structure_ID` INT NOT NULL AUTO_INCREMENT,
  `cabin_structure_ID` INT NOT NULL,
  `row` INT NOT NULL,
  `seat` CHAR(1) NOT NULL,
  PRIMARY KEY (`seat_structure_ID`),
  INDEX `fk_seat_structure_cabin_structure1_idx` (`cabin_structure_ID` ASC) VISIBLE,
  CONSTRAINT `fk_seat_structure_cabin_structure1`
    FOREIGN KEY (`cabin_structure_ID`)
    REFERENCES `airline1`.`cabin_structure` (`cabin_structure_ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 1403
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `airline1`.`seat`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `airline1`.`seat` (
  `seat_ID` INT NOT NULL AUTO_INCREMENT,
  `flight_ID` INT NOT NULL,
  `seat_structure_ID` INT NOT NULL,
  `price` DECIMAL(7,2) NOT NULL,
  `taken` TINYINT NOT NULL,
  PRIMARY KEY (`seat_ID`),
  INDEX `fk_seat_flight1_idx` (`flight_ID` ASC) VISIBLE,
  INDEX `fk_seat_seat_structure1_idx` (`seat_structure_ID` ASC) VISIBLE,
  CONSTRAINT `fk_seat_flight1`
    FOREIGN KEY (`flight_ID`)
    REFERENCES `airline1`.`flight` (`flight_ID`),
  CONSTRAINT `fk_seat_seat_structure1`
    FOREIGN KEY (`seat_structure_ID`)
    REFERENCES `airline1`.`seat_structure` (`seat_structure_ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 1108
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `airline1`.`ticket`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `airline1`.`ticket` (
  `ticket_ID` INT NOT NULL AUTO_INCREMENT,
  `personal_information_ID` INT NOT NULL,
  `booking_ID` INT NOT NULL,
  `seat_ID` INT NOT NULL,
  PRIMARY KEY (`ticket_ID`),
  INDEX `fk_ticket_booking1_idx` (`booking_ID` ASC) VISIBLE,
  INDEX `fk_ticket_seat1_idx` (`seat_ID` ASC) VISIBLE,
  INDEX `fk_ticket_personal_information1_idx` (`personal_information_ID` ASC) VISIBLE,
  CONSTRAINT `fk_ticket_booking1`
    FOREIGN KEY (`booking_ID`)
    REFERENCES `airline1`.`booking` (`booking_ID`),
  CONSTRAINT `fk_ticket_personal_information1`
    FOREIGN KEY (`personal_information_ID`)
    REFERENCES `airline1`.`personal_information` (`personal_information_ID`),
  CONSTRAINT `fk_ticket_seat1`
    FOREIGN KEY (`seat_ID`)
    REFERENCES `airline1`.`seat` (`seat_ID`))
ENGINE = InnoDB
AUTO_INCREMENT = 14
DEFAULT CHARACTER SET = utf8mb3;

USE `airline1` ;

-- -----------------------------------------------------
-- procedure create_seats_for_flight
-- -----------------------------------------------------

DELIMITER $$
USE `airline1`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `create_seats_for_flight`(IN new_flight_id INT)
BEGIN
    -- Объявляем переменные для базовой цены и коэффициента наценки
    DECLARE base_price DECIMAL(7,2);
    DECLARE distance INT;
    DECLARE price_per_km DECIMAL(3,2);
    
    -- Получаем расстояние для рейса и цену за км для авиакомпании
    SELECT c.distance, a.price_per_km 
    INTO distance, price_per_km
    FROM flight f
    JOIN city c ON f.destination_city_ID = c.city_ID
    JOIN airplane ap ON f.airplane_ID = ap.airplane_ID
    JOIN brand b ON ap.brand_ID = b.brand_ID
    JOIN airline a ON b.airline_ID = a.airline_ID
    WHERE f.flight_ID = new_flight_id;
    
    -- Рассчитываем базовую цену билета
    SET base_price = distance * price_per_km;
    
    -- Вставляем записи о местах
    INSERT INTO seat (flight_ID, seat_structure_ID, price, taken)
    SELECT 
        new_flight_id,
        ss.seat_structure_ID,
        base_price * sc.markup_coefficient,
        0
    FROM flight f
    JOIN airplane a ON f.airplane_ID = a.airplane_ID
    JOIN cabin_structure cs ON a.airplane_ID = cs.airplane_ID
    JOIN service_class sc ON cs.service_class_ID = sc.service_class_ID
    JOIN seat_structure ss ON cs.cabin_structure_ID = ss.cabin_structure_ID
    WHERE f.flight_ID = new_flight_id;
END$$

DELIMITER ;
USE `airline1`;

DELIMITER $$
USE `airline1`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `airline1`.`after_flight_insert`
AFTER INSERT ON `airline1`.`flight`
FOR EACH ROW
BEGIN
    CALL create_seats_for_flight(NEW.flight_ID);
END$$

USE `airline1`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `airline1`.`after_flight_update`
AFTER UPDATE ON `airline1`.`flight`
FOR EACH ROW
BEGIN
    IF NEW.airplane_ID <> OLD.airplane_ID THEN
        DELETE FROM seat WHERE flight_ID = NEW.flight_ID;
        CALL create_seats_for_flight(NEW.flight_ID);
    END IF;
END$$


DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
