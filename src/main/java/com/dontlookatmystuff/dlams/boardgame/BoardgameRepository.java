package com.dontlookatmystuff.dlams.boardgame;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BoardgameRepository extends JpaRepository<Boardgame, Long> {

}
