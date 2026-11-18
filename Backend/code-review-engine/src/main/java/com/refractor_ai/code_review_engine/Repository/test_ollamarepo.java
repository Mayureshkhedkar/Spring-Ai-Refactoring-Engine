package com.refractor_ai.code_review_engine.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.refractor_ai.code_review_engine.Entity.test_ollamaresponse;

public interface test_ollamarepo extends JpaRepository<test_ollamaresponse,Integer> {
}
