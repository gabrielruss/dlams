package com.dontlookatmystuff.dlams.auth;

import com.dontlookatmystuff.dlams.config.JwtService;
import com.dontlookatmystuff.dlams.user.Role;
import com.dontlookatmystuff.dlams.user.User;
import com.dontlookatmystuff.dlams.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse signUp(SignUpRequest signUpRequest) {
        User newUser = User.builder()
                .firstName(signUpRequest.getFirstName())
                .lastName(signUpRequest.getLastName())
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(newUser);

        String jwtToken = jwtService.generateToken(newUser);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse signIn(SignInRequest signInRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        signInRequest.getEmail(),
                        signInRequest.getPassword()
                )
        );

//        if the code gets here, that means the user exists
        User existingUser = userRepository.findByEmail(signInRequest.getEmail())
                .orElseThrow();

        String jwtToken = jwtService.generateToken(existingUser);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }
}
