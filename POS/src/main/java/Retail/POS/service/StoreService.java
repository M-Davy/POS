package Retail.POS.service;

import Retail.POS.models.User;
import Retail.POS.payload.dto.StoreDto;

public interface StoreService {

    StoreDto createStore(StoreDto storeDto, User user);
    StoreDto updateStore(StoreDto storeDto, User user);
}
