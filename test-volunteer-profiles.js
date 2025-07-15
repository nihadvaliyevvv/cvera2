// LinkedIn profiles that might have volunteer experience
console.log('LinkedIn profiles potentially with volunteer experience:');

const profilesWithVolunteer = [
  {
    name: 'Bill Gates',
    url: 'https://www.linkedin.com/in/williamhgates',
    note: 'Philanthropist - likely has volunteer/charitable work'
  },
  {
    name: 'Melinda French Gates',
    url: 'https://www.linkedin.com/in/melindafrenchgates',
    note: 'Philanthropist - likely has volunteer work'
  },
  {
    name: 'Warren Buffett',
    url: 'https://www.linkedin.com/in/warrenbuffett',
    note: 'Investor and philanthropist'
  },
  {
    name: 'Oprah Winfrey',
    url: 'https://www.linkedin.com/in/oprahwinfrey',
    note: 'Media personality known for charitable work'
  },
  {
    name: 'Reid Hoffman',
    url: 'https://www.linkedin.com/in/reidhoffman',
    note: 'LinkedIn founder - might have volunteer experience'
  }
];

profilesWithVolunteer.forEach((profile, index) => {
  console.log(`${index + 1}. ${profile.name}`);
  console.log(`   URL: ${profile.url}`);
  console.log(`   Note: ${profile.note}`);
  console.log('');
});

console.log('💡 Tips for testing volunteer experience:');
console.log('- Look for profiles of people known for charitable work');
console.log('- Non-profit organization leaders often have volunteer experience');
console.log('- Academic professionals often have volunteer work');
console.log('- Remember: Only PUBLIC volunteer experience will be visible');
console.log('- Many users set volunteer experience to private for privacy');

console.log('\n✅ Current system handles:');
console.log('- volunteer (array)');
console.log('- volunteer_experience (array)');
console.log('- volunteering (array)');
console.log('- volunteer_work (array)');
console.log('- Multiple field name mappings');
console.log('- Empty arrays properly');

console.log('\n🔧 The Emil Karimov profile showed:');
console.log('- "UNEC Digital Volunteers Organization" in work experience');
console.log('- But no entries in volunteer_experience array');
console.log('- This suggests volunteer work was listed as job experience instead');
console.log('- This is common - users often list volunteer positions as work experience');
