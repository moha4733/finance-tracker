package com.financetracker.repository;

import com.financetracker.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserId(Long userId);
    List<Budget> findByUserIdAndMonth(Long userId, String month);
    Optional<Budget> findByUserIdAndCategoryIdAndMonth(Long userId, Long categoryId, String month);
}
