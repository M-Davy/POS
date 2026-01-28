package Retail.POS.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import Retail.POS.models.Inventory;
import Retail.POS.models.Product;
import Retail.POS.payload.dto.InventoryRequestDto;
import Retail.POS.payload.dto.InventoryResponseDto;
import Retail.POS.repository.InventoryRepository;
import Retail.POS.repository.ProductRepository;
import Retail.POS.service.impl.InventoryServiceImpl;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    private InventoryRequestDto requestDto;
    private Inventory inventory;
    private Product product;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(1L);
        product.setName("Test Product");
        product.setCode("TP001");

        requestDto = new InventoryRequestDto();
        requestDto.setProductId(1L);
        requestDto.setQuantity(100);

        inventory = new Inventory();
        inventory.setId(1L);
        inventory.setProduct(product);
        inventory.setQuantity(100);
        inventory.setLastUpdated(LocalDateTime.now());
    }

    @Test
    void createInventory_ShouldReturnInventoryResponseDto_WhenSuccessful() throws Exception {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryRepository.existsByProduct(product)).thenReturn(false);
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(inventory);

        // Act
        InventoryResponseDto response = inventoryService.createInventory(requestDto);

        // Assert
        assertThat(response).isNotNull();
        verify(productRepository).findById(1L);
        verify(inventoryRepository).save(any(Inventory.class));
    }

    @Test
    void createInventory_ShouldThrowException_WhenProductNotFound() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> inventoryService.createInventory(requestDto))
                .isInstanceOf(Exception.class)
                .hasMessage("Product not found with id: 1");
    }

    @Test
    void createInventory_ShouldThrowException_WhenInventoryAlreadyExists() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryRepository.existsByProduct(product)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> inventoryService.createInventory(requestDto))
                .isInstanceOf(Exception.class)
                .hasMessage("Inventory already exists for product: Test Product");
    }

    @Test
    void updateInventory_ShouldReturnUpdatedInventory_WhenSuccessful() throws Exception {
        // Arrange
        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(inventory));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(inventory);

        // Act
        InventoryResponseDto response = inventoryService.updateInventory(1L, requestDto);

        // Assert
        assertThat(response).isNotNull();
        verify(inventoryRepository).findById(1L);
        verify(inventoryRepository).save(any(Inventory.class));
    }

    @Test
    void updateInventory_ShouldThrowException_WhenInventoryNotFound() {
        // Arrange
        when(inventoryRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> inventoryService.updateInventory(1L, requestDto))
                .isInstanceOf(Exception.class)
                .hasMessage("Inventory not found with id: 1");
    }

    @Test
    void deleteInventory_ShouldDeleteSuccessfully_WhenInventoryExists() throws Exception {
        // Arrange
        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(inventory));

        // Act
        inventoryService.deleteInventory(1L);

        // Assert
        verify(inventoryRepository).delete(inventory);
    }

    @Test
    void deleteInventory_ShouldThrowException_WhenInventoryNotFound() {
        // Arrange
        when(inventoryRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> inventoryService.deleteInventory(1L))
                .isInstanceOf(Exception.class)
                .hasMessage("Inventory not found with id: 1");
    }

    @Test
    void getInventoryById_ShouldReturnInventory_WhenExists() throws Exception {
        // Arrange
        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(inventory));

        // Act
        InventoryResponseDto response = inventoryService.getInventoryById(1L);

        // Assert
        assertThat(response).isNotNull();
        verify(inventoryRepository).findById(1L);
    }

    @Test
    void getInventoryById_ShouldThrowException_WhenNotFound() {
        // Arrange
        when(inventoryRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> inventoryService.getInventoryById(1L))
                .isInstanceOf(Exception.class)
                .hasMessage("Inventory not found with id: 1");
    }

    @Test
    void getInventoryByProductSku_ShouldReturnInventory_WhenExists() throws Exception {
        // Arrange
        when(inventoryRepository.findByProduct_Code("TP001")).thenReturn(Optional.of(inventory));

        // Act
        InventoryResponseDto response = inventoryService.getInventoryByProductSku("TP001");

        // Assert
        assertThat(response).isNotNull();
        verify(inventoryRepository).findByProduct_Code("TP001");
    }

    @Test
    void getInventoryByProductSku_ShouldThrowException_WhenNotFound() {
        // Arrange
        when(inventoryRepository.findByProduct_Code("TP001")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> inventoryService.getInventoryByProductSku("TP001"))
                .isInstanceOf(Exception.class)
                .hasMessage("Inventory not found with code: TP001");
    }

    @Test
    void getAllInventory_ShouldReturnListOfInventories() {
        // Arrange
        List<Inventory> inventories = Arrays.asList(inventory);
        when(inventoryRepository.findAll()).thenReturn(inventories);

        // Act
        List<InventoryResponseDto> response = inventoryService.getAllInventory();

        // Assert
        assertThat(response).hasSize(1);
        verify(inventoryRepository).findAll();
    }
}
