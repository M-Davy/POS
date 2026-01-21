package Retail.POS.service;

import org.springframework.stereotype.Service;
import Retail.POS.entity.Sale;
import java.math.BigDecimal;

@Service
public class BarcodeService {
    public Sale decodeScaleBarcode(String barcode) {
        Sale sale = new Sale();
        sale.setBarcodeData(barcode);
        sale.setPlu(barcode.substring(0, 4));           // "4001"
        sale.setWeight(new BigDecimal(barcode.substring(4, 9)).movePointLeft(3));  // 1.230kg
        sale.setTotalAmount(new BigDecimal(barcode.substring(9, 14)).movePointLeft(2)); // KSh 123
        // Scale already knows product name - just map PLU
        sale.setProductName(mapPluToName(sale.getPlu()));
        return sale;
    }
    
    private String mapPluToName(String plu) {
        return switch(plu) {
            case "4001" -> "Onions";
            case "4012" -> "Kales";
            case "4023" -> "Tomatoes";
            default -> "Produce";
        };
    }
}
