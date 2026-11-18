package com.refractor_ai.code_review_engine.Model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Complexity_Model {
    private Integer response_id;
    private String batch_id;
    private String model_name;
    private String refactored_code;
    private String time_complexity;
    private String space_complexity;
    private Integer cyclomatic_complexity;
    private Long response_time_ms;
    private Integer retry_count;
}
