package Retail.POS.payload.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventoryResponseDto {

    private Long id;
    private ProductDto product;
    private Integer quantity;

}
