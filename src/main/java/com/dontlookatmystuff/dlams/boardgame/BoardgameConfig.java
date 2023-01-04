package com.dontlookatmystuff.dlams.boardgame;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;

@Configuration
public class BoardgameConfig {

    @Bean
    CommandLineRunner commandLineRunner(BoardgameRepository repository) {
        return args -> {
            Boardgame machiKoro = new Boardgame(
                    "Machi Koro", true, LocalDate.of(2020, Month.JANUARY, 1), LocalDate.of(2021, Month.AUGUST, 12)
            );

            Boardgame queendomino = new Boardgame(
                    "Queendomino", true, LocalDate.of(2020, Month.AUGUST, 10)
            );

            repository.saveAll(List.of(machiKoro, queendomino));
        };
    }
}
