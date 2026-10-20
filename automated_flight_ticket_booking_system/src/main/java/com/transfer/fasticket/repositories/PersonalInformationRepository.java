package com.transfer.fasticket.repositories;

import com.transfer.fasticket.models.PersonalInformation;
import com.transfer.fasticket.models.enums.Citizenship;
import com.transfer.fasticket.models.enums.Document;
import com.transfer.fasticket.models.enums.Gender;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.util.Optional;

public interface PersonalInformationRepository extends CrudRepository<PersonalInformation, Integer> {
    @Query("SELECT LAST_INSERT_ID()")
    Integer selectLastId();

    @Query("""
            SELECT *
            FROM client JOIN personal_information 
            ON client.personal_information_id = personal_information.personal_information_id 
            WHERE client.personal_information_id = :id
            """)
    Optional<PersonalInformation> findByClientId(Integer id);

    /*
    @Query("DELETE FROM personal_information WHERE personal_information_ID = :id")
    void deleteById(Integer id);
     */

    @Query("""
            SELECT personal_information_id, last_name, first_name, middle_name, 
            LOWER(gender) as gender, 
            date_of_birth, 
            document, document_series, document_number, 
            LOWER(citizenship) as citizenship
            FROM personal_information 
            WHERE personal_information_id = :id
            """)
    @Override
    Optional<PersonalInformation> findById(@Param("id") Integer id);

    @Override
    void deleteById(Integer integer);

    @Query("""
            UPDATE personal_information SET last_name = :lastName,
            first_name = :firstName, middle_name = :middleName,
            gender = :gender, date_of_birth = :dateOfBirth,
            document = :document, document_series = :documentSeries,
            document_number = :documentNumber, citizenship = :citizenship
            WHERE personal_information_ID = :id
            """)
    @Modifying
    void updateById(Integer id, String lastName, String firstName, String middleName,
                    Gender gender, Date dateOfBirth, Document document,
                    String documentSeries, Integer documentNumber, Citizenship citizenship);


}
