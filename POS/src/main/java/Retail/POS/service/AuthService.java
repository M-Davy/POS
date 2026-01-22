package Retail.POS.service;

import Retail.POS.exceptions.UserException;
import Retail.POS.payload.dto.UserDto;
import Retail.POS.payload.response.AuthResponse;

public interface AuthService {

    AuthResponse signup(UserDto userDto) throws UserException;
    AuthResponse login(UserDto userDto) throws UserException;


}
