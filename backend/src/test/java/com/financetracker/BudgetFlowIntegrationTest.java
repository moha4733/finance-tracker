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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BudgetFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void budgetCrudFlowWithJwt() throws Exception {
        String registerPayload = """
                {
                  "username": "budget_user",
                  "email": "budget_user@test.com",
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
                  "name": "Mad",
                  "type": "EXPENSE"
                }
                """;

        MvcResult categoryResult = mockMvc.perform(post("/api/categories")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(categoryPayload))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode categoryJson = objectMapper.readTree(categoryResult.getResponse().getContentAsString());
        long categoryId = categoryJson.get("id").asLong();

        String createBudgetPayload = """
                {
                  "categoryId": %d,
                  "month": "2026-04",
                  "amount": 2500
                }
                """.formatted(categoryId);

        MvcResult budgetCreateResult = mockMvc.perform(post("/api/budgets")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBudgetPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryName").value("Mad"))
                .andExpect(jsonPath("$.month").value("2026-04"))
                .andExpect(jsonPath("$.amount").value(2500))
                .andReturn();

        long budgetId = objectMapper.readTree(budgetCreateResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(get("/api/budgets")
                        .header("Authorization", "Bearer " + token)
                        .param("month", "2026-04"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].categoryName").value("Mad"))
                .andExpect(jsonPath("$[0].amount").value(2500));

        String updateBudgetPayload = """
                {
                  "categoryId": %d,
                  "month": "2026-04",
                  "amount": 3000
                }
                """.formatted(categoryId);

        mockMvc.perform(put("/api/budgets/{id}", budgetId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBudgetPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(3000));

        mockMvc.perform(delete("/api/budgets/{id}", budgetId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/budgets")
                        .header("Authorization", "Bearer " + token)
                        .param("month", "2026-04"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
