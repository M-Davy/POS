package Retail.POS.payload.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryRequestDto {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull
    @Min(0)
    private int quantity;
}
