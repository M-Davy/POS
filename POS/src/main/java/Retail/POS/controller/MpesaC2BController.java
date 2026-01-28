package Retail.POS.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/c2b")
public class MpesaC2BController {
    private static final Logger logger = LoggerFactory.getLogger(MpesaC2BController.class);

    private final Retail.POS.service.MpesaC2BService mpesaC2BService;
    private final Retail.POS.service.MpesaAuthService mpesaAuthService;

    public MpesaC2BController(Retail.POS.service.MpesaC2BService mpesaC2BService, Retail.POS.service.MpesaAuthService mpesaAuthService) {
        this.mpesaC2BService = mpesaC2BService;
        this.mpesaAuthService = mpesaAuthService;
    }

    /**
     * Endpoint to register C2B URLs with Safaricom (for testing/triggering registration)
     */
    @PostMapping("/register-urls")
    public ResponseEntity<?> registerC2BUrls() {
        String accessToken = mpesaAuthService.getAccessToken();
        ResponseEntity<String> response = mpesaC2BService.registerC2BUrls(accessToken);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    /**
     * Validation callback endpoint. Safaricom calls this before processing payment.
     * Respond with resultCode 0 to accept, or any other code to reject.
     */
    @PostMapping("/validation")
    public ResponseEntity<Map<String, Object>> validateC2B(@RequestBody Map<String, Object> payload) {
        logger.info("Received C2B Validation request: {}", payload);
        // Accept all transactions for now (resultCode 0)
        Map<String, Object> response = new HashMap<>();
        response.put("ResultCode", 0);
        response.put("ResultDesc", "Accepted");
        return ResponseEntity.ok(response);
    }

    /**
     * Confirmation callback endpoint. Safaricom calls this after payment is processed.
     * Record the transaction here.
     */
    @PostMapping("/confirmation")
    public ResponseEntity<Map<String, Object>> confirmC2B(@RequestBody Map<String, Object> payload) {
        logger.info("Received C2B Confirmation: {}", payload);
        // TODO: Save transaction details to DB if needed
        Map<String, Object> response = new HashMap<>();
        response.put("ResultCode", 0);
        response.put("ResultDesc", "Confirmation Received");
        return ResponseEntity.ok(response);
    }
}