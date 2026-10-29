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
    private Integer response_id;

    @Column
    private String time_complexity;

    @Column
    private String space_complexity;

    @Column
    private String response_time;

}
