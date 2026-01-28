package Retail.POS.repository;

import Retail.POS.domain.OrderStatus;
import Retail.POS.models.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );

    List<Order> findByStatus(OrderStatus status);

}
