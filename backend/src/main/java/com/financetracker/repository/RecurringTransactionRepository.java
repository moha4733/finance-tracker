package com.financetracker.repository;

import com.financetracker.model.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    List<RecurringTransaction> findByUserId(Long userId);
    List<RecurringTransaction> findByUserIdAndActiveTrueAndNextRunDateLessThanEqual(Long userId, LocalDate date);
}
