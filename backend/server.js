const express = require("express");
const multer = require("multer");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });

function getSeatPriority(seatLetter) {
  const letter = seatLetter.toUpperCase();
  if (letter === "A" || letter === "D") return 1;
  if (letter === "B" || letter === "C") return 2;
  return 99;
}

function generateBoardingSequence(cleanedContent) {
  const seatPattern = /([A-D])(\d+)/gi;

  return cleanedContent
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[\s,]+/);
      const id = parseInt(parts[0], 10);
      const seatsStr = parts.slice(1).join(" ");
      const seats = seatsStr.match(seatPattern) || [];

      if (seats.length === 0) return null;

      let bestSortKey = { row: -1, priority: 99 };
      for (const seat of seats) {
        const [, letter, rowStr] = seat.match(/([A-D])(\d+)/i);
        const row = parseInt(rowStr, 10);
        const priority = getSeatPriority(letter);

        if (row > bestSortKey.row) {
          bestSortKey = { row, priority };
        } else if (row === bestSortKey.row && priority < bestSortKey.priority) {
          bestSortKey.priority = priority;
        }
      }
      return { id, sortKey: bestSortKey };
    })
    .filter(Boolean)
    .sort((a, b) => {
      // 1. Sort by row in DESCENDING order (back of bus first).
      if (a.sortKey.row !== b.sortKey.row) {
        return b.sortKey.row - a.sortKey.row;
      }
      // 2. If rows are the same, sort by seat priority in ASCENDING order (window seats first).
      if (a.sortKey.priority !== b.sortKey.priority) {
        return a.sortKey.priority - b.sortKey.priority;
      }
      // 3. If everything else is a tie, sort by booking ID in ASCENDING order.
      return a.id - b.id;
    })
    .map((booking, index) => ({
      seq: index + 1,
      bookingId: booking.id,
    }));
}

app.post("/api/upload", upload.single("bookingsFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ details: "No file uploaded." });
  }

  const fileContent = req.file.buffer.toString("utf8");
  const lines = fileContent
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return res.status(400).json({
      details: "File must contain a header and at least one data row.",
      fileContent,
    });
  }

  const headers = lines[0].split(/[\s,]+/);
  const bookingIdIndex = headers.indexOf("Booking_ID");
  const seatsIndex = headers.indexOf("Seats");

  if (bookingIdIndex === -1 || seatsIndex === -1) {
    return res.status(400).json({
      details: "File must contain 'Booking_ID' and 'Seats' headers.",
      fileContent,
    });
  }

  const cleanedDataLines = [];
  const assignedSeats = new Set();
  const validSeatFormat = /[A-D]\d+/i;
  const numberPattern = /\d+/;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(/[\s,]+/);

    if (parts.length <= Math.max(bookingIdIndex, seatsIndex)) {
      continue;
    }

    const idString = parts[bookingIdIndex];
    const seatsString = parts[seatsIndex];

    const id = parseInt(idString, 10);
    const seats = seatsString.split(/[\s,]+/).filter(Boolean);

    if (isNaN(id) || seats.length === 0) {
      const details = `Line ${
        i + 1
      } has an invalid Booking ID or no seats listed in the correct columns.`;
      return res.status(400).json({ details, fileContent });
    }

    for (const seat of seats) {
      if (!validSeatFormat.test(seat)) {
        const details = `Line ${i + 1} has an invalid seat format: "${seat}".`;
        return res.status(400).json({ details, fileContent });
      }

      const seatNumberMatch = seat.match(numberPattern);
      const seatNumber = parseInt(seatNumberMatch[0], 10);

      if (seatNumber < 1 || seatNumber > 20) {
        const details = `Line ${
          i + 1
        } has an invalid seat number: ${seat}. Seat numbers must be between 1 and 20.`;
        return res.status(400).json({ details, fileContent });
      }

      const normalizedSeat = seat.toUpperCase();
      if (assignedSeats.has(normalizedSeat)) {
        const details = `Duplicate seat assignment found: "${seat}" is assigned more than once.`;
        return res.status(400).json({ details, fileContent });
      }
      assignedSeats.add(normalizedSeat);
    }

    cleanedDataLines.push(`${idString} ${seats.join(" ")}`);
  }

  try {
    const cleanedFileContent = cleanedDataLines.join("\n");
    const sequence = generateBoardingSequence(cleanedFileContent);
    res.json({ sequence, errors: [], fileContent });
  } catch (error) {
    console.error("Error during processing:", error);
    res
      .status(500)
      .json({ details: "An unexpected error occurred.", fileContent });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
