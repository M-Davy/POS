package Retail.POS.payload.dto;


import Retail.POS.models.User;
import jakarta.persistence.Column;
import jakarta.persistence.OneToOne;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StoreDto {

    private Long id;

    private String brandName;


    private UserDto storeOwner;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String description;


}
