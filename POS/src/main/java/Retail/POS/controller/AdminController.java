package Retail.POS.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import Retail.POS.repository.SaleRepository;

@Controller
public class AdminController {
    @Autowired
    private SaleRepository saleRepo;

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminDashboard(Model model) {
        model.addAttribute("todaySales", saleRepo.findTodaySales());
        model.addAttribute("totalToday", saleRepo.totalToday());
        return "admin/dashboard";
    }
}
