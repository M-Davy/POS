package Retail.POS.service;

import Retail.POS.exceptions.UserException;
import Retail.POS.payload.dto.UserDto;
import Retail.POS.payload.response.ApiResponse;

public interface AuthService {

    ApiResponse signup(UserDto userDto) throws UserException;
    ApiResponse login(UserDto userDto) throws UserException;


}
