package com.refractor_ai.code_review_engine.Strategy;


import com.refractor_ai.code_review_engine.Model.ComplexityModel;

public interface CodeRefactorStrategy {
    String getModelName();
    ComplexityModel refactor(String batchId, String originalCode);
}