package com.refractor_ai.code_review_engine.Strategy;

import com.refractor_ai.code_review_engine.Repository.Complexity_Record_Repo;
import com.refractor_ai.code_review_engine.Service.CompilerVerificationService;
import com.refractor_ai.code_review_engine.Service.JavaParserService;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.stereotype.Service;

@Service("geminiStrategy")
public class GeminiStrategy extends AbstractRefactorStrategy {

    public GeminiStrategy(
            GoogleGenAiChatModel googleGenAiChatModel,
            JavaParserService javaParserService,
            CompilerVerificationService compilerService,
            Complexity_Record_Repo repository
    ) {
        super(googleGenAiChatModel, javaParserService, compilerService, repository);
    }

    @Override
    public String getModelName() {
        return "Google Gemini";
    }
}