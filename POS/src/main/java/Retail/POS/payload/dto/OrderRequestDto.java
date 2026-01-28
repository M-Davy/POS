package Retail.POS.payload.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class OrderRequestDto {

    private List<OrderItemRequestDto> orderItems;
}
