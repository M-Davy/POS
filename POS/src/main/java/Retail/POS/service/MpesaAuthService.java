package Retail.POS.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Base64;

@Service
public class MpesaAuthService {
    @Value("${mpesa.consumer.key}")
    private String consumerKey;

    @Value("${mpesa.consumer.secret}")
    private String consumerSecret;

    private final String TOKEN_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

    public String getAccessToken() {
        RestTemplate restTemplate = new RestTemplate();
        String credentials = consumerKey + ":" + consumerSecret;
        String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Basic " + encodedCredentials);
        HttpEntity<String> request = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(TOKEN_URL, HttpMethod.GET, request, String.class);
        if (response.getStatusCode() == HttpStatus.OK) {
            // Extract access_token from response JSON
            String body = response.getBody();
            String token = body.replaceAll(".*\"access_token\":\"(.*?)\".*", "$1");
            return token;
        }
        throw new RuntimeException("Failed to get access token from M-Pesa API");
    }
}
