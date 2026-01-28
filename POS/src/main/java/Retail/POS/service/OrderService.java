package Retail.POS.service;

import Retail.POS.domain.OrderStatus;
import Retail.POS.payload.dto.OrderRequestDto;
import Retail.POS.payload.dto.OrderResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface OrderService {

    OrderResponseDto createOrder(OrderRequestDto request);
    List<OrderResponseDto> getAllOrders();
    List<OrderResponseDto> getOrdersByDate(
            LocalDate start,
            LocalDate end
    );
    Double getTodaySalesTotal();
    List<OrderResponseDto> getOrdersByStatus(OrderStatus status);


}
