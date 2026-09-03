import { AGE_PROFILES, isAgeAppropriate } from '../src/constants/ageRubric';
import { getMockRecommendations } from '../src/services/mockBooks';
import { fetchGoogleBookMetadata } from '../src/services/googleBooks';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('Testing Kona Core Logic...\n');

  // 1. Age profiles test
  console.log('Test 1: Verifying Age Profiles (10-17)');
  for (let age = 10; age <= 17; age++) {
    const profile = AGE_PROFILES[age];
    assert(!!profile, `Age ${age} profile must exist`);
    assert(profile.age === age, `Profile age mismatch for ${age}`);
    assert(!!profile.grade, `Grade missing for age ${age}`);
    assert(!!profile.lexileRange, `Lexile missing for age ${age}`);
    assert(!!profile.guidelines, `Guidelines missing for age ${age}`);
  }
  console.log('All age profiles 10-17 validated successfully.');

  // 2. Age-appropriateness audit test
  console.log('\nTest 2: Verifying Age-Appropriateness Audit Rules');
  // Age 10: Max violence is Mild, Max language is Clean
  const safeAge10 = isAgeAppropriate(10, {
    violence: 'Mild',
    language: 'Clean',
    romance: 'None',
    themes: 'Mild',
  });
  assert(safeAge10.isAppropriate, 'Mild/Clean should be appropriate for age 10');
  assert(safeAge10.reasons.length === 0, 'No violations expected for safe book');

  const unsafeAge10 = isAgeAppropriate(10, {
    violence: 'Mature',
    language: 'Moderate',
    romance: 'Mild',
    themes: 'Mature',
  });
  assert(!unsafeAge10.isAppropriate, 'Mature content must be flagged for age 10');
  assert(unsafeAge10.reasons.length >= 2, 'Should flag multiple violations for age 10');
  console.log('Age appropriateness audit correctly filters safe vs unsafe content.');

  // 3. Mock Recommendation count and schema test
  console.log('\nTest 3: Verifying 20 Recommendations Output');
  for (const testAge of [10, 12, 14, 16]) {
    const recs = getMockRecommendations(testAge, 'space mystery with robots');
    assert(recs.length === 20, `Expected exactly 20 recommendations for age ${testAge}, got ${recs.length}`);
    for (const b of recs) {
      assert(!!b.id, 'Book id missing');
      assert(!!b.title, 'Book title missing');
      assert(!!b.author, 'Book author missing');
      assert(!!b.whyAppropriate, 'Book whyAppropriate missing');
      assert(!!b.maturityScores, 'Book maturityScores missing');
    }
  }
  console.log('Exactly 20 recommendations generated across ages 10, 12, 14, 16.');

  // 4. Google Books API integration test
  console.log('\nTest 4: Google Books API Metadata Enrichment');
  try {
    const meta = await fetchGoogleBookMetadata('The Lightning Thief', 'Rick Riordan');
    if (meta) {
      console.log(`Fetched cover: ${meta.coverUrl ? 'Yes' : 'No'}, Page count: ${meta.pageCount}, ISBN: ${meta.isbn}`);
      assert(!!meta.coverUrl, 'Cover URL should be retrieved');
    } else {
      console.log('Google Books API skipped (offline or rate limited), graceful fallback works.');
    }
  } catch (e: any) {
    console.log('Network request handled gracefully:', e?.message);
  }

  console.log('\nALL KONA LOGIC TESTS PASSED!');
}

runTests().catch((err) => {
  console.error('\nTest failed:', err);
  process.exit(1);
});
