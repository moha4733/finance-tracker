package com.financetracker.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.financetracker.dto.CategoryRequest;
import com.financetracker.dto.CategoryResponse;
import com.financetracker.model.Category;
import com.financetracker.model.User;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Bruger ikke fundet"));
    }

    public CategoryResponse create(CategoryRequest request) {
        User user = getCurrentUser();

        Category category = new Category();
        category.setName(request.getName());
        category.setType(request.getType());
        category.setUser(user);

        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    public List<CategoryResponse> getAll() {
        User user = getCurrentUser();
        return categoryRepository.findByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }

    private CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setType(category.getType());
        return response;
    }
}
