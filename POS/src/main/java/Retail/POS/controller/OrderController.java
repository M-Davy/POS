package Retail.POS.controller;

import Retail.POS.domain.OrderStatus;
import Retail.POS.payload.dto.OrderRequestDto;
import Retail.POS.payload.dto.OrderResponseDto;
import Retail.POS.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(
            @RequestBody OrderRequestDto request
    ) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/by-date")
    public ResponseEntity<List<OrderResponseDto>> getOrdersByDate(
            @RequestParam LocalDate start,
            @RequestParam LocalDate end
    ) {
        return ResponseEntity.ok(
                orderService.getOrdersByDate(start, end)
        );
    }

    @GetMapping("/today/total")
    public ResponseEntity<Double> getTodaySalesTotal() {
        return ResponseEntity.ok(orderService.getTodaySalesTotal());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponseDto>> getOrdersByStatus(
            @PathVariable OrderStatus status
    ) {
        return ResponseEntity.ok(
                orderService.getOrdersByStatus(status)
        );
    }
}
