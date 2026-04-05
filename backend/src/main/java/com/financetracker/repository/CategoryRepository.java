package com.financetracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.financetracker.model.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {


    List<Category> findByUserId(Long id);
    Optional<Category> findByUserIdAndType(Long userId, String type);
}
