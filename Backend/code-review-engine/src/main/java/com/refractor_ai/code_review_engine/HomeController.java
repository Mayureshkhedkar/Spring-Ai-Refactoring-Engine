package com.refractor_ai.code_review_engine;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class HomeController {

    @GetMapping("/")
    public String greet(){
        return "Hey, This is you spring backend System !"+ "\n Running Successfully.....";
    }
}
