package Retail.POS.payload.dto;

import Retail.POS.models.Product;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InventoryDto {

    private Long id;


    private ProductDto product;
    private Long productId;


    private Integer quantity;

    private LocalDateTime lastUpdated;
}
