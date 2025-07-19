

# Bus Boarding Sequence Generator

This project provides an API to generate an optimal boarding sequence for a single-aisle bus from a booking file.

## Boarding Sequence Logic

The system generates the boarding order based on the **"Back-to-Front, Window-First"** strategy. The goal is to minimize aisle congestion and the time it takes for all passengers to be seated, creating the most efficient boarding process.

The boarding priority is determined by the following rules, in order:

1.  **Row Number (Back-to-Front)**: Passengers with seats in the highest-numbered rows board first. For example, a passenger in Row 20 will board before a passenger in Row 19.

2.  **Seat Type (Window-First)**: If passengers are in the same row, those with window seats (**A** or **D**) will board before passengers with aisle seats (**B** or **C**). This prevents seated aisle passengers from having to get up for window passengers.

3.  **Booking ID (Tie-Breaker)**: If both the row number and seat type priority are the same, the booking with the lower `Booking_ID` will board first to ensure a consistent order.

### Example

Consider these three bookings:
* `Booking 101: Seat B20` (Aisle, Back)
* `Booking 102: Seat A19` (Window, Middle)
* `Booking 103: Seat A20` (Window, Back)

The generated boarding order would be:

| Seq | Booking_ID | Reason                                           |
|:----|:-----------|:-------------------------------------------------|
| 1   | 103        | Highest row (20) and a window seat (highest priority). |
| 2   | 101        | Highest row (20) but an aisle seat (lower priority).   |
| 3   | 102        | Lower row (19).                                  |
