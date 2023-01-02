package com.dontlookatmystuff.dlams.boardgame;

import com.dontlookatmystuff.dlams.collectable.Collectable;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table
public class Boardgame extends Collectable {

    private boolean isOwned;
    private LocalDate dateAcquired;

    public Boardgame() {
    }

    public Boardgame(Long id, String name, boolean isOwned, LocalDate dateAcquired) {
        super(id, name);
        this.isOwned = isOwned;
        this.dateAcquired = dateAcquired;
    }

    public Boardgame(String name, boolean isOwned, LocalDate dateAcquired) {
        super(name);
        this.isOwned = isOwned;
        this.dateAcquired = dateAcquired;
    }

    public boolean isOwned() {
        return isOwned;
    }

    public void setOwned(boolean owned) {
        isOwned = owned;
    }

    public LocalDate getDateAcquired() {
        return dateAcquired;
    }

    public void setDateAcquired(LocalDate dateAcquired) {
        this.dateAcquired = dateAcquired;
    }

    @Override
    public String toString() {
        return "Boardgame{" +
                "isOwned=" + isOwned +
                ", dateAcquired=" + dateAcquired +
                '}';
    }
}
