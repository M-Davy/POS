package Retail.POS.service.impl;

import Retail.POS.domain.ProductType;
import Retail.POS.models.Product;
import Retail.POS.repository.ProductRepository;
import Retail.POS.payload.dto.CartItemDto;
import Retail.POS.service.ScanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScanServiceImpl implements ScanService {

    private final ProductRepository productRepository;

    @Override
    public CartItemDto handleScan(String barcode) {

        if (barcode.startsWith("20")) {
            // weighed item
            return handleWeighedBarcode(barcode);
        } else {
            // fixed item
            return handleFixedBarcode(barcode);
        }
    }

    private CartItemDto handleWeighedBarcode(String barcode) {
        String plu = barcode.substring(2, 6);
        double weightKg = Integer.parseInt(barcode.substring(6, 11)) / 1000.0;

        Product product = productRepository.findByCode(plu)
                .orElseThrow(() -> new RuntimeException("Unknown PLU"));

        if (product.getType() != ProductType.WEIGHED) {
            throw new RuntimeException("Barcode indicates weighed item but product is fixed");
        }

        double total = weightKg * product.getPricePerKg();

        return CartItemDto.builder()
                .productName(product.getName())
                .unitPrice(product.getPricePerKg())
                .quantity(weightKg)
                .total(total)
                .build();
    }

    private CartItemDto handleFixedBarcode(String barcode) {

        Product product = productRepository.findByCode(barcode)
                .orElseThrow(() -> new RuntimeException("Unknown product barcode"));

        if (product.getType() != ProductType.FIXED) {
            throw new RuntimeException("Product is fixed type, but barcode indicates otherwise");
        }

        double total = product.getSellingPrice();

        return CartItemDto.builder()
                .productName(product.getName())
                .unitPrice(product.getSellingPrice())
                .quantity(1.0)
                .total(total)
                .build();
    }
}
