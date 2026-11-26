package com.refractor_ai.code_review_engine.Service;

import com.refractor_ai.code_review_engine.Model.CodeReviewResponseDTO;
import com.refractor_ai.code_review_engine.Model.ComplexityModel;
import com.refractor_ai.code_review_engine.Strategy.CodeRefactorStrategy;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class ModelOrchestrator {

    private final List<CodeRefactorStrategy> strategies;
    private final ExecutorService virtualThreadExecutor = Executors.newVirtualThreadPerTaskExecutor();

    public ModelOrchestrator(List<CodeRefactorStrategy> strategies) {
        this.strategies = strategies;
    }

    public CodeReviewResponseDTO executeAllModels(String originalCode) {
        String batchId = UUID.randomUUID().toString();

        // Fire all registered LLM strategies concurrently on Java 21 Virtual Threads
        List<CompletableFuture<ComplexityModel>> futures = strategies.stream()
                .map(strategy -> CompletableFuture
                        .supplyAsync(() -> strategy.refactor(batchId, originalCode), virtualThreadExecutor)
                        .exceptionally(ex -> buildFallbackResult(batchId, strategy.getModelName(), ex)))
                .toList();

        // Wait for all models to finish and collect their DTOs
        List<ComplexityModel> results = futures.stream()
                .map(CompletableFuture::join)
                .toList();

        return new CodeReviewResponseDTO(batchId, results);
    }

    // Prevents one failing/timed-out API from crashing the entire batch
    private ComplexityModel buildFallbackResult(String batchId, String modelName, Throwable ex) {
        ComplexityModel fallback = new ComplexityModel();
        fallback.setBatch_id(batchId);
        fallback.setModel_name(modelName);
        fallback.setRefactored_code("// Error during refactoring: " + ex.getMessage());
        fallback.setTime_complexity("N/A");
        fallback.setSpace_complexity("N/A");
        fallback.setCyclomatic_complexity(-1);
        fallback.setResponse_time_ms(0L);
        fallback.setRetry_count(0);
        return fallback;
    }

    @PreDestroy
    public void shutdownExecutor() {
        virtualThreadExecutor.shutdown();
    }
}