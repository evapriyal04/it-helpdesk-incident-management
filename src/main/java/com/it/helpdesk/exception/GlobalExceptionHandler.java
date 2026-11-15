package com.it.helpdesk.exception;

import com.it.helpdesk.dto.ErrorResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 404: ticket or user not found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse body = new ErrorResponse(404, "Not Found", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    // 400: business rule broken (wrong role, missing resolution notes, etc.)
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex) {
        ErrorResponse body = new ErrorResponse(400, "Bad Request", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // 400: @Valid failed (blank title, missing priority, etc.)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        StringBuilder message = new StringBuilder();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            if (message.length() > 0) {
                message.append(", ");
            }
            message.append(fieldError.getDefaultMessage());
        }
        ErrorResponse body = new ErrorResponse(400, "Validation Failed", message.toString());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // 400: broken JSON or a wrong enum value (for example priority "URGENT")
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable(HttpMessageNotReadableException ex) {
        ErrorResponse body = new ErrorResponse(400, "Bad Request",
                "Invalid request body. Check the JSON format and the allowed values.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // 400: database rule broken (duplicate email, missing required user field)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
        ErrorResponse body = new ErrorResponse(400, "Bad Request",
                "Invalid data. A required field is missing or the email already exists.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // 404: a URL or file that does not exist
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResource(NoResourceFoundException ex) {
        ErrorResponse body = new ErrorResponse(404, "Not Found", "Page or file not found.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    // 500: anything unexpected
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleOther(Exception ex) {
        ex.printStackTrace();
        ErrorResponse body = new ErrorResponse(500, "Internal Server Error",
                "Something went wrong on the server.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}