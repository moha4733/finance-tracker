package com.financetracker.service;

import com.financetracker.dto.RecurringTransactionRequest;
import com.financetracker.dto.RecurringTransactionResponse;
import com.financetracker.model.Category;
import com.financetracker.model.RecurringTransaction;
import com.financetracker.model.Transaction;
import com.financetracker.model.User;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.RecurringTransactionRepository;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecurringTransactionService {

    @Autowired
    private RecurringTransactionRepository recurringTransactionRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Bruger ikke fundet"));
    }

    public RecurringTransactionResponse create(RecurringTransactionRequest request) {
        User user = getCurrentUser();
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Kategori ikke fundet"));
            if (category.getUser().getId() != user.getId()) {
                throw new RuntimeException("Kategori tilhoerer ikke denne bruger");
            }
        }

        RecurringTransaction recurring = new RecurringTransaction();
        recurring.setAmount(request.getAmount());
        recurring.setDescription(request.getDescription());
        recurring.setType(request.getType());
        recurring.setFrequency(request.getFrequency() == null ? "MONTHLY" : request.getFrequency());
        recurring.setStartDate(request.getStartDate());
        recurring.setNextRunDate(request.getStartDate());
        recurring.setEndDate(request.getEndDate());
        recurring.setActive(request.getActive() == null || request.getActive());
        recurring.setUser(user);
        recurring.setCategory(category);

        return toResponse(recurringTransactionRepository.save(recurring));
    }

    public List<RecurringTransactionResponse> getAll() {
        User user = getCurrentUser();
        return recurringTransactionRepository.findByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Map<String, Integer> runDue() {
        User user = getCurrentUser();
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> dueTemplates = recurringTransactionRepository
                .findByUserIdAndActiveTrueAndNextRunDateLessThanEqual(user.getId(), today);

        int generatedCount = 0;
        for (RecurringTransaction recurring : dueTemplates) {
            LocalDate runDate = recurring.getNextRunDate();
            while (runDate != null && !runDate.isAfter(today)) {
                if (recurring.getEndDate() != null && runDate.isAfter(recurring.getEndDate())) {
                    recurring.setActive(false);
                    break;
                }

                boolean exists = transactionRepository.existsByUserIdAndRecurringSourceIdAndDate(
                        user.getId(), recurring.getId(), runDate
                );
                if (!exists) {
                    Transaction transaction = new Transaction();
                    transaction.setAmount(recurring.getAmount());
                    transaction.setDescription(recurring.getDescription());
                    transaction.setType(recurring.getType());
                    transaction.setDate(runDate);
                    transaction.setUser(user);
                    transaction.setCategory(recurring.getCategory());
                    transaction.setRecurringSourceId(recurring.getId());
                    transactionRepository.save(transaction);
                    generatedCount++;
                }

                runDate = nextDate(runDate, recurring.getFrequency());
                recurring.setNextRunDate(runDate);
            }
            recurringTransactionRepository.save(recurring);
        }

        Map<String, Integer> response = new HashMap<>();
        response.put("generatedCount", generatedCount);
        return response;
    }

    private LocalDate nextDate(LocalDate date, String frequency) {
        if ("MONTHLY".equalsIgnoreCase(frequency)) {
            return date.plusMonths(1);
        }
        return date.plusMonths(1);
    }

    private RecurringTransactionResponse toResponse(RecurringTransaction recurring) {
        RecurringTransactionResponse response = new RecurringTransactionResponse();
        response.setId(recurring.getId());
        response.setAmount(recurring.getAmount());
        response.setDescription(recurring.getDescription());
        response.setType(recurring.getType());
        response.setFrequency(recurring.getFrequency());
        response.setStartDate(recurring.getStartDate());
        response.setNextRunDate(recurring.getNextRunDate());
        response.setEndDate(recurring.getEndDate());
        response.setActive(recurring.isActive());
        response.setCategoryId(recurring.getCategory() != null ? recurring.getCategory().getId() : null);
        response.setCategoryName(recurring.getCategory() != null ? recurring.getCategory().getName() : null);
        return response;
    }
}
