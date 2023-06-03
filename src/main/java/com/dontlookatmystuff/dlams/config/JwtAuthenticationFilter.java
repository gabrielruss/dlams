package com.dontlookatmystuff.dlams.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
          @NonNull HttpServletRequest request,
          @NonNull HttpServletResponse response,
          @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        final String authHeaderPrefix = "Bearer ";

        if(authHeader == null || !authHeader.startsWith(authHeaderPrefix)) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(authHeaderPrefix.length());

        userEmail = jwtService.extractUsername(jwt);

//        check in the Spring's Security Context to see if the user is already authenticated
        boolean userIsAuthenticated = SecurityContextHolder.getContext().getAuthentication() != null;

//        if the user email is present, and the user isn't authenticated
        if(userEmail != null && !userIsAuthenticated) {
//            load in the user details from our user details service
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

//            if the user details has a valid token
            if(jwtService.isTokenValid(jwt, userDetails)) {

//                create the token
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

//                update the auth token with details from our request
                authenticationToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

//                set the loaded up auth token to the Spring Security Context
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }

//            otherwise, just filter out the request I think?
            filterChain.doFilter(request, response);
        }
    }
}
