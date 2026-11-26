package com.refractor_ai.code_review_engine.Config;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class NvidiaConfig {

    @Bean("nvidiaChatModel")
    public ChatModel nvidiaChatModel(
            @Value("${nvidia.api.key}") String apiKey,
            @Value("${nvidia.api.base-url}") String baseUrl,
            @Value("${nvidia.api.model}") String model
    ) {
        OpenAIClient client = OpenAIOkHttpClient.builder()
                .apiKey(apiKey)
                .baseUrl(baseUrl)
                .timeout(Duration.ofSeconds(60))
                .build();

        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .model(model)
                .maxTokens(2048)
                .temperature(0.2)
                .build();

        return OpenAiChatModel.builder()
                .openAiClient(client)
                .openAiClientAsync(client.async())
                .options(options)
                .build();
    }
}