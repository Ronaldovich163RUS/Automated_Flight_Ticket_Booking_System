package com.transfer.fasticket.repositories;

import com.transfer.fasticket.models.City;
import com.transfer.fasticket.models.Client;
import com.transfer.fasticket.models.enums.Citizenship;
import com.transfer.fasticket.models.enums.Document;
import com.transfer.fasticket.models.enums.Gender;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.repository.CrudRepository;

import java.sql.Date;
import java.util.Optional;

public interface ClientRepository extends CrudRepository<Client, Integer> {
    @Query("select * from client where client.email = :login or client.phone_number := login")
    Optional<Client> findByEmailAndPhone(String login);

    @Query("SELECT * FROM client WHERE client.email = :email")
    Optional<Client> findByEmail(String email);

    @Query("SELECT * FROM client WHERE client.phone_number = :phoneNumber")
    Optional<Client> findByPhoneNumber(String phoneNumber);

    @Query("SELECT * FROM client WHERE personal_information_id = :personalInformationId")
    Optional<Client> findByPersonalInformationId(Integer personalInformationId);

    @Query("SELECT count(email)>0 FROM client WHERE client.email = :email")
    boolean existsByEmail(String email);
    @Query("SELECT count(phone_number)>0 FROM client WHERE client.phone_number = :phoneNumber")
    boolean existsByPhoneNumber(String phoneNumber);

    @Query("SELECT count(email)>0 FROM client WHERE client_ID <> :id AND client.email = :email")
    boolean existsByEmailExceptCurrentClient(Integer id, String email);
    @Query("SELECT count(phone_number)>0 FROM client WHERE client_ID <> :id " +
            "AND client.phone_number = :phoneNumber")
    boolean existsByPhoneNumberExceptCurrentClient(Integer id, String phoneNumber);

    @Query("SELECT client_ID FROM `client` WHERE email = :login OR phone_number = :login")
    Optional<Integer> findIdByLogin(String login);

    @Query("SELECT * FROM `client` WHERE email = :login OR phone_number = :login")
    Optional<Client> findByLogin(String login);

    @Query("SELECT * FROM `client` WHERE client_ID = :id")
    Optional<Client> findById(Integer id);

    /*
    @Query("SELECT personal_information_id FROM `client` WHERE client_ID = :id")
    Optional<Client> findPersonalInformationIdByClientId(Integer id);
     */

    @Query("SELECT personal_information_ID FROM `client` WHERE client_ID = :id")
    Optional<Integer> findPersonalInformationIdByClientId(Integer id);

    @Query("""
            UPDATE `client` SET email = :email, 
            phone_number = :phoneNumber, `password`= :password
            WHERE client_ID = :id
            """)
    @Modifying
    void updateById(Integer id, String email, String phoneNumber, String password);

    @Query("SELECT email FROM `client` WHERE client_ID = :id")
    Optional<String> findEmailById(Integer id);

    @Query("SELECT phone_number FROM `client` WHERE client_ID = :id")
    Optional<String> findPhoneNumberById(Integer id);

}
