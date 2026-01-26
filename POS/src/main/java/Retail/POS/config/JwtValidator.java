package Retail.POS.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.List;
import org.springframework.util.AntPathMatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component

public class JwtValidator extends OncePerRequestFilter {

        private static final String[] PUBLIC_ENDPOINTS = {"/api/mpesa/**"};
        private static final AntPathMatcher pathMatcher = new AntPathMatcher();
        private static final Logger logger = LoggerFactory.getLogger(JwtValidator.class);

        @Override
        protected void doFilterInternal(
                        HttpServletRequest request,
                        HttpServletResponse response,
                        FilterChain filterChain) throws ServletException, IOException {

                String path = request.getRequestURI();
                boolean excluded = false;
                for (String pattern : PUBLIC_ENDPOINTS) {
                        if (pathMatcher.match(pattern, path)) {
                                excluded = true;
                                break;
                        }
                }
                logger.info("JwtValidator: path='{}', excludedFromJwtValidation={}", path, excluded);
                if (excluded) {
                        filterChain.doFilter(request, response);
                        return;
                }

                String jwt = request.getHeader(JwtConstant.JWT_HEADER);

                if(jwt!=null){
                        jwt = jwt.substring(7);

                        try{
                                SecretKey key = Keys.hmacShaKeyFor(JwtConstant.JWT_SECRET.getBytes());
                                Claims claims = Jwts.parser()
                                                .setSigningKey(key)
                                                .parseClaimsJws(jwt)
                                                .getBody();

                                String email = String.valueOf(claims.get("email"));
                                String authorities = String.valueOf(claims.get("authorities"));

                                List<GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList(authorities);
                                Authentication auth = new UsernamePasswordAuthenticationToken(email, null, auths);
                                SecurityContextHolder.getContext().setAuthentication(auth);

                        } catch (Exception e) {
                                throw new BadCredentialsException("Invalid credentials");
                        }

                }
                filterChain.doFilter(request, response);
        }
}
/*
*
* JWT token (from client)
        ↓
JwtValidator parses token
        ↓
Claims extracted → email + roles
        ↓
Roles converted → List<GrantedAuthority>
        ↓
Create Authentication object (UsernamePasswordAuthenticationToken)
        ↓
Put Authentication into SecurityContext
        ↓
Spring Security uses this context for authorization checks
*
*
*
*
* */