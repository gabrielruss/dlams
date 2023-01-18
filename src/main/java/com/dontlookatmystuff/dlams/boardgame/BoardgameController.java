package com.dontlookatmystuff.dlams.boardgame;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "api/v1/boardgame")
public class BoardgameController {

    private final BoardgameService boardgameService;

    @Autowired
    public BoardgameController(BoardgameService boardgameService) {
        this.boardgameService = boardgameService;
    }

    @GetMapping
    public List<Boardgame> getBoardgames() {
        return boardgameService.getBoardgames();
    }

    @PostMapping
    public void addNewBoardgame(@RequestBody Boardgame boardgame) {
        boardgameService.addBoardgame(boardgame);
    }

    @DeleteMapping(path = "{boardgameId}")
    public void deleteBoardgame(@PathVariable("boardgameId") Long boardgameId) {
        boardgameService.deleteBoardgame(boardgameId);
    }

    @PutMapping(path = "{boardgameId}")
    public void updateBoardgame(@PathVariable("boardgameId") Long boardgameId, @RequestParam(required = false) String name, @RequestParam(required = false) String dateAcquired) {
        boardgameService.updateBoardgame(boardgameId, name, dateAcquired);
    }
}
