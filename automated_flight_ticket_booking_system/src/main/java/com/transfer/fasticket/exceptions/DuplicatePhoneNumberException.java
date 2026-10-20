package com.transfer.fasticket.exceptions;

public class DuplicatePhoneNumberException extends RuntimeException{
    public DuplicatePhoneNumberException(String message) {
        super(message);
    }
}
