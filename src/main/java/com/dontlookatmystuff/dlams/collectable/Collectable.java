package com.dontlookatmystuff.dlams.collectable;

import jakarta.persistence.*;

@MappedSuperclass
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public abstract class Collectable {
    @Id
    @SequenceGenerator(
            name = "collectable_sequence",
            sequenceName = "collectable_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "collectable_sequence"
    )
    private Long id;
    private String name;

    public Collectable() {
    }

    public Collectable(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    protected Collectable(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "Collectable{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}
