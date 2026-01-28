package Retail.POS.controller;

import Retail.POS.payload.dto.InventoryRequestDto;
import Retail.POS.payload.dto.InventoryResponseDto;
import Retail.POS.payload.response.ApiResponse;
import Retail.POS.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/create")
    public ResponseEntity<InventoryResponseDto> create(
           @Valid @RequestBody InventoryRequestDto requestDto

    ) throws Exception {
        return ResponseEntity.ok(inventoryService.createInventory(requestDto));

    }

    @GetMapping("/id/{id}")
    public ResponseEntity<InventoryResponseDto> getById(
            @PathVariable Long id
    ) throws Exception {
        return ResponseEntity.ok(inventoryService.getInventoryById(id));

    }
    @GetMapping("/sku/{code}")
    public ResponseEntity<InventoryResponseDto> getByCode(
            @PathVariable String code
    ) throws Exception {
        return ResponseEntity.ok(inventoryService.getInventoryByProductSku(code));

    }

    @GetMapping("/all")
    public ResponseEntity<List<InventoryResponseDto>> getAll() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<InventoryResponseDto> update(
            @PathVariable Long id,
            @RequestBody InventoryRequestDto requestDto
    ) throws Exception {
        return ResponseEntity.ok(inventoryService.updateInventory(id, requestDto));

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(
            @PathVariable Long id
    ) throws Exception {
        inventoryService.deleteInventory(id);

        ApiResponse response = new ApiResponse();
        response.setMessage("Inventory deleted successfully");
        return ResponseEntity.ok(response);
    }
}
