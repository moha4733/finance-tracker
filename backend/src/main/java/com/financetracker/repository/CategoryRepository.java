package src.main.java.com.financetracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import src.main.java.com.financetracker.model.Category;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {


    Optional<Category> findByUserId(Long id);
    Optional<Category> findByUserAndType(Long userId, String type);
}
