package Retail.POS.controller;

import Retail.POS.service.MpesaAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mpesa")
public class MpesaController {
    @Autowired
    private MpesaAuthService mpesaAuthService;

    @GetMapping("/token")
    public String getMpesaToken() {
        return mpesaAuthService.getAccessToken();
    }
}
