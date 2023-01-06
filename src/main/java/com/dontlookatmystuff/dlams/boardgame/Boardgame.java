package com.dontlookatmystuff.dlams.boardgame;

import com.dontlookatmystuff.dlams.collectable.Collectable;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.Period;

@Entity
@Table
public class Boardgame extends Collectable {

    private LocalDate dateAcquired;
    private LocalDate dateLastPlayed;
    @Transient
    private boolean isOwned;
    @Transient
    private String timeSinceLastPlayed;

    public Boardgame() {
    }

    public Boardgame(String name, boolean isOwned) {
        super(name);
        this.isOwned = isOwned;
    }

    public Boardgame(Long id, String name, LocalDate dateAcquired) {
        super(id, name);
        this.dateAcquired = dateAcquired;
    }

    public Boardgame(String name, LocalDate dateAcquired) {
        super(name);
        this.dateAcquired = dateAcquired;
    }

    public Boardgame(Long id, String name, LocalDate dateAcquired, LocalDate dateLastPlayed) {
        super(id, name);
        this.dateAcquired = dateAcquired;
        this.dateLastPlayed = dateLastPlayed;
    }

    public Boardgame(String name, LocalDate dateAcquired, LocalDate dateLastPlayed) {
        super(name);
        this.dateAcquired = dateAcquired;
        this.dateLastPlayed = dateLastPlayed;
    }

    public LocalDate getDateAcquired() {
        return dateAcquired;
    }

    public void setDateAcquired(LocalDate dateAcquired) {
        this.dateAcquired = dateAcquired;
    }

    public LocalDate getDateLastPlayed() {
        return dateLastPlayed;
    }

    public void setDateLastPlayed(LocalDate dateLastPlayed) {
        this.dateLastPlayed = dateLastPlayed;
    }

    public String getTimeSinceLastPlayed() {
        if (this.dateLastPlayed == null) {
            return null;
        }

        Period period = Period.between(this.dateLastPlayed, LocalDate.now());

        String timeToDisplay = "";

        int years = period.getYears();
        int months = period.getMonths();
        int days = period.getDays();

        if(years != 0) {
            timeToDisplay = timeToDisplay + years + " years";
        }

        if(months != 0) {
            timeToDisplay = timeToDisplay + " " + months + " months";
        }

        if(days != 0) {
            timeToDisplay = timeToDisplay + " " + days + " days";
        }

        return timeToDisplay;
    }

    public boolean getIsOwned() {
        return this.dateAcquired != null;
    }
}
