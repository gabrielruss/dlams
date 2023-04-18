package com.dontlookatmystuff.dlams.config;

import com.dontlookatmystuff.dlams.role.Role;
import com.dontlookatmystuff.dlams.role.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class RoleConfig {

    @Bean
    CommandLineRunner roleCommandLineRunner(RoleRepository repository) {
        return args -> {
            Role adminRole = new Role("ROLE_ADMIN");

            repository.saveAll(List.of(adminRole));
        };
    }
}
