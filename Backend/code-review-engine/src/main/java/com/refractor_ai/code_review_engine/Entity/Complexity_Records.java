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
    @Column(name = "response_id")
    private Integer responseId;

    @Column(name = "batch_id", nullable = false)
    private String batchId;

    @Column(name = "model_name", nullable = false)
    private String modelName;

    @Column(name = "time_complexity")
    private String timeComplexity;

    @Column(name = "space_complexity")
    private String spaceComplexity;

    @Column(name = "cyclomatic_complexity")
    private Integer cyclomaticComplexity;

    @Column(name = "response_time_ms")
    private Long responseTimeMs;

    @Column(name = "retry_count")
    private Integer retryCount;
}