package Retail.POS.controller;

import Retail.POS.payload.dto.CartItemDto;
import Retail.POS.service.ScanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/scan")
@RequiredArgsConstructor
public class ScanController {

    private final ScanService scanService;

    @PostMapping
    public ResponseEntity<CartItemDto> scan(@RequestParam String barcode) {
        CartItemDto item = scanService.handleScan(barcode);
        return ResponseEntity.ok(item);
    }
}
