package com.refractor_ai.code_review_engine.Repository;

import com.refractor_ai.code_review_engine.Entity.Complexity_Records;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Complexity_Record_Repo extends JpaRepository<Complexity_Records,Integer> {

}
