package com.refractor_ai.code_review_engine.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeReviewResponseDTO {
    private String batch_id;
    private List<Complexity_Model> results; // Holds Ollama, GPT, Claude, and Gemini in one array
}