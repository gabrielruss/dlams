package com.dontlookatmystuff.dlams.boardgame;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoardgameRepository extends JpaRepository<Boardgame, Long> {

    Optional<Boardgame> findBoardgameByName(String name);
}
