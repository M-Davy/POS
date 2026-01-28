package Retail.POS.service;

import Retail.POS.payload.dto.CartItemDto;

public interface ScanService {

    CartItemDto handleScan(String barcode);
}
