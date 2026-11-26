package com.refractor_ai.code_review_engine.Strategy;

import com.refractor_ai.code_review_engine.Entity.Complexity_Records;
import com.refractor_ai.code_review_engine.Model.AiRefactorOutput;
import com.refractor_ai.code_review_engine.Model.ComplexityModel;
import com.refractor_ai.code_review_engine.Repository.Complexity_Record_Repo;
import com.refractor_ai.code_review_engine.Service.CompilerVerificationService;
import com.refractor_ai.code_review_engine.Service.JavaParserService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.converter.BeanOutputConverter;

import java.util.Map;

public abstract class AbstractRefactorStrategy implements CodeRefactorStrategy {

    protected static final int MAX_RETRIES = 3;

    private final ChatClient chatClient;
    private final JavaParserService javaParserService;
    private final CompilerVerificationService compilerService;
    private final Complexity_Record_Repo repository;

    protected AbstractRefactorStrategy(
            ChatModel chatModel,
            JavaParserService javaParserService,
            CompilerVerificationService compilerService,
            Complexity_Record_Repo repository
    ) {
        this.chatClient = ChatClient.create(chatModel);
        this.javaParserService = javaParserService;
        this.compilerService = compilerService;
        this.repository = repository;
    }

    @Override
    public ComplexityModel refactor(String batchId, String originalCode) {
        long startTime = System.currentTimeMillis();

        BeanOutputConverter<AiRefactorOutput> converter = new BeanOutputConverter<>(AiRefactorOutput.class);
        String formatInstructions = converter.getFormat();

        PromptTemplate initialTemplate = new PromptTemplate("""
                You are an expert Java architect.
                Refactor the following Java code to reduce cyclomatic complexity, improve time/space efficiency, and preserve exact logic.
                Ensure all necessary Java imports are included so the class compiles standalone.
                Do not wrap the code inside markdown backticks inside the JSON field.

                Original Code:
                {code}

                {format}
                """);

        Prompt currentPrompt = initialTemplate.create(Map.of(
                "code", originalCode,
                "format", formatInstructions
        ));

        int retryCount = 0;
        boolean compiled = false;
        AiRefactorOutput aiOutput = null;
        String cleanedCode = "";

        do {
            try {
                ChatResponse response = chatClient.prompt(currentPrompt).call().chatResponse();
                String rawText = stripThinkingTags(response.getResult().getOutput().getText());
                System.out.println("[" + getModelName() + "] Attempt " + (retryCount + 1) + " raw output: " + rawText);

                aiOutput = converter.convert(rawText);
                cleanedCode = cleanMarkdown(aiOutput.refactoredCode());

                // Gate 1: AST Syntax Verification
                if (!javaParserService.isValidSyntax(cleanedCode)) {
                    System.err.println("[" + getModelName() + "] Attempt " + (retryCount + 1) + " failed AST syntax check.");
                    retryCount++;
                    currentPrompt = buildCorrectionPrompt(
                            cleanedCode,
                            "Invalid Java syntax detected by AST parser.",
                            formatInstructions
                    );
                    continue;
                }

                // Gate 2: In-Memory Compilation Verification
                String className = javaParserService.extractPublicClassName(cleanedCode);
                String compilerErrors = compilerService.compileCode(className, cleanedCode);

                if (compilerErrors.isEmpty()) {
                    compiled = true;
                } else {
                    System.err.println("[" + getModelName() + "] Attempt " + (retryCount + 1) + " compiler errors: " + compilerErrors);
                    retryCount++;
                    currentPrompt = buildCorrectionPrompt(cleanedCode, compilerErrors, formatInstructions);
                }

            } catch (Exception e) {
                System.err.println("[" + getModelName() + "] Attempt " + (retryCount + 1) + " FAILED: " + e.getMessage());
                e.printStackTrace();
                retryCount++;
                currentPrompt = buildCorrectionPrompt(
                        cleanedCode.isEmpty() ? originalCode : cleanedCode,
                        "Response parsing failed: " + e.getMessage(),
                        formatInstructions
                );
            }
        } while (!compiled && retryCount < MAX_RETRIES);

        long executionTimeMs = System.currentTimeMillis() - startTime;
        int finalComplexity = javaParserService.calculateCyclomaticComplexity(cleanedCode);

        Complexity_Records record = new Complexity_Records();
        record.setBatchId(batchId);
        record.setModelName(getModelName());
        record.setTimeComplexity(aiOutput != null ? aiOutput.timeComplexity() : "Unknown");
        record.setSpaceComplexity(aiOutput != null ? aiOutput.spaceComplexity() : "Unknown");
        record.setCyclomaticComplexity(finalComplexity);
        record.setResponseTimeMs(executionTimeMs);
        record.setRetryCount(retryCount);

        Complexity_Records savedRecord = repository.save(record);

        ComplexityModel dto = new ComplexityModel();
        dto.setResponse_id(savedRecord.getResponseId());
        dto.setBatch_id(savedRecord.getBatchId());
        dto.setModel_name(savedRecord.getModelName());
        dto.setRefactored_code(cleanedCode);
        dto.setTime_complexity(savedRecord.getTimeComplexity());
        dto.setSpace_complexity(savedRecord.getSpaceComplexity());
        dto.setCyclomatic_complexity(savedRecord.getCyclomaticComplexity());
        dto.setResponse_time_ms(savedRecord.getResponseTimeMs());
        dto.setRetry_count(savedRecord.getRetryCount());

        return dto;
    }

    private Prompt buildCorrectionPrompt(String brokenCode, String errorDetails, String formatInstructions) {
        PromptTemplate fixTemplate = new PromptTemplate("""
                Your previous refactored Java code failed verification.
                Fix the exact errors listed below and return valid, compiling Java code with all required imports.

                Errors:
                {errors}

                Broken Code:
                {code}

                {format}
                """);

        return fixTemplate.create(Map.of(
                "errors", errorDetails,
                "code", brokenCode,
                "format", formatInstructions
        ));
    }

    private String stripThinkingTags(String rawText) {
        if (rawText == null) return "";
        return rawText.replaceAll("(?s)<think>.*?</think>", "").trim();
    }

    private String cleanMarkdown(String code) {
        if (code == null) return "";
        return code.replaceAll("(?s)```java\\s*", "")
                .replaceAll("(?s)```\\s*", "")
                .trim();
    }
}