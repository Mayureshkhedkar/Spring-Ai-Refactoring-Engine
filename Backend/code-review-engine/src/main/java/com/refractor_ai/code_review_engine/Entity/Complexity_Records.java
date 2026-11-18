package com.refractor_ai.code_review_engine.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "complexity_records")
public class Complexity_Records {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer response_id; // Primary Key

    @Column(nullable = false)
    private String batch_id; // Groups the 4 AI models to the 1 user request

    @Column(nullable = false)
    private String model_name; // Identifies "Ollama", "Gemini", "GPT", or "Claude"

    @Column
    private String time_complexity; // Stores Big-O string like "O(n)"

    @Column
    private String space_complexity; // Stores Big-O string like "O(1)"

    @Column
    private Integer cyclomatic_complexity; // Stores the mathematical branching score (e.g., 4)

    @Column
    private Long response_time_ms; // Stored in milliseconds to allow mathematical averaging

    @Column
    private Integer retry_count; // Tracks how many times the AI failed to compile
}