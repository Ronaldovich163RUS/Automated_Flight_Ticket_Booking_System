package com.transfer.fasticket.controllersREST;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class CustomRESTController {
    @GetMapping("/.well-known/appspecific/com.chrome.devtools.json")
    public ResponseEntity<Map<String, Object>> handleDevToolsRequest() {
        return ResponseEntity.ok().body(Map.of("status", "ok"));
    }
}
