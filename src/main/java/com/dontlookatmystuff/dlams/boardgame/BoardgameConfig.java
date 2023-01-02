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
            Boardgame theLegendOfZelda = new Boardgame(
                    "The Legend of Zelda", false, LocalDate.of(2013, Month.JANUARY, 1)
            );

            Boardgame theAdventureOfLink = new Boardgame(
                    "The Adventure of Link", false, LocalDate.of(2013, Month.AUGUST, 10)
            );

            repository.saveAll(List.of(theLegendOfZelda, theAdventureOfLink));
        };
    }
}
