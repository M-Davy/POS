package Retail.POS.service;

import Retail.POS.models.User;
import Retail.POS.payload.dto.ProductDto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ProductService {

    ProductDto createProduct(ProductDto productDto, User user);
    ProductDto updateProduct(Long id, ProductDto productDto, User user) throws Exception;
    void deleteProduct(Long id, User user) throws Exception;
    List<ProductDto> getAllProducts(User user);
    List<ProductDto> searchByKeyword(String keyword);

    ProductDto uploadProductImage(Long productId, MultipartFile file) throws IOException;
}
