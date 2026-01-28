package Retail.POS.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class MpesaC2BService {

    @Value("${mpesa.paybill}")
    private String shortCode;

    @Value("${mpesa.account}")
    private String accountNumber;

    @Value("${mpesa.c2b.validation-url}")
    private String validationUrl;

    @Value("${mpesa.c2b.confirmation-url}")
    private String confirmationUrl;

    private final RestTemplate restTemplate;

    public MpesaC2BService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Registers C2B confirmation and validation URLs with Safaricom
     * @param accessToken M-Pesa access token
     * @return response from Safaricom
     */
    public ResponseEntity<String> registerC2BUrls(String accessToken) {
        String url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";
        Map<String, String> body = new HashMap<>();
        body.put("ShortCode", shortCode);
        body.put("ResponseType", "Completed");
        body.put("ConfirmationURL", confirmationUrl);
        body.put("ValidationURL", validationUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
        return restTemplate.postForEntity(url, entity, String.class);
    }
}
