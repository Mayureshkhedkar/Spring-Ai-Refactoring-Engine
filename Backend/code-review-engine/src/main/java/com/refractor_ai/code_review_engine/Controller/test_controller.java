package com.refractor_ai.code_review_engine.Controller;


import com.refractor_ai.code_review_engine.Repository.test_ollamarepo;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/testapi")
public class test_controller {

    @Autowired
    private test_ollamarepo testOllamarepo;

    private ChatClient chatClient;

    public test_controller(OllamaChatModel chatModel) {
        this.chatClient = ChatClient.create(chatModel);
    }

    @PostMapping("/ollamaresponse")
    public ResponseEntity<String> getReponse (@PathVariable String messege ){
        System.out.println(messege);

        ChatResponse chatResponse= chatClient.prompt(messege).call().chatResponse();
        return ResponseEntity.ok(chatResponse.getResult().getOutput().getText());
    }
}
