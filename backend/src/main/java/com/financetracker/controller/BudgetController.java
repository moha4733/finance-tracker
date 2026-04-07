package com.financetracker.controller;

import com.financetracker.dto.BudgetRequest;
import com.financetracker.dto.BudgetResponse;
import com.financetracker.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetResponse> create(@RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.createOrUpdate(request));
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getAll(@RequestParam(required = false) String month) {
        return ResponseEntity.ok(budgetService.getAll(month));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> update(@PathVariable Long id, @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        budgetService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
