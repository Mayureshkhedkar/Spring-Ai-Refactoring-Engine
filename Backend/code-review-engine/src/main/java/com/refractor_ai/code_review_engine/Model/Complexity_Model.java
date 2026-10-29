package com.refractor_ai.code_review_engine.Model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Complexity_Model {
    private Integer response_id;
    private String time_complexity;
    private String space_complexity;
    private String response_time;
}
