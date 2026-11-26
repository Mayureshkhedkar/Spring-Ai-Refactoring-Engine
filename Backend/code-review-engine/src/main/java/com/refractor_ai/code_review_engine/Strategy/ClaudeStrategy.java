package com.refractor_ai.code_review_engine.Strategy;

import com.refractor_ai.code_review_engine.Repository.Complexity_Record_Repo;
import com.refractor_ai.code_review_engine.Service.CompilerVerificationService;
import com.refractor_ai.code_review_engine.Service.JavaParserService;
import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.stereotype.Service;

@Service("claudeStrategy")
public class ClaudeStrategy extends AbstractRefactorStrategy {

    public ClaudeStrategy(
            AnthropicChatModel anthropicChatModel,
            JavaParserService javaParserService,
            CompilerVerificationService compilerService,
            Complexity_Record_Repo repository
    ) {
        super(anthropicChatModel, javaParserService, compilerService, repository);
    }

    @Override
    public String getModelName() {
        return "Anthropic Claude";
    }
}