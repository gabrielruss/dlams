package com.dontlookatmystuff.dlams.boardgame;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
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

    public void addBoardgame(Boardgame boardgame) {
        Optional<Boardgame> bg = boardgameRepository.findBoardgameByName(boardgame.getName());

        if (bg.isPresent()) {
            throw new IllegalStateException("Boardgame with this name already exists.");
        }

        boardgameRepository.save(boardgame);
    }

    public void deleteBoardgame(Long boardgameId) {
       boolean exists = boardgameRepository.existsById(boardgameId);

       if(!exists) {
           throw new IllegalStateException("Boardgame with id " + boardgameId + " does not exist.");
       }

       boardgameRepository.deleteById(boardgameId);
    }

    @Transactional
    public void updateBoardgame(Long boardgameId, String name, String dateAcquired) {
        Boardgame bg = boardgameRepository.findById(boardgameId).orElseThrow(() -> new IllegalStateException("Boardgame with id " + boardgameId + " does not exist."));

        if(name != null && name.length() > 0 && !Objects.equals(bg.getName(), name)) {
            bg.setName(name);
        }

        LocalDate convertedDateAcquired = LocalDate.parse(dateAcquired);

        if(convertedDateAcquired != null && !Objects.equals(bg.getDateAcquired(), convertedDateAcquired)) {
            bg.setDateAcquired(convertedDateAcquired);
        }


    }
}
