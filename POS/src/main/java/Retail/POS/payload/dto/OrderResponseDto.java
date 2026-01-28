package Retail.POS.payload.dto;

import Retail.POS.domain.PaymentMethod;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponseDto{

    private Long id;
    private List<OrderItemResponseDto> orderItems;
    private Double totalAmount;
    private String status;
    private PaymentMethod paymentMethod;
    private LocalDateTime createdAt;
}
