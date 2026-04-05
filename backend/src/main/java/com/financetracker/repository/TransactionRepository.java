package com.financetracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.financetracker.model.Transaction;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByUserIdAndType(Long userId, String type);
    List<Transaction> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);

    @Query("SELECT t.category.name, SUM(t.amount) FROM Transaction t " +
            "WHERE t.user.id = :userId AND t.type = :type " +
            "GROUP BY t.category.name")
    List<Object[]> sumAmountByCategoryAndType(@Param("userId") Long userId,
                                              @Param("type") String type);
}
