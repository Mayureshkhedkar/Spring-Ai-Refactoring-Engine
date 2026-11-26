package com.refractor_ai.code_review_engine.Strategy;

import com.refractor_ai.code_review_engine.Repository.Complexity_Record_Repo;
import com.refractor_ai.code_review_engine.Service.CompilerVerificationService;
import com.refractor_ai.code_review_engine.Service.JavaParserService;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service("nvidiaStrategy")
public class NvidiaStrategy extends AbstractRefactorStrategy {

    public NvidiaStrategy(
            @Qualifier("nvidiaChatModel") ChatModel nvidiaChatModel,
            JavaParserService javaParserService,
            CompilerVerificationService compilerService,
            Complexity_Record_Repo repository
    ) {
        super(nvidiaChatModel, javaParserService, compilerService, repository);
    }

    @Override
    public String getModelName() {
        return "NVIDIA Nemotron";
    }
}