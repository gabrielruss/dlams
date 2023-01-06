package com.dontlookatmystuff.dlams.boardgame;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    public void addNewBoardgame(Boardgame boardgame) {
        Optional<Boardgame> bg = boardgameRepository.findBoardgameByName(boardgame.getName());

        if (bg.isPresent()) {
            throw new IllegalStateException("Boardgame with this name already exists.");
        }

        boardgameRepository.save(boardgame);
    }
}
