package com.financetracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.financetracker.dto.TransactionRequest;
import com.financetracker.dto.TransactionResponse;
import com.financetracker.model.Category;
import com.financetracker.model.Transaction;
import com.financetracker.model.User;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Bruger ikke fundet"));
    }

    public TransactionResponse create(TransactionRequest request) {
        User user = getCurrentUser();

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Kategori ikke fundet"));
            if (category.getUser().getId() != user.getId()) {
                throw new RuntimeException("Kategori tilhører ikke denne bruger");
            }
        }

        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setDate(request.getDate());
        transaction.setType(request.getType());
        transaction.setUser(user);
        transaction.setCategory(category);

        Transaction saved = transactionRepository.save(transaction);
        return toResponse(saved);
    }

    public List<TransactionResponse> getAll() {
        User user = getCurrentUser();
        return transactionRepository.findByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getByType(String type) {
        User user = getCurrentUser();
        return transactionRepository.findByUserIdAndType(user.getId(), type)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void delete(Long id) {
        User user = getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaktion ikke fundet"));
        if (transaction.getUser().getId() != user.getId()) {
            throw new RuntimeException("Du har ikke adgang til denne transaktion");
        }
        transactionRepository.delete(transaction);
    }

    public TransactionResponse update(Long id, TransactionRequest request) {
        User user = getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaktion ikke fundet"));
        if (transaction.getUser().getId() != user.getId()) {
            throw new RuntimeException("Du har ikke adgang til denne transaktion");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Kategori ikke fundet"));
            if (category.getUser().getId() != user.getId()) {
                throw new RuntimeException("Kategori tilhører ikke denne bruger");
            }
        }

        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setDate(request.getDate());
        transaction.setType(request.getType());
        transaction.setCategory(category);

        Transaction saved = transactionRepository.save(transaction);
        return toResponse(saved);
    }

    private TransactionResponse toResponse(Transaction transaction) {
        TransactionResponse response = new TransactionResponse();
        response.setId(transaction.getId());
        response.setAmount(transaction.getAmount());
        response.setDescription(transaction.getDescription());
        response.setDate(transaction.getDate());
        response.setType(transaction.getType());
        response.setCategoryId(transaction.getCategory() != null ? transaction.getCategory().getId() : null);
        response.setCategoryName(
                transaction.getCategory() != null ? transaction.getCategory().getName() : null);
        return response;
    }
}

