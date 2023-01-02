package com.dontlookatmystuff.dlams.boardgame;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
