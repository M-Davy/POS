package Retail.POS.payload.dto;

import Retail.POS.domain.PaymentMethod;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class OrderRequestDto {

    private PaymentMethod paymentMethod;

    private List<OrderItemRequestDto> orderItems;
}
