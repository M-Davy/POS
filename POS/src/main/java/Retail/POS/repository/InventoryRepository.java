package Retail.POS.repository;

import Retail.POS.models.Inventory;
import Retail.POS.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findByProductId(Long productId);
    Optional<Inventory> findByProduct_Code(String productCode);
    List<Inventory> findAll();
    boolean existsByProduct(Product product);



    Optional<Inventory> findByProduct(Product product);
}
