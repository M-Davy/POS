package Retail.POS.controller;


import Retail.POS.exceptions.UserException;
import Retail.POS.payload.dto.UserDto;
import Retail.POS.payload.response.ApiResponse;
import Retail.POS.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;


    @PostMapping("/signup")
    public ResponseEntity<ApiResponse> signup(
            @RequestBody UserDto userDto) throws UserException {


        return ResponseEntity.ok(authService.signup(userDto));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(
            @RequestBody UserDto userDto) throws UserException {

        return ResponseEntity.ok(authService.login(userDto));
    }


}
