package com.financetracker.controller;

import com.financetracker.dto.RecurringTransactionRequest;
import com.financetracker.dto.RecurringTransactionResponse;
import com.financetracker.service.RecurringTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recurring-transactions")
public class RecurringTransactionController {

    @Autowired
    private RecurringTransactionService recurringTransactionService;

    @PostMapping
    public ResponseEntity<RecurringTransactionResponse> create(@RequestBody RecurringTransactionRequest request) {
        return ResponseEntity.ok(recurringTransactionService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<RecurringTransactionResponse>> getAll() {
        return ResponseEntity.ok(recurringTransactionService.getAll());
    }

    @PostMapping("/run-due")
    public ResponseEntity<Map<String, Integer>> runDue() {
        return ResponseEntity.ok(recurringTransactionService.runDue());
    }
}
