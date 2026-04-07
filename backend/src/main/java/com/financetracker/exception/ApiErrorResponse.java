package com.financetracker.exception;

import java.util.List;
import java.util.Map;

public class ApiErrorResponse {
    private String message;
    private List<String> errors;
    private Map<String, String> fieldErrors;

    public ApiErrorResponse(String message, List<String> errors, Map<String, String> fieldErrors) {
        this.message = message;
        this.errors = errors;
        this.fieldErrors = fieldErrors;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }

    public void setFieldErrors(Map<String, String> fieldErrors) {
        this.fieldErrors = fieldErrors;
    }
}
