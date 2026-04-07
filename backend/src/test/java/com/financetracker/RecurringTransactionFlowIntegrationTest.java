package com.financetracker;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RecurringTransactionFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createRecurringAndGenerateDueTransactionsWithoutDuplicates() throws Exception {
        String registerPayload = """
                {
                  "username": "recurring_user",
                  "email": "recurring_user@test.com",
                  "password": "123456"
                }
                """;
        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode registerJson = objectMapper.readTree(registerResult.getResponse().getContentAsString());
        String token = registerJson.get("token").asText();
        assertThat(token).isNotBlank();

        String categoryPayload = """
                {
                  "name": "Husleje",
                  "type": "EXPENSE"
                }
                """;
        MvcResult categoryResult = mockMvc.perform(post("/api/categories")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(categoryPayload))
                .andExpect(status().isOk())
                .andReturn();
        long categoryId = objectMapper.readTree(categoryResult.getResponse().getContentAsString()).get("id").asLong();

        LocalDate startDate = LocalDate.now().minusMonths(1).withDayOfMonth(1);
        String recurringPayload = """
                {
                  "amount": 4500,
                  "description": "Maanedlig husleje",
                  "type": "EXPENSE",
                  "categoryId": %d,
                  "startDate": "%s",
                  "frequency": "MONTHLY",
                  "active": true
                }
                """.formatted(categoryId, startDate);

        mockMvc.perform(post("/api/recurring-transactions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(recurringPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Maanedlig husleje"))
                .andExpect(jsonPath("$.frequency").value("MONTHLY"));

        mockMvc.perform(post("/api/recurring-transactions/run-due")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.generatedCount").value(2));

        mockMvc.perform(get("/api/transactions")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        mockMvc.perform(post("/api/recurring-transactions/run-due")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.generatedCount").value(0));

        mockMvc.perform(get("/api/transactions")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }
}
