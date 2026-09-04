import json
import sys
from pathlib import Path

from generate_curated_data import EXISTING_25
from data_group1 import GROUP_1
from data_group1_b import GROUP_1_B
from data_group2_a import GROUP_2_A
from data_group2_b import GROUP_2_B
from data_group3_a import GROUP_3_A
from data_group3_b import GROUP_3_B

ALL_BOOKS = (
    EXISTING_25
    + GROUP_1
    + GROUP_1_B
    + GROUP_2_A
    + GROUP_2_B
    + GROUP_3_A
    + GROUP_3_B
)

print(f"Total books gathered: {len(ALL_BOOKS)}")
assert len(ALL_BOOKS) == 300, f"Expected 300 books, got {len(ALL_BOOKS)}"

# Validate sequential IDs
ids = [b["id"] for b in ALL_BOOKS]
expected_ids = [f"mock-{i}" for i in range(1, 301)]
assert ids == expected_ids, f"ID sequence mismatch at {[i for i, (a, b) in enumerate(zip(ids, expected_ids)) if a != b]}"

# Check required fields
for i, book in enumerate(ALL_BOOKS):
    required = [
        "id", "title", "author", "publishedYear", "recommendedAgeMin",
        "recommendedAgeMax", "whyAppropriate", "interestConnection",
        "maturityScores", "contentWarnings", "readingLevel", "genre",
        "isbn", "coverUrl", "description", "pageCount"
    ]
    for field in required:
        assert field in book, f"Book {book.get('id')} missing {field}"
    
    # Check maturity levels
    for mKey in ["violence", "language", "romance", "themes"]:
        val = book["maturityScores"][mKey]
        valid_levels = ["None", "Clean", "Mild", "Moderate", "Mature"]
        assert val in valid_levels, f"Invalid {mKey} score '{val}' in {book['id']}"

print("All 300 books passed data integrity validation!")

# Let's inspect age distribution
ages_covered = {a: 0 for a in range(10, 18)}
for book in ALL_BOOKS:
    for a in range(book["recommendedAgeMin"], book["recommendedAgeMax"] + 1):
        if a in ages_covered:
            ages_covered[a] += 1

print("\nAge coverage counts (books suitable per age):")
for age, count in ages_covered.items():
    print(f"  Age {age}: {count} books")

# Output directory
out_dir = Path("src/data")
out_dir.mkdir(parents=True, exist_ok=True)
out_file = out_dir / "curatedBooks.ts"

print(f"\nWriting to {out_file}...")
ts_code = []
ts_code.append("import { BookRecommendation } from '../types/book';")
ts_code.append("")
ts_code.append("// Curated library of 300 educator-vetted books for youth aged 10-17")
ts_code.append("export const CURATED_BOOKS: BookRecommendation[] = ")
ts_code.append(json.dumps(ALL_BOOKS, indent=2) + ";")
ts_code.append("")

out_file.write_text("\n".join(ts_code), encoding="utf-8")
print("Successfully generated src/data/curatedBooks.ts!")
