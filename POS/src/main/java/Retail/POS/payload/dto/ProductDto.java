package Retail.POS.payload.dto;

import Retail.POS.domain.ProductType;
import jakarta.persistence.Column;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProductDto {

    private Long id;

    private String name;

    private String code;

    private String description;

    private double markedPrice;
    private double sellingPrice;

    private Double pricePerKg;
    private String image;

    private ProductType type;

//    private Category category;


    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
