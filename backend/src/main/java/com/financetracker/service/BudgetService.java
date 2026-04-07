package com.financetracker.service;

import com.financetracker.dto.BudgetRequest;
import com.financetracker.dto.BudgetResponse;
import com.financetracker.exception.BadRequestException;
import com.financetracker.model.Budget;
import com.financetracker.model.Category;
import com.financetracker.model.User;
import com.financetracker.repository.BudgetRepository;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Bruger ikke fundet"));
    }

    private void validateMonth(String month) {
        try {
            YearMonth.parse(month);
        } catch (DateTimeParseException ex) {
            throw new BadRequestException("Month skal have formatet yyyy-MM");
        }
    }

    public BudgetResponse createOrUpdate(BudgetRequest request) {
        User user = getCurrentUser();
        validateMonth(request.getMonth());
        if (request.getAmount() == null || request.getAmount().signum() < 0) {
            throw new BadRequestException("Amount skal vaere 0 eller hoejere");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Kategori ikke fundet"));
        if (category.getUser().getId() != user.getId()) {
            throw new RuntimeException("Kategori tilhoerer ikke denne bruger");
        }

        Budget budget = budgetRepository
                .findByUserIdAndCategoryIdAndMonth(user.getId(), request.getCategoryId(), request.getMonth())
                .orElseGet(Budget::new);
        budget.setUser(user);
        budget.setCategory(category);
        budget.setMonth(request.getMonth());
        budget.setAmount(request.getAmount());

        return toResponse(budgetRepository.save(budget));
    }

    public BudgetResponse update(Long id, BudgetRequest request) {
        User user = getCurrentUser();
        validateMonth(request.getMonth());
        if (request.getAmount() == null || request.getAmount().signum() < 0) {
            throw new BadRequestException("Amount skal vaere 0 eller hoejere");
        }

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget ikke fundet"));
        if (budget.getUser().getId() != user.getId()) {
            throw new RuntimeException("Du har ikke adgang til dette budget");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Kategori ikke fundet"));
        if (category.getUser().getId() != user.getId()) {
            throw new RuntimeException("Kategori tilhoerer ikke denne bruger");
        }

        budget.setCategory(category);
        budget.setMonth(request.getMonth());
        budget.setAmount(request.getAmount());
        return toResponse(budgetRepository.save(budget));
    }

    public List<BudgetResponse> getAll(String month) {
        User user = getCurrentUser();
        List<Budget> budgets;
        if (month == null || month.isBlank()) {
            budgets = budgetRepository.findByUserId(user.getId());
        } else {
            validateMonth(month);
            budgets = budgetRepository.findByUserIdAndMonth(user.getId(), month);
        }
        return budgets.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public void delete(Long id) {
        User user = getCurrentUser();
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget ikke fundet"));
        if (budget.getUser().getId() != user.getId()) {
            throw new RuntimeException("Du har ikke adgang til dette budget");
        }
        budgetRepository.delete(budget);
    }

    private BudgetResponse toResponse(Budget budget) {
        BudgetResponse response = new BudgetResponse();
        response.setId(budget.getId());
        response.setCategoryId(budget.getCategory().getId());
        response.setCategoryName(budget.getCategory().getName());
        response.setMonth(budget.getMonth());
        response.setAmount(budget.getAmount());
        return response;
    }
}
