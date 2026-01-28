package Retail.POS.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopProductDto {
    private String name;
    private Long quantitySold;
    private Double revenue;
}
