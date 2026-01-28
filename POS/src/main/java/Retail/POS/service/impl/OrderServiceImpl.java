package Retail.POS.service.impl;

import Retail.POS.domain.OrderStatus;
import Retail.POS.exceptions.InsufficientStockException;
import Retail.POS.mapper.OrderMapper;
import Retail.POS.models.Inventory;
import Retail.POS.models.Order;
import Retail.POS.models.OrderItem;
import Retail.POS.models.Product;
import Retail.POS.payload.dto.OrderItemRequestDto;
import Retail.POS.payload.dto.OrderRequestDto;
import Retail.POS.payload.dto.OrderResponseDto;
import Retail.POS.repository.InventoryRepository;
import Retail.POS.repository.OrderRepository;
import Retail.POS.repository.ProductRepository;
import Retail.POS.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    public OrderResponseDto createOrder(OrderRequestDto request) {

        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0;

        for (OrderItemRequestDto item : request.getOrderItems()) {

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() ->
                            new RuntimeException("Product not found: " + item.getProductId())
                    );

            Inventory inventory = inventoryRepository.findByProduct(product)
                    .orElseThrow(() ->
                            new RuntimeException("No inventory for product: " + product.getName())
                    );

            if (inventory.getQuantity() < item.getQuantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for " + product.getName() +
                                ". Available: " + inventory.getQuantity()
                );

            }

            inventory.setQuantity(
                    inventory.getQuantity() - item.getQuantity()
            );

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(item.getQuantity())
                    .price(product.getSellingPrice())
                    .build();

            orderItems.add(orderItem);
            total += product.getSellingPrice() * item.getQuantity();
        }

        Order order = Order.builder()
                .orderItems(orderItems)
                .totalAmount(total)
                .build();

        orderItems.forEach(i -> i.setOrder(order));

        Order savedOrder = orderRepository.save(order);

        return OrderMapper.toDto(savedOrder);
    }

    @Override
    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(OrderMapper::toDto)
                .toList();
    }


    @Override
    public List<OrderResponseDto> getOrdersByDate(LocalDate start, LocalDate end) {

        return orderRepository.findByCreatedAtBetween(
                        start.atStartOfDay(),
                        end.atTime(23, 59, 59)
                )
                .stream()
                .map(OrderMapper::toDto)
                .toList();
    }


    @Override
    public Double getTodaySalesTotal() {

        LocalDate today = LocalDate.now();

        return orderRepository.findByCreatedAtBetween(
                        today.atStartOfDay(),
                        today.atTime(23, 59, 59)
                )
                .stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();
    }


    @Override
    public List<OrderResponseDto> getOrdersByStatus(OrderStatus status) {

        return orderRepository.findByStatus(status)
                .stream()
                .map(OrderMapper::toDto)
                .toList();
    }

}
