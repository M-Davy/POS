package Retail.POS.payload.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderDto {

    private Long id;
    private Double totalAmount;
    private LocalDateTime createdAt;
    private List<OrderItemRequestDto> orderItems;

}
