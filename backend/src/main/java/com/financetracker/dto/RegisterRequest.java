package com.financetracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Brugernavn er paakraevet")
    @Size(min = 3, max = 30, message = "Brugernavn skal vaere mellem 3 og 30 tegn")
    private String username;

    @NotBlank(message = "Email er paakraevet")
    @Email(message = "Email-format er ugyldigt")
    private String email;

    @NotBlank(message = "Kodeord er paakraevet")
    @Size(min = 6, max = 100, message = "Kodeord skal vaere mindst 6 tegn")
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
