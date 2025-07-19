

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

CODE FOR THE LOGIC 
<img width="1039" height="282" alt="image" src="https://github.com/user-attachments/assets/43b0f070-75ea-4421-89d9-5027ba17e677" />


SCREENSHOTS

<img width="1838" height="933" alt="image" src="https://github.com/user-attachments/assets/335b7ade-3581-446b-8a68-c0b5eb27eb4a" />
<img width="814" height="858" alt="image" src="https://github.com/user-attachments/assets/5164ec32-254c-4b8a-80e2-18ccc352ca93" />


