package Retail.POS.entity;

import lombok.Data;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
public class Sale {
    @Id
    @GeneratedValue
    private Long id;
    private String barcodeData, plu, productName;
    private BigDecimal weight, unitPrice, totalAmount;
    private String phone, cashierUsername;
    private LocalDateTime createdAt = LocalDateTime.now();
}