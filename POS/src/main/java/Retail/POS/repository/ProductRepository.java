package Retail.POS.repository;

import Retail.POS.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query(
            "SELECT p FROM Product p"+
                    " WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
                    " OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))"+
                    " OR LOWER(p.code) LIKE LOWER(CONCAT('%', :query, '%'))"
    )
    List<Product> searchByKeyword(@Param("query") String keyword);

    Optional<Product> findByCode(String code);
}
