package Retail.POS.service;

import Retail.POS.exceptions.UserException;
import Retail.POS.models.User;

import java.util.List;

public interface UserService {
    User getUserFromJwtToken(String token) throws UserException;
    User getCurrentUser() throws UserException;
    User getUserById(Long id) throws UserException;
    User getUserByEmail(String email) throws UserException;
    List<User> getAllUsers();
}
