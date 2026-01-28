package Retail.POS.payload.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartItemDto {
    private String productName;
    private Double unitPrice;  // per kg or per unit
    private Double quantity;   // 1 for fixed items, kg for weighed
    private Double total;      // calculated as unitPrice * quantity
}