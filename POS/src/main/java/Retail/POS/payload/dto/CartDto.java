package Retail.POS.payload.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CartDto {
    private List<CartItemDto> items;   // each product in the cart
    private Double total;              // total of all items
}

