package com.dontlookatmystuff.dlams.config;

import com.dontlookatmystuff.dlams.boardgame.Boardgame;
import com.dontlookatmystuff.dlams.boardgame.BoardgameRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;

@Configuration
public class BoardgameConfig {

    @Bean
    CommandLineRunner boardgameCommandLineRunner(BoardgameRepository repository) {
        return args -> {
            Boardgame machiKoro = new Boardgame(
                    "Machi Koro", LocalDate.of(2020, Month.JANUARY, 1), LocalDate.of(2021, Month.AUGUST, 12)
            );

            Boardgame queendomino = new Boardgame(
                    "Queendomino", LocalDate.of(2020, Month.AUGUST, 10)
            );

            Boardgame onMars = new Boardgame(
                    "On Mars"
            );

            repository.saveAll(List.of(machiKoro, queendomino, onMars));
        };
    }
}
