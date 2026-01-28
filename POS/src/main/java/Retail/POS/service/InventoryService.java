package Retail.POS.service;

import Retail.POS.payload.dto.InventoryDto;
import Retail.POS.payload.dto.InventoryRequestDto;
import Retail.POS.payload.dto.InventoryResponseDto;

import java.util.List;

public interface InventoryService {

    InventoryResponseDto createInventory(InventoryRequestDto request) throws Exception;

    InventoryResponseDto updateInventory(Long id, InventoryRequestDto request) throws Exception;

    void deleteInventory(Long id) throws Exception;

    InventoryResponseDto getInventoryById(Long id) throws Exception;

    InventoryResponseDto getInventoryByProductSku(String sku) throws Exception;

    List<InventoryResponseDto> getAllInventory();
}

