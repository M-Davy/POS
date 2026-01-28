package Retail.POS.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;

import java.util.Collections;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import Retail.POS.config.JwtProvider;
import Retail.POS.domain.UserRole;
import Retail.POS.exceptions.UserException;
import Retail.POS.models.User;
import Retail.POS.payload.dto.UserDto;
import Retail.POS.payload.response.ApiResponse;
import Retail.POS.repository.UserRepository;
import Retail.POS.service.impl.AuthServiceImpl;
import Retail.POS.service.impl.CustomUserImplementation;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtProvider jwtProvider;

    @Mock
    private CustomUserImplementation customUserImplementation;

    @InjectMocks
    private AuthServiceImpl authService;

    private UserDto userDto;
    private User user;

    @BeforeEach
    void setUp() {
        userDto = new UserDto();
        userDto.setEmail("test@example.com");
        userDto.setFullName("Test User");
        userDto.setPhone("1234567890");
        userDto.setPassword("password");
        userDto.setRole(UserRole.ROLE_USER);

        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setFullName("Test User");
        user.setPhone("1234567890");
        user.setPassword("encodedPassword");
        user.setRole(UserRole.ROLE_USER);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setLastLogin(LocalDateTime.now());
    }

    @Test
    void signup_ShouldReturnApiResponse_WhenSuccessful() throws UserException {
        when(userRepository.findByEmail(userDto.getEmail())).thenReturn(null);
        when(passwordEncoder.encode(userDto.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtProvider.generateToken(any(Authentication.class))).thenReturn("jwtToken");

        ApiResponse response = authService.signup(userDto);

        assertThat(response.getMessage()).isEqualTo("Successfully registered");
        assertThat(response.getJwt()).isEqualTo("jwtToken");
        assertThat(response.getUser()).isNotNull();
        verify(userRepository).save(any(User.class));
        verify(jwtProvider).generateToken(any(Authentication.class));
    }

    @Test
    void signup_ShouldThrowUserException_WhenEmailAlreadyExists() {
        when(userRepository.findByEmail(userDto.getEmail())).thenReturn(user);

        assertThatThrownBy(() -> authService.signup(userDto))
                .isInstanceOf(UserException.class)
                .hasMessage("User with email test@example.com already exists");
    }

    @Test
    void signup_ShouldThrowUserException_WhenRoleIsAdmin() {
        userDto.setRole(UserRole.ROLE_ADMIN);

        // Act & Assert
        assertThatThrownBy(() -> authService.signup(userDto))
                .isInstanceOf(UserException.class)
                .hasMessage("Cannot register with ADMIN role");
    }

    @Test
void login_ShouldReturnApiResponse_WhenSuccessful() throws UserException {
    // Arrange
    UserDetails userDetails = mock(UserDetails.class);
    doReturn("encodedPassword").when(userDetails).getPassword();
    doReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
            .when(userDetails).getAuthorities();

    when(customUserImplementation.loadUserByUsername(userDto.getEmail())).thenReturn(userDetails);
    when(passwordEncoder.matches(userDto.getPassword(), userDetails.getPassword())).thenReturn(true);
    when(userRepository.findByEmail(userDto.getEmail())).thenReturn(user);
    when(jwtProvider.generateToken(any(Authentication.class))).thenReturn("jwtToken");

    // Act
    ApiResponse response = authService.login(userDto);

    // Assert
    assertThat(response.getMessage()).isEqualTo("Login Successful");
    assertThat(response.getJwt()).isEqualTo("jwtToken");
    assertThat(response.getUser()).isNotNull();
}

    
    @Test
    void login_ShouldThrowUserException_WhenUserNotFound() {
        // Arrange
        when(customUserImplementation.loadUserByUsername(userDto.getEmail())).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(userDto))
                .isInstanceOf(UserException.class)
                .hasMessage("User with email test@example.com not found");
    }

    @Test
    void login_ShouldThrowUserException_WhenInvalidPassword() {
        // Arrange
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getPassword()).thenReturn("encodedPassword");

        when(customUserImplementation.loadUserByUsername(userDto.getEmail())).thenReturn(userDetails);
        when(passwordEncoder.matches(userDto.getPassword(), userDetails.getPassword())).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(userDto))
                .isInstanceOf(UserException.class)
                .hasMessage("Invalid password");
    }
}
