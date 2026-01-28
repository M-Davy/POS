package Retail.POS.mapper;

import Retail.POS.models.Inventory;
import Retail.POS.models.Product;
import Retail.POS.payload.dto.InventoryDto;
import Retail.POS.payload.dto.InventoryResponseDto;

public class InventoryMapper {

    static InventoryDto toDto(Inventory inventory) {

        return InventoryDto.builder().
                id(inventory.getId()).
                productId(inventory.getProduct().getId()).
                product(ProductMapper.toDto(inventory.getProduct())).
                quantity(inventory.getQuantity()).
                build();
    }

    public static Inventory toEntity(InventoryDto inventoryDto, Product product) {

        return Inventory.builder().
                product(product).
                quantity(inventoryDto.getQuantity()).
                build();




    }

    public static InventoryResponseDto toResponseDto(Inventory inventory) {
        return InventoryResponseDto.builder().
                id(inventory.getId()).
                product(ProductMapper.toDto(inventory.getProduct())).
                quantity(inventory.getQuantity()).
                build();




    }
}
