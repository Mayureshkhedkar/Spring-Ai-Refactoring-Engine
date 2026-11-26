package com.refractor_ai.code_review_engine.Model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplexityModel {
    private Integer response_id;
    private String batch_id; // Changed from Integer to String to handle UUIDs
    private String model_name;
    private String refactored_code; // Added so the frontend can display the code
    private String time_complexity;
    private String space_complexity;
    private Integer cyclomatic_complexity;
    private Long response_time_ms; // Changed from String to Long to match the Entity
    private Integer retry_count;
}