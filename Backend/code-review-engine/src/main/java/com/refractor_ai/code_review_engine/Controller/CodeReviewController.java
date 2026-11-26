package com.refractor_ai.code_review_engine.Controller;

import com.refractor_ai.code_review_engine.Model.CodeReviewRequest;
import com.refractor_ai.code_review_engine.Model.CodeReviewResponseDTO;
import com.refractor_ai.code_review_engine.Service.ModelOrchestrator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class CodeReviewController {

    private final ModelOrchestrator modelOrchestrator;

    public CodeReviewController(ModelOrchestrator modelOrchestrator) {
        this.modelOrchestrator = modelOrchestrator;
    }

    @PostMapping("/analyze")
    public ResponseEntity<CodeReviewResponseDTO> analyzeCode(@RequestBody CodeReviewRequest request) {
        if (request == null || request.getCode() == null || request.getCode().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        CodeReviewResponseDTO response = modelOrchestrator.executeAllModels(request.getCode());
        return ResponseEntity.ok(response);
    }
}