package Retail.POS.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.core.Authentication;
import Retail.POS.entity.Sale;
import Retail.POS.service.BarcodeService;
import org.springframework.beans.factory.annotation.Autowired;

@Controller
public class CashierController {
    @Autowired
    private BarcodeService barcodeService;
    
    @GetMapping("/cashier")
    public String cashier(Model model) {
        model.addAttribute("sale", new Sale());
        return "cashier";  // Thymeleaf template
    }
    
    @PostMapping("/scan")
    public String scanBarcode(@RequestParam String barcode, 
                              Model model, Authentication auth) {
        Sale sale = barcodeService.decodeScaleBarcode(barcode);
        sale.setCashierUsername(auth.getName());
        model.addAttribute("sale", sale);
        return "cashier";
    }
}
