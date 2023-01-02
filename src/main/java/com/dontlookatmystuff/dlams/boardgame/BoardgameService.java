package com.dontlookatmystuff.dlams.boardgame;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BoardgameService {

    private final BoardgameRepository boardgameRepository;

    @Autowired
    public BoardgameService(BoardgameRepository boardgameRepository) {
        this.boardgameRepository = boardgameRepository;
    }

    public List<Boardgame> getBoardgames() {
        return boardgameRepository.findAll();
    }
}
