package com.portlogistics.model;

public final class Ship {
    private final int id;
    private final String name;
    private final String imo;
    private final int capacityTeu;
    private final String status;

    public Ship(int id, String name, String imo, int capacityTeu, String status) {
        this.id = id;
        this.name = name;
        this.imo = imo;
        this.capacityTeu = capacityTeu;
        this.status = status;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getImo() {
        return imo;
    }

    public int getCapacityTeu() {
        return capacityTeu;
    }

    public String getStatus() {
        return status;
    }

    public Ship withStatus(String newStatus) {
        return new Ship(id, name, imo, capacityTeu, newStatus);
    }

    @Override
    public String toString() {
        return "Ship{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", imo='" + imo + '\'' +
                ", capacityTeu=" + capacityTeu +
                ", status='" + status + '\'' +
                '}';
    }
}
