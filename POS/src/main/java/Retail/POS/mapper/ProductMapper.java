package Retail.POS.mapper;

import Retail.POS.models.Product;
import Retail.POS.payload.dto.ProductDto;

public class ProductMapper {


    public static ProductDto toDto(Product product) {

        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .code(product.getCode())
                .description(product.getDescription())
                .sellingPrice(product.getSellingPrice())
                .image(product.getImage())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();

    }

    public static Product toEntity(ProductDto productDto) {
        return Product.builder()
                .name(productDto.getName())
                .code(productDto.getCode())
                .description(productDto.getDescription())
                .sellingPrice(productDto.getSellingPrice())
                .image(productDto.getImage())
                .build();
    }
}

