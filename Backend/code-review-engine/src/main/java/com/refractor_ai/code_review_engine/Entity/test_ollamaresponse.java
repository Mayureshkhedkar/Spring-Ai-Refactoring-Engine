package com.refractor_ai.code_review_engine.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "ollamaresponses")

public class test_ollamaresponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer test_id;

    @Column
    private String prompt;

    @Column
    private String response;
}

