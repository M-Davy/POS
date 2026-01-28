package Retail.POS.mapper;

import Retail.POS.models.Order;
import Retail.POS.payload.dto.OrderItemResponseDto;
import Retail.POS.payload.dto.OrderResponseDto;

public class OrderMapper {

    public static OrderResponseDto toDto(Order order) {
        return OrderResponseDto.builder()
                .id(order.getId())
                .items(
                        order.getOrderItems().stream()
                                .map(item -> OrderItemResponseDto.builder()
                                        .productId(item.getProduct().getId())
                                        .productName(item.getProduct().getName())
                                        .quantity(item.getQuantity())
                                        .unitPrice(item.getPrice())
                                        .subtotal(item.getPrice() * item.getQuantity())
                                        .build()
                                ).toList()
                )
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
